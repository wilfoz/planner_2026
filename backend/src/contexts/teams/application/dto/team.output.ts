export type TeamOutput = {
  id: string;
  name: string;
  employees: { id: string; registration: string; full_name: string; occupation: string }[];
  equipments: { id: string; model: string; manufacturer: string; license_plate: string }[];
  created_at: Date;
};

