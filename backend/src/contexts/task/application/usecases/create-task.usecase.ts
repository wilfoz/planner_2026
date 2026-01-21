import { TaskOutput } from '@/contexts/task/application/dto/task.output';
import { TaskRepository } from '@/contexts/task/domain/task.repository';

export class CreateTaskUseCase {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(input: Omit<TaskOutput, 'id' | 'created_at'>): Promise<TaskOutput> {
    const created = await this.tasks.create({
      code: input.code,
      stage: input.stage,
      group: input.group,
      name: input.name,
      unit: input.unit,
    });
    return {
      id: created.props.id,
      code: created.props.code,
      stage: created.props.stage,
      group: created.props.group,
      name: created.props.name,
      unit: created.props.unit,
      created_at: created.props.createdAt,
    };
  }
}

