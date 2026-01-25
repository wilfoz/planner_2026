export interface Work {
  id: string;
  name: string;
  tension?: number;
  extension?: number;
  phases?: number;
  circuits?: number;
  lightning_rod?: number;
  start_date?: string | Date;
  end_date?: string | Date;
  states?: string[];
}

export interface CreateWorkDto {
  name: string;
  tension?: number;
  extension?: number;
  phases?: number;
  circuits?: number;
  lightning_rod?: number;
  start_date?: string | Date;
  end_date?: string | Date;
  states?: string[];
}

export interface UpdateWorkDto extends Partial<CreateWorkDto> { }
