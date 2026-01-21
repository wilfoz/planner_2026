import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductionService } from '../services/production.service';
import { WorkService } from '../../works/services/work.service';
import { TaskService } from '../../tasks/services/task.service';
import { Work } from '../../../core/models/work.model';
import { Task } from '../../../core/models/task.model';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-productions-form',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './productions-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productionService = inject(ProductionService);
  private workService = inject(WorkService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productionId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  works = signal<Work[]>([]);
  tasks = signal<Task[]>([]);

  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  productionForm = this.fb.group({
    status: ['EXECUTED', Validators.required],
    comments: [''],
    start_time: [''],
    final_time: [''],
    task_id: ['', Validators.required],
    work_id: ['', Validators.required]
  });

  ngOnInit() {
    this.loadWorks();
    this.loadTasks();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productionId.set(id);
        this.isEditMode.set(true);
        this.loadProduction(id);
      }
    });
  }

  loadWorks() {
    this.workService.getAll().subscribe(data => this.works.set(data));
  }

  loadTasks() {
    this.taskService.getAll().subscribe(data => this.tasks.set(data));
  }

  loadProduction(id: string) {
    this.isLoading.set(true);
    this.productionService.getById(id).subscribe({
      next: (p) => {
        this.productionForm.patchValue({
          status: p.status,
          comments: p.comments || '',
          start_time: p.start_time || '',
          final_time: p.final_time || '',
          task_id: p.task_id,
          work_id: p.work_id
        });
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/productions'])
    });
  }

  onSubmit() {
    if (this.productionForm.invalid) return;
    this.isLoading.set(true);
    const formValue = this.productionForm.value;
    const dto: any = {
      ...formValue,
      comments: formValue.comments || undefined,
      start_time: formValue.start_time || undefined,
      final_time: formValue.final_time || undefined
    };

    const request$ = this.isEditMode()
      ? this.productionService.update(this.productionId()!, dto)
      : this.productionService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/productions']),
      error: () => this.isLoading.set(false)
    });
  }
}
