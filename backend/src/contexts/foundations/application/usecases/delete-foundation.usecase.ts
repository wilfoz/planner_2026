import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';

export class DeleteFoundationUseCase {
  constructor(private readonly foundations: FoundationsRepository) {}

  async execute(input: { id: string }): Promise<void> {
    await this.foundations.delete(input.id);
  }
}

