import { STATUS_EMPLOYEE } from '@prisma/client';

export type EmployeeOutput = {
  id: string;
  registration: string;
  full_name: string;
  occupation: string;
  leadership: boolean;
  status: STATUS_EMPLOYEE;
  team_id?: string | null;
  created_at: Date;
};

