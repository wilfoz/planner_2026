import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
import { WorkContextService } from '../../../core/services/work-context.service';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';
import { TASK_HIERARCHY, StageDefinition, GroupDefinition, TaskDefinition } from '../../../core/models/task.model';

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

  private workContextService = inject(WorkContextService);

  taskId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);

  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  readonly availableStages = signal(TASK_HIERARCHY);

  // Selected values tracking for computed logic
  readonly selectedStageName = signal<string>('');
  readonly selectedGroupName = signal<string>('');

  readonly availableGroups = computed(() => {
    const stageName = this.selectedStageName();
    if (!stageName) return [];

    const stage = this.availableStages().find(s => s.name === stageName);
    return stage?.groups || [];
  });

  readonly availableTasks = computed(() => {
    const stageName = this.selectedStageName();
    const groupName = this.selectedGroupName();

    if (!stageName) return [];

    const stage = this.availableStages().find(s => s.name === stageName);
    if (!stage) return [];

    // If stage has groups, tasks come from the selected group
    if (stage.groups && stage.groups.length > 0) {
      if (!groupName) return [];
      const group = stage.groups.find(g => g.name === groupName);
      return group?.tasks || [];
    }

    // If stage has no groups, tasks come directly from the stage
    return stage.tasks || [];
  });

  readonly hasGroups = computed(() => {
    return this.availableGroups().length > 0;
  });

  taskForm = this.fb.group({
    code: [0, [Validators.required, Validators.min(1)]],
    stage: ['', Validators.required],
    group: [''], // Will handle validation dynamically
    name: ['', Validators.required],
    unit: ['', Validators.required]
  });

  constructor() {
    // Effect to update signals when form changes
    effect(() => {
      // This is handled by valueChanges below, but cleaner with signals if using template-driven.
      // Keeping reactive forms approach with valueChanges subscription.
    });
  }

  ngOnInit() {
    // Sync signals with form changes
    this.taskForm.get('stage')?.valueChanges.subscribe(value => {
      this.selectedStageName.set(value || '');
      this.selectedGroupName.set(''); // Reset group on stage change

      // Reset dependent fields
      this.taskForm.patchValue({ group: '', name: '' }, { emitEvent: false });

      // Update validation for group
      const stage = this.availableStages().find(s => s.name === value);
      const groupControl = this.taskForm.get('group');

      if (stage?.groups && stage.groups.length > 0) {
        groupControl?.setValidators(Validators.required);
        groupControl?.enable();
      } else {
        groupControl?.clearValidators();
        groupControl?.disable();
        groupControl?.setValue('N/A'); // Or leave empty
      }
      groupControl?.updateValueAndValidity();
    });

    this.taskForm.get('group')?.valueChanges.subscribe(value => {
      this.selectedGroupName.set(value || '');
      // Reset task name on group change
      this.taskForm.patchValue({ name: '' }, { emitEvent: false });
    });

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
        // Must patch carefully to trigger valueChanges in order
        this.taskForm.patchValue({
          code: task.code,
          stage: task.stage,
          unit: task.unit
        });

        // Force signal update for stage
        this.selectedStageName.set(task.stage);

        // Then patch group
        this.taskForm.patchValue({ group: task.group });
        this.selectedGroupName.set(task.group);

        // Finally patch name (task)
        this.taskForm.patchValue({ name: task.name });

        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/tasks'])
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) return;
    this.isLoading.set(true);
    const formValue = this.taskForm.value;

    // Ensure work_id is present for creation
    const workId = this.workContextService.selectedWorkId();
    if (!this.isEditMode() && !workId) {
      alert('Selecione uma obra para criar a tarefa.');
      this.isLoading.set(false);
      return;
    }

    const dto: any = {
      ...formValue,
      work_id: workId
    };

    // Clean up group if it was disabled/N/A
    if (this.taskForm.get('group')?.disabled) {
      dto.group = '';
    }

    const request$ = this.isEditMode()
      ? this.taskService.update(this.taskId()!, dto)
      : this.taskService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => this.isLoading.set(false)
    });
  }
}
