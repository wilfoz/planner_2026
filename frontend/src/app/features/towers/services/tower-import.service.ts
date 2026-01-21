import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { CreateTowerDto } from '../../../core/models/tower.model';

@Injectable({
  providedIn: 'root'
})
export class TowerImportService {

  constructor() { }

  async importFromFile(file: File): Promise<CreateTowerDto[]> {
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
            return {
              code: row.code,
              tower_number: row.tower ? String(row.tower) : '',
              type: row.type ? String(row.type) : '',
              coordinates: {
                lat: row.lat || 0,
                lng: row.lng || 0,
                altitude: row.altitude || 0
              },
              distance: row.distance,
              height: row.height,
              weight: row.weight,
              work_id: row.work_id || '' // Assuming work_id might be in the excel, or we handle it later
            };
          }).filter(t => t.code && t.tower_number); // Basic validation

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
