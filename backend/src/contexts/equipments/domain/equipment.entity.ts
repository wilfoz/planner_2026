import { STATUS_EQUIPMENT } from '@prisma/client';

export class Equipment {
  constructor(
    readonly props: {
      id: string;
      registration: string;
      model: string;
      manufacturer: string;
      license_plate: string;
      provider: string;
      status: STATUS_EQUIPMENT;
      team_id?: string | null;
      createdAt: Date;
    },
  ) {}
}

