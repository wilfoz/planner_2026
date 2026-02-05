import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductionService } from '../services/production.service';
import { WorkContextService } from '../../../core/services/work-context.service';
import { Production } from '../../../core/models/production.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Activity } from 'lucide-angular';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaginationMeta } from '../../../core/models/collection.model';

@Component({
  selector: 'app-productions-list',
  imports: [RouterLink, LucideAngularModule, PaginationComponent],
  templateUrl: './productions-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionsListComponent {
  private productionService = inject(ProductionService);
  private workContextService = inject(WorkContextService);

  productions = signal<Production[]>([]);
  meta = signal<PaginationMeta | undefined>(undefined);
  isLoading = signal(false);

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;

  constructor() {
    effect(() => {
      const workId = this.workContextService.selectedWorkId();
      if (workId) {
        this.loadProductions(workId);
      } else {
        this.productions.set([]);
      }
    });
  }

  loadProductions(workId: string, page: number = 1) {
    this.isLoading.set(true);
    this.productionService.getByWorkId(workId, { page, per_page: 10 }).subscribe({
      next: (response) => {
        this.productions.set(response.data);
        this.meta.set(response.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    const workId = this.workContextService.selectedWorkId();
    if (workId) this.loadProductions(workId, page);
  }

  deleteProduction(id: string) {
    if (confirm('Tem certeza que deseja excluir esta produção?')) {
      this.productionService.delete(id).subscribe(() => {
        const workId = this.workContextService.selectedWorkId();
        if (workId) this.loadProductions(workId);
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PROGRAMMED': 'bg-blue-500/20 text-blue-400',
      'EXECUTED': 'bg-green-500/20 text-green-400',
      'JUSTIFIED': 'bg-yellow-500/20 text-yellow-400'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PROGRAMMED': 'Programado',
      'EXECUTED': 'Executado',
      'JUSTIFIED': 'Justificado'
    };
    return labels[status] || status;
  }
}
