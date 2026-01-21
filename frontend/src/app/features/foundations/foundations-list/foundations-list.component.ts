import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FoundationService } from '../services/foundation.service';
import { Foundation } from '../../../core/models/foundation.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Box } from 'lucide-angular';

@Component({
  selector: 'app-foundations-list',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './foundations-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoundationsListComponent {
  private foundationService = inject(FoundationService);

  foundations = signal<Foundation[]>([]);
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;

  constructor() {
    this.loadFoundations();
  }

  loadFoundations() {
    this.foundationService.getAll().subscribe(data => this.foundations.set(data));
  }

  deleteFoundation(id: string) {
    if (confirm('Tem certeza que deseja excluir esta fundação?')) {
      this.foundationService.delete(id).subscribe(() => this.loadFoundations());
    }
  }
}
