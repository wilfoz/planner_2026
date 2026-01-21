import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
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

  tasks = signal<Task[]>([]);
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;

  constructor() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getAll().subscribe(data => this.tasks.set(data));
  }

  deleteTask(id: string) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.taskService.delete(id).subscribe(() => this.loadTasks());
    }
  }
}
