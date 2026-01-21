import { STATUS_PRODUCTION } from '@prisma/client';

export class ProductionEntity {
  constructor(
    readonly props: {
      id: string;
      status: STATUS_PRODUCTION;
      comments?: string | null;
      start_time?: Date | null;
      final_time?: Date | null;
      task_id: string;
      work_id: string;
      teams: string[];
      towers: string[];
      createdAt: Date;
    },
  ) { }
}

