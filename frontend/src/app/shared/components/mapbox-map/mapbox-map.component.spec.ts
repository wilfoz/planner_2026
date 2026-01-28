import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapboxMapComponent } from './mapbox-map.component';
import { MapDataService } from './services/map-data.service';
import { MapCacheService } from './services/map-cache.service';
import { Tower3DLayerService } from './layers/tower-3d-layer.service';
import { CableLayerService } from './layers/cable-layer.service';
import { of, Subject } from 'rxjs';
import { Signal, signal } from '@angular/core';

// Mock Services
class MockMapDataService {
  loading$ = of(false); // Observable as per component usage
  getMapData() { return of({ data: { towers: [], spans: [], cableSettings: {}, mapConfig: { center: { lat: 0, lng: 0 }, zoom: 10 }, userPermissions: { canUpdate: true } } }); }
  updateTower() { return of({}); }
}

class MockMapCacheService {
  get() { return Promise.resolve(null); }
  set() { return Promise.resolve(); }
}

class MockTower3DLayerService {
  getLayers() { return []; }
}

class MockCableLayerService {
  getLayers() { return []; }
}

describe('MapboxMapComponent', () => {
  let component: MapboxMapComponent;
  let fixture: ComponentFixture<MapboxMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapboxMapComponent],
      providers: [
        { provide: MapDataService, useClass: MockMapDataService },
        { provide: MapCacheService, useClass: MockMapCacheService },
        { provide: Tower3DLayerService, useClass: MockTower3DLayerService },
        { provide: CableLayerService, useClass: MockCableLayerService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MapboxMapComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('projectId', 'test-project');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial signals set', () => {
    expect(component.towers()).toEqual([]);
    expect(component.spans()).toEqual([]);
  });
});
