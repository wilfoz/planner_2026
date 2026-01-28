export type SimpleEmployee = { id: string; registration: string; full_name: string; occupation: string; };
export type SimpleEquipment = { id: string; model: string; manufacturer: string; license_plate: string; };

export class Team {
  constructor(
    readonly props: {
      id: string;
      name: string;
      employees: SimpleEmployee[];
      equipments: SimpleEquipment[];
      createdAt: Date;
    },
  ) { }
}

