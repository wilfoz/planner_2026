export class TaskEntity {
  constructor(
    readonly props: {
      id: string;
      code: number;
      stage: string;
      group: string;
      name: string;
      unit: string;
      createdAt: Date;
    },
  ) {}
}

