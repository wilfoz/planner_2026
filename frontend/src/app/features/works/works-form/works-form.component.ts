import { Component, inject, signal, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { WorkService } from '../services/work.service';
import { LucideAngularModule, Save, X, ArrowLeft } from 'lucide-angular';
import { Work } from '../../../core/models/work.model';

@Component({
  selector: 'app-works-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './works-form.component.html',
  styles: ``
})
export class WorksFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private workService = inject(WorkService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  workId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);

  readonly SaveIcon = Save;
  readonly CancelIcon = X;
  readonly ArrowLeftIcon = ArrowLeft;

  readonly BRAZILIAN_STATES = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  workForm = this.fb.group({
    name: ['', Validators.required],
    tension: [undefined as number | undefined, Validators.required],
    extension: [undefined as number | undefined, Validators.required],
    phases: [undefined as number | undefined],
    circuits: [undefined as number | undefined],
    lightning_rod: [undefined as number | undefined],
    start_date: ['', Validators.required],
    end_date: [''],
    states: [[] as string[]]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.workId.set(id);
        this.isEditMode.set(true);
        this.loadWork(id);
      }
    });
  }

  loadWork(id: string) {
    this.isLoading.set(true);
    this.workService.getById(id).subscribe({
      next: (work) => {
        this.workForm.patchValue({
          name: work.name,
          tension: work.tension,
          extension: work.extension,
          phases: work.phases,
          circuits: work.circuits,
          lightning_rod: work.lightning_rod,
          start_date: this.formatDate(work.start_date),
          end_date: this.formatDate(work.end_date),
          states: work.states ?? []
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  onSubmit() {
    if (this.workForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.workForm.value;
    const workDto: any = {
      ...formValue,
      tension: formValue.tension ? Number(formValue.tension) : undefined,
      extension: formValue.extension ? Number(formValue.extension) : undefined,
      phases: formValue.phases ? Number(formValue.phases) : undefined,
      circuits: formValue.circuits ? Number(formValue.circuits) : undefined,
      lightning_rod: formValue.lightning_rod ? Number(formValue.lightning_rod) : undefined,
    };


    if (this.isEditMode() && this.workId()) {
      this.workService.update(this.workId()!, workDto).subscribe({
        next: () => this.router.navigate(['/works']),
        error: () => this.isLoading.set(false)
      });
    } else {
      this.workService.create(workDto).subscribe({
        next: () => this.router.navigate(['/works']),
        error: () => this.isLoading.set(false)
      });
    }
  }
}
