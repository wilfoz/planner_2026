import { STATUS_EMPLOYEE } from '@prisma/client';

export class Employee {
  constructor(
    readonly props: {
      id: string;
      registration: string;
      full_name: string;
      occupation: string;
      leadership: boolean;
      status: STATUS_EMPLOYEE;
      team_id?: string | null;
      createdAt: Date;
    },
  ) {}
}

