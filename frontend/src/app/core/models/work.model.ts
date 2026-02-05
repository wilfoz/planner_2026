export interface Work {
  id: string;
  name: string;
  contractor?: string;
  tension?: number;
  extension?: number;
  phases?: number;
  circuits?: number;
  lightning_rod?: number;
  number_of_conductor_cables?: number;
  start_date?: string | Date;
  end_date?: string | Date;
  states?: string[];
}

export interface CreateWorkDto {
  name: string;
  contractor?: string;
  tension?: number;
  extension?: number;
  phases?: number;
  circuits?: number;
  lightning_rod?: number;
  number_of_conductor_cables?: number;
  start_date?: string | Date;
  end_date?: string | Date;
  states?: string[];
}

export interface UpdateWorkDto extends Partial<CreateWorkDto> { }
