export type EquipmentStatus = 'ACTIVE' | 'MAINTENANCE' | 'DEMOBILIZED';

export interface Equipment {
  id: string;
  registration: string;
  model: string;
  manufacturer: string;
  license_plate: string;
  provider: string;
  status: EquipmentStatus;
  team_id?: string;
}

export interface CreateEquipmentDto {
  registration: string;
  model: string;
  manufacturer: string;
  license_plate: string;
  provider: string;
  status?: EquipmentStatus;
  team_id?: string;
}

export interface UpdateEquipmentDto extends Partial<CreateEquipmentDto> { }
