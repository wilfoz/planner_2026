import { TaskRepository } from '@/contexts/task/domain/task.repository';

export class DeleteTaskUseCase {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(input: { id: string }): Promise<void> {
    await this.tasks.delete(input.id);
  }
}

