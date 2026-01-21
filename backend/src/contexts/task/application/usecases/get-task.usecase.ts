import { TaskOutput } from '@/contexts/task/application/dto/task.output';
import { TaskRepository } from '@/contexts/task/domain/task.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetTaskUseCase {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(input: { id: string }): Promise<TaskOutput> {
    const task = await this.tasks.findById(input.id);
    if (!task) throw new NotFoundError('Task not found');

    return {
      id: task.props.id,
      code: task.props.code,
      stage: task.props.stage,
      group: task.props.group,
      name: task.props.name,
      unit: task.props.unit,
      created_at: task.props.createdAt,
    };
  }
}

