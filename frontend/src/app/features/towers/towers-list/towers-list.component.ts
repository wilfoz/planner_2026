import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TowerImportService } from '../services/tower-import.service';
import { TowerService } from '../services/tower.service';
import { Tower, CreateTowerDto } from '../../../core/models/tower.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Radio, UploadCloud } from 'lucide-angular';

@Component({
  selector: 'app-towers-list',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './towers-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TowersListComponent {
  private towerService = inject(TowerService);
  private towerImportService = inject(TowerImportService);

  towers = signal<Tower[]>([]);
  isImporting = signal<boolean>(false);

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;
  readonly TowerIcon = Radio;
  readonly UploadIcon = UploadCloud;

  constructor() {
    this.loadTowers();
  }

  loadTowers() {
    this.towerService.getAll().subscribe(data => this.towers.set(data));
  }

  deleteTower(id: string) {
    if (confirm('Tem certeza que deseja excluir esta torre?')) {
      this.towerService.delete(id).subscribe(() => this.loadTowers());
    }
  }

  async importTowers(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isImporting.set(true);
    try {
      const towersDto = await this.towerImportService.importFromFile(file);

      // Create towers sequentially to handle potential errors better or use forkJoin if concurrency is safe
      // For now, let's do it simply
      let importedCount = 0;
      for (const dto of towersDto) {
        // You might want to handle work_id here if it's not in the excel
        // For now assuming it is or backend handles it (backend marks it required though)
        // If work_id is missing, we might need a dialog or default value. 
        // Let's assume for now the excel has it or we pass a default if needed.
        if (!dto.work_id) {
          console.warn('Tower skipped due to missing work_id', dto);
          continue;
        }

        await new Promise((resolve, reject) => {
          this.towerService.create(dto).subscribe({
            next: () => {
              importedCount++;
              resolve(true);
            },
            error: (err) => {
              console.error('Error creating tower', err);
              resolve(false); // Continue even if one fails
            }
          });
        });
      }

      alert(`${importedCount} torres importadas com sucesso!`);
      this.loadTowers();
    } catch (error) {
      console.error('Error importing file', error);
      alert('Erro ao importar arquivo.');
    } finally {
      this.isImporting.set(false);
      event.target.value = ''; // Reset input
    }
  }
}
