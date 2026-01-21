import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-tasks-form',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './tasks-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  taskId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);

  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  taskForm = this.fb.group({
    code: [0, [Validators.required, Validators.min(1)]],
    stage: ['', Validators.required],
    group: ['', Validators.required],
    name: ['', Validators.required],
    unit: ['', Validators.required]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taskId.set(id);
        this.isEditMode.set(true);
        this.loadTask(id);
      }
    });
  }

  loadTask(id: string) {
    this.isLoading.set(true);
    this.taskService.getById(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue(task);
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/tasks'])
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) return;
    this.isLoading.set(true);
    const dto: any = this.taskForm.value;

    const request$ = this.isEditMode()
      ? this.taskService.update(this.taskId()!, dto)
      : this.taskService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => this.isLoading.set(false)
    });
  }
}
