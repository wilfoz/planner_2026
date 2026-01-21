export class Team {
  constructor(
    readonly props: {
      id: string;
      name: string;
      employees: string[];
      equipments: string[];
      createdAt: Date;
    },
  ) {}
}

