import { ProductionEntity } from '@/contexts/productions/domain/production.entity';
import { ProductionOutput } from '@/contexts/productions/application/dto/production.output';

export function mapProductionToOutput(p: ProductionEntity): ProductionOutput {
  return {
    id: p.props.id,
    status: p.props.status,
    comments: p.props.comments ?? null,
    start_time: p.props.start_time ?? null,
    final_time: p.props.final_time ?? null,
    task_id: p.props.task_id,
    work_id: p.props.work_id,
    teams: p.props.teams,
    towers: p.props.towers,
    created_at: p.props.createdAt,
  };
}

