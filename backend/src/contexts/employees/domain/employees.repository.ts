import { Employee } from '@/contexts/employees/domain/employee.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type EmployeesListResult = { total: number; items: Employee[] };

export interface EmployeesRepository {
  create(input: Omit<Employee['props'], 'id' | 'createdAt'>): Promise<Employee>;
  findById(id: string): Promise<Employee | null>;
  list(input: PageInput): Promise<EmployeesListResult>;
  update(id: string, input: Partial<Omit<Employee['props'], 'id' | 'createdAt'>>): Promise<Employee>;
  delete(id: string): Promise<void>;
}

export const EMPLOYEES_REPOSITORY = Symbol('EMPLOYEES_REPOSITORY');

