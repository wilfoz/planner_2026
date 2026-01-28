import { mapTowerToOutput } from '@/contexts/towers/application/usecases/tower-mappers';
import { Tower } from '@/contexts/towers/domain/tower.entity';
import { Foundation } from '@/contexts/foundations/domain/foundation.entity';

describe('mapTowerToOutput', () => {
  const mockDate = new Date('2026-01-20T12:00:00Z');

  it('should map Tower entity to TowerOutput correctly', () => {
    const tower = new Tower({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: 100.5,
      height: 30,
      weight: 5000,
      embargo: 'none',
      work_id: 'work-123',
      createdAt: mockDate,
      foundations: [],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });

    const result = mapTowerToOutput(tower);

    expect(result).toEqual({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: 100.5,
      height: 30,
      weight: 5000,
      embargo: 'none',
      foundations: [],
      created_at: mockDate,
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
      work_id: 'work-123',
    });
  });

  it('should map foundations correctly', () => {
    const foundation = new Foundation({
      id: 'foundation-1',
      project: 'Project A',
      revision: 'Rev 1',
      description: 'Foundation description',
      excavation_volume: 10,
      concrete_volume: 20,
      backfill_volume: 5,
      steel_volume: 2,
      createdAt: mockDate,
    });

    const tower = new Tower({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: null,
      height: null,
      weight: null,
      embargo: null,
      work_id: 'work-123',
      createdAt: mockDate,
      foundations: [foundation],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });

    const result = mapTowerToOutput(tower);

    expect(result.foundations).toHaveLength(1);
    expect(result.foundations[0]!).toEqual({
      id: 'foundation-1',
      project: 'Project A',
      revision: 'Rev 1',
      description: 'Foundation description',
      excavation_volume: 10,
      concrete_volume: 20,
      backfill_volume: 5,
      steel_volume: 2,
      created_at: mockDate,
    });
  });

  it('should handle null optional fields', () => {
    const tower = new Tower({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: null,
      height: null,
      weight: null,
      embargo: null,
      work_id: 'work-123',
      createdAt: mockDate,
      foundations: [],
      deflection: null,
      structureType: null,
      color: null,
      isHidden: false,
    });

    const result = mapTowerToOutput(tower);

    expect(result.distance).toBeNull();
    expect(result.height).toBeNull();
    expect(result.weight).toBeNull();
    expect(result.embargo).toBeNull();
    expect(result.deflection).toBeNull();
    expect(result.structureType).toBeNull();
    expect(result.color).toBeNull();
    expect(result.isHidden).toBe(false);
  });

  it('should handle undefined optional fields in foundations', () => {
    const foundation = new Foundation({
      id: 'foundation-1',
      project: 'Project A',
      revision: 'Rev 1',
      description: 'Foundation description',
      excavation_volume: undefined,
      concrete_volume: undefined,
      backfill_volume: undefined,
      steel_volume: undefined,
      createdAt: mockDate,
    });

    const tower = new Tower({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: 0, lng: 0, altitude: 0 },
      distance: null,
      height: null,
      weight: null,
      embargo: null,
      work_id: 'work-123',
      createdAt: mockDate,
      foundations: [foundation],
      deflection: null,
      structureType: null,
      color: null,
      isHidden: false,
    });

    const result = mapTowerToOutput(tower);

    expect(result.foundations[0]!.excavation_volume).toBeNull();
    expect(result.foundations[0]!.concrete_volume).toBeNull();
    expect(result.foundations[0]!.backfill_volume).toBeNull();
    expect(result.foundations[0]!.steel_volume).toBeNull();
  });
});
