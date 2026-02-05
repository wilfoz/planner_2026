
export class Work {
  constructor(
    readonly props: {
      id: string;
      name: string;
      contractor?: string | null;
      tension?: number | null;
      extension?: number | null;
      phases?: number | null;
      circuits?: number | null;
      lightning_rod?: number | null;
      number_of_conductor_cables?: number | null;
      start_date?: Date | null;
      end_date?: Date | null;
      states: string[];
      createdAt: Date;
    },
  ) { }
}
