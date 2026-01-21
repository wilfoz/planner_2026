
export class Work {
  constructor(
    readonly props: {
      id: string;
      name: string;
      tension?: string | null;
      extension?: string | null;
      start_date?: Date | null;
      end_date?: Date | null;
      createdAt: Date;
    },
  ) { }
}
