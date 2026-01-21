import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Task } from '../../../core/models/task.model';
import { LucideAngularModule, ArrowLeft, Edit } from 'lucide-angular';

@Component({
  selector: 'app-tasks-detail',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './tasks-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);

  task = signal<Task | null>(null);
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EditIcon = Edit;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.taskService.getById(id).subscribe(data => this.task.set(data));
    });
  }
}
