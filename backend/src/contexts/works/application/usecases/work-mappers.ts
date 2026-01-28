
import { WorkOutput } from '@/contexts/works/application/dto/work.output';
import { Work } from '@/contexts/works/domain/work.entity';

export function mapWorkToOutput(work: Work): WorkOutput {
  return {
    id: work.props.id,
    name: work.props.name,
    contractor: work.props.contractor ?? null,
    tension: work.props.tension ?? null,
    extension: work.props.extension ?? null,
    phases: work.props.phases ?? null,
    circuits: work.props.circuits ?? null,
    lightning_rod: work.props.lightning_rod ?? null,
    number_of_conductor_cables: work.props.number_of_conductor_cables ?? null,
    states: work.props.states ?? [],
    start_date: work.props.start_date ?? null,
    end_date: work.props.end_date ?? null,
    createdAt: work.props.createdAt,
  };
}
