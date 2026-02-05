import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Save } from 'lucide-angular';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { WorkService } from '../services/work.service';
import { AuthService } from '../../../core/services/auth.service';
import { Work } from '../../../core/models/work.model';

export const BRAZILIAN_STATES = [
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

@Component({
  selector: 'app-works-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './works-form.component.html'
})
export class WorksFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private workService = inject(WorkService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  workForm!: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  workId = signal<string | null>(null);
  BRAZILIAN_STATES = BRAZILIAN_STATES;
  SaveIcon = Save;

  ngOnInit() {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workId.set(id);
      this.isEditMode.set(true);
      this.loadWork(id);
    }
  }

  private initForm() {
    this.workForm = this.fb.group({
      name: ['', Validators.required],
      contractor: [''],
      tension: [null],
      extension: [null],
      phases: [null],
      circuits: [null],
      lightning_rod: [null],
      number_of_conductor_cables: [null],
      start_date: [null],
      end_date: [null],
      states: [[]]
    });
  }

  private loadWork(id: string) {
    this.isLoading.set(true);
    this.workService.getById(id).subscribe({
      next: (work) => {
        this.workForm.patchValue({
          ...work,
          start_date: work.start_date ? this.formatDate(new Date(work.start_date)) : null,
          end_date: work.end_date ? this.formatDate(new Date(work.end_date)) : null
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar obra.', 'Erro');
        this.router.navigate(['/']);
        this.isLoading.set(false);
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
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
      number_of_conductor_cables: formValue.number_of_conductor_cables ? Number(formValue.number_of_conductor_cables) : undefined,
    };

    if (this.isEditMode() && this.workId()) {
      this.workService.update(this.workId()!, workDto).subscribe({
        next: () => {
          this.toastService.success('Obra atualizada com sucesso!', 'Sucesso');
          this.router.navigate(['/']);
        },
        error: () => {
          this.toastService.error('Erro ao atualizar obra.', 'Erro');
          this.isLoading.set(false);
        }
      });
    } else {
      this.workService.create(workDto).subscribe({
        next: () => {
          this.toastService.success('Obra criada com sucesso!', 'Sucesso');
          this.router.navigate(['/']);
        },
        error: () => {
          this.toastService.error('Erro ao criar obra.', 'Erro');
          this.isLoading.set(false);
        }
      });
    }
  }
}
