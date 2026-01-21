export type ProductionStatus = 'EXECUTED' | 'PROGRAMMED' | 'PROGRESS';

export interface Production {
  id: string;
  status: ProductionStatus;
  comments?: string;
  start_time?: string;
  final_time?: string;
  task_id: string;
  teams?: string[];
  towers?: string[];
  work_id: string;
}

export interface CreateProductionDto {
  status?: ProductionStatus;
  comments?: string;
  start_time?: string;
  final_time?: string;
  task_id: string;
  teams?: string[];
  towers?: string[];
  work_id: string;
}

export interface UpdateProductionDto extends Partial<Omit<CreateProductionDto, 'work_id'>> { }
