export interface Team {
  id: string;
  name: string;
  employees?: string[];
  equipments?: string[];
}

export interface CreateTeamDto {
  name: string;
  employees?: string[];
  equipments?: string[];
}

export interface UpdateTeamDto extends Partial<CreateTeamDto> { }
