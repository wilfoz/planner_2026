import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { TeamService } from '../../teams/services/team.service';
import { Team } from '../../../core/models/team.model';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingService } from '../../../shared/services/loading.service';

@Component({
  selector: 'app-employees-form',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './employees-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private teamService = inject(TeamService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);

  employeeId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  teams = signal<Team[]>([]);

  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  employeeForm = this.fb.group({
    registration: ['', Validators.required],
    full_name: ['', [Validators.required, Validators.minLength(3)]],
    occupation: ['', Validators.required],
    leadership: [false],
    status: ['ACTIVE', Validators.required],
    team_id: ['']
  });

  ngOnInit() {
    this.loadTeams();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.employeeId.set(id);
        this.isEditMode.set(true);
        this.loadEmployee(id);
      }
    });
  }

  loadTeams() {
    this.teamService.getAll().subscribe(data => this.teams.set(data));
  }

  loadEmployee(id: string) {
    this.loadingService.start();
    this.employeeService.getById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          registration: employee.registration,
          full_name: employee.full_name,
          occupation: employee.occupation,
          leadership: employee.leadership,
          status: employee.status,
          team_id: employee.team_id || ''
        });
        this.loadingService.stop();
      },
      error: () => {
        this.loadingService.stop();
        this.toastService.error('Erro ao carregar funcionário.');
        this.router.navigate(['/employees']);
      }
    });
  }

  onSubmit() {
    if (this.employeeForm.invalid) return;

    this.loadingService.start();
    const formValue = this.employeeForm.value;
    const dto: any = {
      ...formValue,
      team_id: formValue.team_id || undefined
    };

    const request$ = this.isEditMode()
      ? this.employeeService.update(this.employeeId()!, dto)
      : this.employeeService.create(dto);

    request$.subscribe({
      next: () => {
        this.loadingService.stop();
        this.toastService.success(this.isEditMode() ? 'Funcionário atualizado!' : 'Funcionário criado com sucesso!');
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.loadingService.stop();
        this.toastService.error(err.message || 'Erro ao salvar funcionário.');
      }
    });
  }
}
