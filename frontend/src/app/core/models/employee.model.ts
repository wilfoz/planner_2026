export type EmployeeStatus = 'ACTIVE' | 'AWAY';

export interface Employee {
  id: string;
  registration: string;
  full_name: string;
  occupation: string;
  leadership: boolean;
  status: EmployeeStatus;
  team_id?: string;
}

export interface CreateEmployeeDto {
  registration: string;
  full_name: string;
  occupation: string;
  leadership: boolean;
  status?: EmployeeStatus;
  team_id?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> { }
