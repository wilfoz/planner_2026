import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapboxMapComponent } from '../../shared/components/mapbox-map/mapbox-map.component';
import { TowerMap } from '../../shared/components/mapbox-map/models';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, MapboxMapComponent],
  template: `
    <div class="h-screen w-full bg-zinc-900 p-4 relative">
      <app-mapbox-map
        #mapboxMap
        [projectId]="projectId"
        [show3D]="true"
        (towerSelect)="onTowerSelect($event)"
        (mapReady)="onMapReady()"
        (error)="onError($event)"
      />

      <!-- Tower Filter Overlay -->
      <div class="absolute top-8 left-8 z-20 bg-zinc-800/90 backdrop-blur p-4 rounded-xl border border-white/10 shadow-xl w-64">
        <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Filtrar Torre</label>
        <select 
          class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          (change)="onTowerFilterChange($event, mapboxMap)"
        >
          <option value="">Selecione uma torre...</option>
          @for (tower of mapboxMap.towers(); track tower.id) {
            <option [value]="tower.id">
              {{ tower.name }} ({{ tower.structureType }})
            </option>
          }
        </select>
      </div>
    </div>
  `
})
export class MapPageComponent {
  // Hardcoded for demo/dev purposes for now, normally would come from route param
  projectId = '00000000-0000-0000-0000-000000000000';

  onTowerFilterChange(event: Event, mapComponent: MapboxMapComponent) {
    const select = event.target as HTMLSelectElement;
    const towerId = select.value;
    if (!towerId) return;

    const tower = mapComponent.towers().find(t => t.id === towerId);
    if (tower) {
      console.log('Flying to tower:', tower.name);
      mapComponent.flyTo(tower.lat, tower.lng, 18); // Zoom 18 for high visibility
    }
  }

  onTowerSelect(tower: TowerMap | null) {
    console.log('Tower selected:', tower?.name);
  }

  onMapReady() {
    console.log('Map and 3D layers ready');
  }

  onError(message: string) {
    console.error('Map error:', message);
  }
}
