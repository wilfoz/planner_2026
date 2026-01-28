import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
import { WorkContextService } from '../../../core/services/work-context.service';
import { Task } from '../../../core/models/task.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, ClipboardList } from 'lucide-angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaginationMeta } from '../../../core/models/collection.model';

@Component({
  selector: 'app-tasks-list',
  imports: [RouterLink, LucideAngularModule, PageHeaderComponent, PaginationComponent],
  templateUrl: './tasks-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksListComponent {
  private taskService = inject(TaskService);
  private workContextService = inject(WorkContextService);

  tasks = signal<Task[]>([]);
  meta = signal<PaginationMeta | undefined>(undefined);
  isLoading = signal(false);

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;

  breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Map', link: '/map' },
    { label: 'Tarefas' }
  ];

  constructor() {
    effect(() => {
      const workId = this.workContextService.selectedWorkId();
      if (workId) {
        this.loadTasks(workId);
      } else {
        this.tasks.set([]);
      }
    });
  }

  loadTasks(workId: string, page: number = 1) {
    console.log('Loading tasks for work:', workId, 'page:', page);
    this.isLoading.set(true);
    this.taskService.getByWorkId(workId, { page, per_page: 10 }).subscribe({
      next: (response) => {
        console.log('Tasks loaded:', response);
        this.tasks.set(response.data);
        this.meta.set(response.meta);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number) {
    const workId = this.workContextService.selectedWorkId();
    if (workId) this.loadTasks(workId, page);
  }

  deleteTask(id: string) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.taskService.delete(id).subscribe(() => {
        const workId = this.workContextService.selectedWorkId();
        if (workId) this.loadTasks(workId);
      });
    }
  }
}
