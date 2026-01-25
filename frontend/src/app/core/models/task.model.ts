export interface Task {
  id: string;
  code: number;
  stage: string;
  group: string;
  name: string;
  unit: string;
}

export interface CreateTaskDto {
  code: number;
  stage: string;
  group: string;
  name: string;
  unit: string;
  work_id: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> { }
