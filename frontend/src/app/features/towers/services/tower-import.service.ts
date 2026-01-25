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

          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

          const towers: CreateTowerDto[] = jsonData.map((row: any) => {
            let lat = row.lat || 0;
            let lng = row.lng || 0;

            // Check if UTM coordinates are provided
            if (row.utm_easting && row.utm_northing) {
              const zone = row.utm_zone || defaultZone;
              const band = row.utm_band || 'K'; // Default band if missing? 'K' is roughly brazil? 
              // Wait, Brazil is mostly M, L, K. 'K' is around Minas/Bahia. 'J' is South.
              // Actually, utmToLatLon logic for South Hemisphere:
              // y = (band >= 'N') ? northing : northing - 10000000;
              // If we are in Southern Hemisphere (Brazil), northing is > 0 but we treat it differently?
              // Standard UTM northing in South is 10,000,000 at equator decreasing southwards.
              // Logic in convert_utm.js: const y = (band >= 'N') ? northing : northing - 10000000;
              // Wait, if input northing is standard UTM "Southern", it is usually large (e.g., 7,000,000).
              // If the formula expects "true" y relative to equator, for south it's negative.
              // If (band >= 'N') is false (South), y = northing - 10,000,000.
              // So if northing is 7,500,000, y = -2,500,000. This is correct.
              // So we definitely need to imply South Hemisphere for Brazil if band is missing.
              // 'K', 'L', 'M' are all < 'N'. So 'K' works to trigger South logic.

              const conversion = utmToLatLon(
                Number(row.utm_easting),
                Number(row.utm_northing),
                zone,
                band
              );
              lat = conversion.lat;
              lng = conversion.lng;
            }

            return {
              code: row.code,
              tower_number: row.tower ? String(row.tower) : '',
              type: row.type ? String(row.type) : '',
              coordinates: {
                lat: lat,
                lng: lng,
                altitude: row.altitude || 0
              },
              distance: row.distance,
              height: row.height,
              weight: row.weight,
              work_id: workId
            };
          }).filter(t => t.code && t.tower_number);

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
