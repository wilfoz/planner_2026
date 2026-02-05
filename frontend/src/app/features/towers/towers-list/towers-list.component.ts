import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TowerImportService } from '../services/tower-import.service';
import { TowerService } from '../services/tower.service';
import { WorkContextService } from '../../../core/services/work-context.service';
import { Tower, CreateTowerDto } from '../../../core/models/tower.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Radio, UploadCloud } from 'lucide-angular';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaginationMeta } from '../../../core/models/collection.model';

@Component({
  selector: 'app-towers-list',
  imports: [RouterLink, LucideAngularModule, PageHeaderComponent, PaginationComponent],
  templateUrl: './towers-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TowersListComponent {
  private towerService = inject(TowerService);
  private towerImportService = inject(TowerImportService);
  private workContextService = inject(WorkContextService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);

  towers = signal<Tower[]>([]);
  meta = signal<PaginationMeta | undefined>(undefined);
  isLoading = signal(false);
  isImporting = signal<boolean>(false);

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;
  readonly TowerIcon = Radio;
  readonly UploadIcon = UploadCloud;

  breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Map', link: '/map' },
    { label: 'Torres' }
  ];

  constructor() {
    effect(() => {
      const workId = this.workContextService.selectedWorkId();
      if (workId) {
        this.loadTowers(workId);
      } else {
        this.towers.set([]);
      }
    });
  }

  loadTowers(workId: string, page: number = 1) {
    this.isLoading.set(true);
    this.towerService.getByWorkId(workId, { page, per_page: 10 }).subscribe({
      next: (response) => {
        this.towers.set(response.data);
        this.meta.set(response.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    const workId = this.workContextService.selectedWorkId();
    if (workId) this.loadTowers(workId, page);
  }

  deleteTower(id: string) {
    if (confirm('Tem certeza que deseja excluir esta torre?')) {
      this.towerService.delete(id).subscribe(() => {
        const workId = this.workContextService.selectedWorkId();
        if (workId) this.loadTowers(workId);
      });
    }
  }

  async importTowers(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isImporting.set(true);
    this.loadingService.start();

    try {
      const towersDto = await this.towerImportService.importFromFile(file);

      let successCount = 0;
      let errorCount = 0;

      for (const dto of towersDto) {
        if (!dto.work_id) {
          console.warn('Tower skipped due to missing work_id', dto);
          errorCount++;
          continue;
        }

        await new Promise((resolve) => {
          this.towerService.create(dto).subscribe({
            next: () => {
              successCount++;
              resolve(true);
            },
            error: (err) => {
              console.error('Error creating tower', err);
              errorCount++;
              resolve(false);
            }
          });
        });
      }

      if (successCount > 0) {
        this.toastService.success(`${successCount} torres importadas com sucesso!`, 'Importação Concluída');
      }

      if (errorCount > 0) {
        this.toastService.warning(`${errorCount} torres falharam ou foram ignoradas.`, 'Atenção');
      }

      const workId = this.workContextService.selectedWorkId();
      if (workId) this.loadTowers(workId);
    } catch (error: any) {
      console.error('Error importing file', error);
      this.toastService.error(error.message || 'Erro ao importar arquivo.', 'Erro na Importação');
    } finally {
      this.isImporting.set(false);
      this.loadingService.stop();
      event.target.value = ''; // Reset input
    }
  }
}
