import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { WorkService } from '../services/work.service';
import { WorkContextService } from '../../../core/services/work-context.service';
import { Work } from '../../../core/models/work.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-works-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './works-list.component.html',
  styles: ``
})
export class WorksListComponent {
  private workService = inject(WorkService);
  private workContextService = inject(WorkContextService);
  private router = inject(Router);

  works = signal<Work[]>([]);
  selectedWorkId = this.workContextService.selectedWorkId;

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;
  readonly CheckIcon = CheckCircle;

  constructor() {
    this.loadWorks();
  }

  loadWorks() {
    this.workService.getAll().subscribe({
      next: (data) => {
        console.log('Works loaded:', data);
        this.works.set(data);
      },
      error: (err) => console.error('Error loading works:', err)
    });
  }

  selectWork(id: string) {
    this.workContextService.selectWork(id);
    // Optional: Auto-redirect to dashboard or towers upon selection
    // this.router.navigate(['/dashboard']); 
  }

  deleteWork(id: string) {
    if (confirm('Are you sure you want to delete this work?')) {
      this.workService.delete(id).subscribe(() => {
        if (this.selectedWorkId() === id) {
          this.workContextService.clearWork();
        }
        this.loadWorks();
      });
    }
  }
}
