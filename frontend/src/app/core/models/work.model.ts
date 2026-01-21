export interface Work {
  id: string;
  name: string;
  tension?: string;
  extension?: string;
  start_date?: string | Date;
  end_date?: string | Date;
}

export interface CreateWorkDto {
  name: string;
  tension?: string;
  extension?: string;
  start_date?: string | Date;
  end_date?: string | Date;
}

export interface UpdateWorkDto extends Partial<CreateWorkDto> { }
