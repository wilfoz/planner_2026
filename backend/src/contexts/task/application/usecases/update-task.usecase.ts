import { TaskOutput } from '@/contexts/task/application/dto/task.output';
import { TaskRepository } from '@/contexts/task/domain/task.repository';

export class UpdateTaskUseCase {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(input: Partial<Omit<TaskOutput, 'created_at'>> & { id: string }): Promise<TaskOutput> {
    const updated = await this.tasks.update(input.id, {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.stage !== undefined ? { stage: input.stage } : {}),
      ...(input.group !== undefined ? { group: input.group } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
    });

    return {
      id: updated.props.id,
      code: updated.props.code,
      stage: updated.props.stage,
      group: updated.props.group,
      name: updated.props.name,
      unit: updated.props.unit,
      created_at: updated.props.createdAt,
    };
  }
}

