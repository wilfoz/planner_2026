import { TaskEntity } from '@/contexts/task/domain/task.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type TaskListResult = { total: number; items: TaskEntity[] };

export interface TaskRepository {
  create(input: Omit<TaskEntity['props'], 'id' | 'createdAt'>): Promise<TaskEntity>;
  findById(id: string): Promise<TaskEntity | null>;
  list(input: PageInput): Promise<TaskListResult>;
  update(id: string, input: Partial<Omit<TaskEntity['props'], 'id' | 'createdAt'>>): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

