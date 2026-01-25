import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { CreateTowerDto } from '../../../core/models/tower.model';
import { WorkService } from '../../works/services/work.service';
import { WorkContextService } from '../../../core/services/work-context.service';
import { utmToLatLon, getZoneFromState } from '../../../shared/utils/convert-utm';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TowerImportService {
  private workService = inject(WorkService);
  private workContextService = inject(WorkContextService);

  constructor() { }

  async importFromFile(file: File): Promise<CreateTowerDto[]> {
    const workId = this.workContextService.selectedWorkId();
    if (!workId) {
      throw new Error('Nenhuma obra selecionada para importação.');
    }

    // Fetch full work details to get the state
    const work = await firstValueFrom(this.workService.getById(workId));
    // Assuming the first state is the primary one for zone determination
    // If work has no states, we might default or warn.
    const primaryState = work.states && work.states.length > 0 ? work.states[0] : 'SP';
    const defaultZone = getZoneFromState(primaryState);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Use 'header: 1' to get raw arrays of rows, so we can process headers manually
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (rows.length < 2) {
            throw new Error('O arquivo parece estar vazio ou sem cabeçalho.');
          }

          // Process headers: normalize to lowercase and remove special chars
          const rawHeaders = rows[0] as string[];
          const headers = rawHeaders.map(h =>
            h ? h.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '_') : ''
          );

          // Remove header row
          const projectRows = rows.slice(1);

          const towers: CreateTowerDto[] = [];

          projectRows.forEach((row) => {
            // Create a map for this row based on normalized headers
            const rowMap: any = {};
            headers.forEach((h, index) => {
              if (h) rowMap[h] = row[index];
            });

            // Mapping variations
            // Helper to parse string number with comma or dot
            const parseNumber = (val: any): number => {
              if (typeof val === 'number') return val;
              if (!val) return 0;
              // Replace comma with dot and remove non-numeric chars (except dot and minus)
              const str = String(val).replace(',', '.');
              return parseFloat(str) || 0;
            };

            // Mapping variations
            const code = rowMap['code'] || rowMap['codigo'] || rowMap['torre_id'];
            const towerNum = rowMap['tower'] || rowMap['tower_number'] || rowMap['tower_numb'] || rowMap['torre'] || rowMap['numero'];
            const type = rowMap['type'] || rowMap['tipo'];
            const height = parseNumber(rowMap['height'] || rowMap['altura']);
            const weight = parseNumber(rowMap['weight'] || rowMap['peso']);
            const distance = parseNumber(rowMap['distance'] || rowMap['distancia'] || rowMap['vão'] || rowMap['vao']);

            // Coordinate logic
            let inputLat = parseNumber(rowMap['lat'] || rowMap['latitude']);
            let inputLng = parseNumber(rowMap['lng'] || rowMap['longitude'] || rowMap['long']);

            // Check if explicit UTM columns exist, otherwise check if lat/lng look like UTM
            let finalLat = 0;
            let finalLng = 0;
            let altitude = parseNumber(rowMap['altitude'] || rowMap['alt']);

            const isExplicitUtm = (rowMap['utm_easting'] || rowMap['easting'] || rowMap['x']) && (rowMap['utm_northing'] || rowMap['northing'] || rowMap['y']);

            if (isExplicitUtm) {
              const easting = parseNumber(rowMap['utm_easting'] || rowMap['easting'] || rowMap['x']);
              const northing = parseNumber(rowMap['utm_northing'] || rowMap['northing'] || rowMap['y']);
              const zone = rowMap['utm_zone'] || rowMap['zone'] || rowMap['zona'] || defaultZone;
              const band = rowMap['utm_band'] || rowMap['band'] || 'K';

              const conversion = utmToLatLon(easting, northing, zone, band);
              finalLat = conversion.lat;
              finalLng = conversion.lng;
            } else {
              // Heuristic: If coordinates are huge, they are UTM
              // Latitude is usually < 90, Longitude < 180.
              // UTM Northings are millions (e.g., 8,000,000), Eastings are hundreds of thousands (e.g., 200,000).

              // Check if values resemble UTM
              const lookLikeUtm = Math.abs(inputLat) > 180 || Math.abs(inputLng) > 180;

              if (lookLikeUtm) {
                // deduce which is Northing and Easting
                // Northing is usually larger (millions) in Brazil (Suth Hem) or 0-10M globally.
                // Easting is usually 100k-900k.
                // From user screenshot: Lat col = 238331 (Easting-ish), Lng col = 8703834 (Northing-ish)

                let easting = 0;
                let northing = 0;

                if (Math.abs(inputLat) > Math.abs(inputLng)) {
                  northing = inputLat;
                  easting = inputLng;
                } else {
                  northing = inputLng;
                  easting = inputLat;
                }

                // User example: Lat=238331(E), Lng=8703834(N). 
                // Logic above: Northing=8M, Easting=238k. Correct.

                const zone = rowMap['utm_zone'] || rowMap['zone'] || rowMap['zona'] || defaultZone;
                const band = rowMap['utm_band'] || rowMap['band'] || 'K';

                const conversion = utmToLatLon(easting, northing, zone, band);
                finalLat = conversion.lat;
                finalLng = conversion.lng;
              } else {
                // Assume standard lat/lon
                finalLat = inputLat;
                finalLng = inputLng;
              }
            }

            if (code && towerNum) {
              towers.push({
                code: Number(code),
                tower: String(towerNum),
                type: type ? String(type) : '',
                coordinates: {
                  lat: finalLat,
                  lng: finalLng,
                  altitude: altitude
                },
                distance: distance,
                height: height,
                weight: weight,
                work_id: workId
              });
            }
          });

          if (towers.length === 0) {
            throw new Error('Nenhuma torre válida encontrada. Verifique os cabeçalhos (Code, Tower, etc).');
          }

          resolve(towers);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }
}
