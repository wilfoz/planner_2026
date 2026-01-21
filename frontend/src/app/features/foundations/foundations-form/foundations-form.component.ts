import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FoundationService } from '../services/foundation.service';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-foundations-form',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './foundations-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoundationsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private foundationService = inject(FoundationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  foundationId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);

  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  foundationForm = this.fb.group({
    project: ['', Validators.required],
    revision: ['', Validators.required],
    description: ['', Validators.required],
    excavation_volume: [null as number | null],
    concrete_volume: [null as number | null],
    backfill_volume: [null as number | null],
    steel_volume: [null as number | null]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.foundationId.set(id);
        this.isEditMode.set(true);
        this.loadFoundation(id);
      }
    });
  }

  loadFoundation(id: string) {
    this.isLoading.set(true);
    this.foundationService.getById(id).subscribe({
      next: (f) => {
        this.foundationForm.patchValue(f);
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/foundations'])
    });
  }

  onSubmit() {
    if (this.foundationForm.invalid) return;
    this.isLoading.set(true);
    const dto: any = this.foundationForm.value;

    const request$ = this.isEditMode()
      ? this.foundationService.update(this.foundationId()!, dto)
      : this.foundationService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/foundations']),
      error: () => this.isLoading.set(false)
    });
  }
}
