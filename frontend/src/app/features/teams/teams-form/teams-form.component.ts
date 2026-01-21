import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TeamService } from '../services/team.service';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-teams-form',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './teams-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  teamId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);

  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  teamForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.teamId.set(id);
        this.isEditMode.set(true);
        this.loadTeam(id);
      }
    });
  }

  loadTeam(id: string) {
    this.isLoading.set(true);
    this.teamService.getById(id).subscribe({
      next: (team) => {
        this.teamForm.patchValue({ name: team.name });
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/teams'])
    });
  }

  onSubmit() {
    if (this.teamForm.invalid) return;

    this.isLoading.set(true);
    const dto = this.teamForm.value as any;

    const request$ = this.isEditMode()
      ? this.teamService.update(this.teamId()!, dto)
      : this.teamService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/teams']),
      error: () => this.isLoading.set(false)
    });
  }
}
