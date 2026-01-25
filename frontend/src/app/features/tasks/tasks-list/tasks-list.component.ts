import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
import { WorkContextService } from '../../../core/services/work-context.service';
import { Task } from '../../../core/models/task.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, ClipboardList } from 'lucide-angular';

@Component({
  selector: 'app-tasks-list',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './tasks-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksListComponent {
  private taskService = inject(TaskService);
  private workContextService = inject(WorkContextService);

  tasks = signal<Task[]>([]);
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;

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

  loadTasks(workId: string) {
    // Assuming getByWorkId exists, need to verify/add it in service
    this.taskService.getByWorkId(workId).subscribe(data => this.tasks.set(data));
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
