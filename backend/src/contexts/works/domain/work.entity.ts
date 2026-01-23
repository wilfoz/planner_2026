
export class Work {
  constructor(
    readonly props: {
      id: string;
      name: string;
      tension?: number | null;
      extension?: number | null;
      phases?: number | null;
      circuits?: number | null;
      lightning_rod?: number | null;
      start_date?: Date | null;
      end_date?: Date | null;
      createdAt: Date;
    },
  ) { }
}
