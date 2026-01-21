import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkService } from '../services/work.service';
import { Work } from '../../../core/models/work.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye } from 'lucide-angular';

@Component({
  selector: 'app-works-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './works-list.component.html',
  styles: ``
})
export class WorksListComponent {
  private workService = inject(WorkService);

  works = signal<Work[]>([]);
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;

  constructor() {
    this.loadWorks();
  }

  loadWorks() {
    this.workService.getAll().subscribe(data => this.works.set(data));
  }

  deleteWork(id: string) {
    if (confirm('Are you sure you want to delete this work?')) {
      this.workService.delete(id).subscribe(() => this.loadWorks());
    }
  }
}
