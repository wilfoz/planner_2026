export interface Team {
  id: string;
  name: string;
  employees?: { id: string; registration: string; full_name: string; occupation: string }[];
  equipments?: { id: string; model: string; manufacturer: string; license_plate: string }[];
}

export interface CreateTeamDto {
  name: string;
  employees?: string[];
  equipments?: string[];
}

export interface UpdateTeamDto extends Partial<CreateTeamDto> { }
