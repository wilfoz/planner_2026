import { TaskOutput } from '@/contexts/task/application/dto/task.output';
import { TaskRepository } from '@/contexts/task/domain/task.repository';
import { buildPaginationMeta, normalizePageInput, PageInput } from '@/shared/pagination/pagination';
import { CollectionPresenter, PaginationMetaPresenter } from '@/shared/presenters/collection.presenter';

export class ListTaskUseCase {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(input: Partial<PageInput>): Promise<CollectionPresenter<TaskOutput>> {
    const pageInput = normalizePageInput(input);
    const result = await this.tasks.list(pageInput);

    const meta = new PaginationMetaPresenter(
      buildPaginationMeta({ page: pageInput.page, per_page: pageInput.per_page, total: result.total }),
    );
    const data: TaskOutput[] = result.items.map((t) => ({
      id: t.props.id,
      code: t.props.code,
      stage: t.props.stage,
      group: t.props.group,
      name: t.props.name,
      unit: t.props.unit,
      created_at: t.props.createdAt,
    }));

    return new CollectionPresenter({ meta, data });
  }
}

