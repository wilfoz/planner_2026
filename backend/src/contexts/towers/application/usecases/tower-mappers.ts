import { FoundationOutput } from '@/contexts/foundations/application/dto/foundation.output';
import { Tower } from '@/contexts/towers/domain/tower.entity';
import { TowerOutput } from '@/contexts/towers/application/dto/tower.output';

export function mapTowerToOutput(t: Tower): TowerOutput {
  const foundations: FoundationOutput[] = t.props.foundations.map((f) => ({
    id: f.props.id,
    project: f.props.project,
    revision: f.props.revision,
    description: f.props.description,
    excavation_volume: f.props.excavation_volume ?? null,
    concrete_volume: f.props.concrete_volume ?? null,
    backfill_volume: f.props.backfill_volume ?? null,
    steel_volume: f.props.steel_volume ?? null,
    created_at: f.props.createdAt,
  }));

  return {
    id: t.props.id,
    code: t.props.code,
    tower_number: t.props.tower_number,
    type: t.props.type,
    coordinates: t.props.coordinates,
    distance: t.props.distance ?? null,
    height: t.props.height ?? null,
    weight: t.props.weight ?? null,
    embargo: t.props.embargo ?? null,
    deflection: t.props.deflection ?? null,
    structureType: t.props.structureType ?? null,
    color: t.props.color ?? null,
    isHidden: t.props.isHidden,
    work_id: t.props.work_id,
    foundations,
    created_at: t.props.createdAt,
  };
}

