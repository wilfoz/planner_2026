export class Foundation {
  constructor(
    readonly props: {
      id: string;
      project: string;
      revision: string;
      description: string;
      excavation_volume?: number | null;
      concrete_volume?: number | null;
      backfill_volume?: number | null;
      steel_volume?: number | null;
      createdAt: Date;
    },
  ) {}
}

