export class User {
  constructor(
    readonly props: {
      id: string;
      name?: string | null;
      email: string;
      password: string;
      createdAt: Date;
    },
  ) {}
}

