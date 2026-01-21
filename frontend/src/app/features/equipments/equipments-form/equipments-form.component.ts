import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EquipmentService } from '../services/equipment.service';
import { TeamService } from '../../teams/services/team.service';
import { Team } from '../../../core/models/team.model';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-equipments-form',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './equipments-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipmentsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private equipmentService = inject(EquipmentService);
  private teamService = inject(TeamService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  equipmentId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  teams = signal<Team[]>([]);

  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  equipmentForm = this.fb.group({
    registration: ['', Validators.required],
    model: ['', Validators.required],
    manufacturer: ['', Validators.required],
    license_plate: ['', Validators.required],
    provider: ['', Validators.required],
    status: ['ACTIVE', Validators.required],
    team_id: ['']
  });

  ngOnInit() {
    this.loadTeams();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.equipmentId.set(id);
        this.isEditMode.set(true);
        this.loadEquipment(id);
      }
    });
  }

  loadTeams() {
    this.teamService.getAll().subscribe(data => this.teams.set(data));
  }

  loadEquipment(id: string) {
    this.isLoading.set(true);
    this.equipmentService.getById(id).subscribe({
      next: (equipment) => {
        this.equipmentForm.patchValue({
          registration: equipment.registration,
          model: equipment.model,
          manufacturer: equipment.manufacturer,
          license_plate: equipment.license_plate,
          provider: equipment.provider,
          status: equipment.status,
          team_id: equipment.team_id || ''
        });
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/equipments'])
    });
  }

  onSubmit() {
    if (this.equipmentForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.equipmentForm.value;
    const dto: any = {
      ...formValue,
      team_id: formValue.team_id || undefined
    };

    const request$ = this.isEditMode()
      ? this.equipmentService.update(this.equipmentId()!, dto)
      : this.equipmentService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/equipments']),
      error: () => this.isLoading.set(false)
    });
  }
}
