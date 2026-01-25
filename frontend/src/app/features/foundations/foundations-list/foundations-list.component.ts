import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FoundationService } from '../services/foundation.service';
import { Foundation } from '../../../core/models/foundation.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Box } from 'lucide-angular';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaginationMeta } from '../../../core/models/collection.model';

@Component({
  selector: 'app-foundations-list',
  imports: [RouterLink, LucideAngularModule, PaginationComponent],
  templateUrl: './foundations-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoundationsListComponent {
  private foundationService = inject(FoundationService);

  foundations = signal<Foundation[]>([]);
  meta = signal<PaginationMeta | undefined>(undefined);
  isLoading = signal(false);

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;

  constructor() {
    this.loadFoundations();
  }

  loadFoundations(page: number = 1) {
    this.isLoading.set(true);
    this.foundationService.getAll({ page, per_page: 10 }).subscribe({
      next: (response) => {
        this.foundations.set(response.data);
        this.meta.set(response.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    this.loadFoundations(page);
  }

  deleteFoundation(id: string) {
    if (confirm('Tem certeza que deseja excluir esta fundação?')) {
      this.foundationService.delete(id).subscribe(() => this.loadFoundations());
    }
  }
}
