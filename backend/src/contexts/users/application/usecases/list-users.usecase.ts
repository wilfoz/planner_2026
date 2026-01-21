import { UserOutput } from '@/contexts/users/application/dto/user.output';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { buildPaginationMeta, normalizePageInput, PageInput } from '@/shared/pagination/pagination';
import { CollectionPresenter, PaginationMetaPresenter } from '@/shared/presenters/collection.presenter';

export class ListUsersUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(input: Partial<PageInput>): Promise<CollectionPresenter<UserOutput>> {
    const pageInput = normalizePageInput(input);
    const result = await this.users.list(pageInput);

    const meta = new PaginationMetaPresenter(buildPaginationMeta({ page: pageInput.page, per_page: pageInput.per_page, total: result.total }));
    const data: UserOutput[] = result.items.map((u) => ({
      id: u.props.id,
      name: u.props.name ?? null,
      email: u.props.email,
      created_at: u.props.createdAt,
    }));

    return new CollectionPresenter({ meta, data });
  }
}

