import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, HardHat, Users, Building, Plus, Settings, Trash2, ArrowRight } from 'lucide-angular';
import { WorkService } from '../works/services/work.service';
import { WorkContextService } from '../../core/services/work-context.service';
import { Work } from '../../core/models/work.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent {
  private workService = inject(WorkService);
  private workContextService = inject(WorkContextService);
  private router = inject(Router);

  // Icons
  readonly HardHat = HardHat;
  readonly Users = Users;
  readonly Building = Building;
  readonly Plus = Plus;
  readonly Settings = Settings;
  readonly Trash2 = Trash2;
  readonly ArrowRight = ArrowRight;

  works = signal<Work[]>([]);
  isLoading = signal(true);

  constructor() {
    this.loadWorks();
  }

  loadWorks() {
    this.isLoading.set(true);
    this.workService.getAll().subscribe({
      next: (data) => {
        this.works.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading works', err);
        this.isLoading.set(false);
      }
    });
  }

  selectWork(work: Work) {
    this.workContextService.selectWork(work.id);
    this.router.navigate(['/dashboard']);
  }

  navigateToEdit(id: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/works', id, 'edit']);
  }

  deleteWork(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this work?')) {
      this.workService.delete(id).subscribe({
        next: () => {
          this.loadWorks();
        },
        error: (err) => console.error('Error deleting work', err)
      });
    }
  }
}
