import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';

export class DeleteProductionUseCase {
  constructor(private readonly productions: ProductionsRepository) {}

  async execute(input: { id: string }): Promise<void> {
    await this.productions.delete(input.id);
  }
}

