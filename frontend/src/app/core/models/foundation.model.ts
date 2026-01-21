export interface Foundation {
  id: string;
  project: string;
  revision: string;
  description: string;
  excavation_volume?: number;
  concrete_volume?: number;
  backfill_volume?: number;
  steel_volume?: number;
}

export interface CreateFoundationDto {
  project: string;
  revision: string;
  description: string;
  excavation_volume?: number;
  concrete_volume?: number;
  backfill_volume?: number;
  steel_volume?: number;
}

export interface UpdateFoundationDto extends Partial<CreateFoundationDto> { }
