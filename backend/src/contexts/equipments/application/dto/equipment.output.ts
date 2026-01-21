import { STATUS_EQUIPMENT } from '@prisma/client';

export type EquipmentOutput = {
  id: string;
  registration: string;
  model: string;
  manufacturer: string;
  license_plate: string;
  provider: string;
  status: STATUS_EQUIPMENT;
  team_id?: string | null;
  created_at: Date;
};

