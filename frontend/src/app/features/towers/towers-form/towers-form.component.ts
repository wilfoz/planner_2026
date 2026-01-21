import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TowerService } from '../services/tower.service';
import { WorkService } from '../../works/services/work.service';
import { Work } from '../../../core/models/work.model';
import { LucideAngularModule, Save, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-towers-form',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './towers-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TowersFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private towerService = inject(TowerService);
  private workService = inject(WorkService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  towerId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  works = signal<Work[]>([]);

  readonly SaveIcon = Save;
  readonly ArrowLeftIcon = ArrowLeft;

  towerForm = this.fb.group({
    code: [0, [Validators.required, Validators.min(1)]],
    tower_number: ['', Validators.required],
    type: ['', Validators.required],
    latitude: [0],
    longitude: [0],
    distance: [null as number | null],
    height: [null as number | null],
    weight: [null as number | null],
    embargo: [''],
    work_id: ['', Validators.required]
  });

  ngOnInit() {
    this.loadWorks();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.towerId.set(id);
        this.isEditMode.set(true);
        this.loadTower(id);
      }
    });
  }

  loadWorks() {
    this.workService.getAll().subscribe(data => this.works.set(data));
  }

  loadTower(id: string) {
    this.isLoading.set(true);
    this.towerService.getById(id).subscribe({
      next: (tower) => {
        this.towerForm.patchValue({
          code: tower.code,
          tower_number: tower.tower_number,
          type: tower.type,
          latitude: (tower.coordinates as any)?.latitude || 0,
          longitude: (tower.coordinates as any)?.longitude || 0,
          distance: tower.distance ?? null,
          height: tower.height ?? null,
          weight: tower.weight ?? null,
          embargo: tower.embargo || '',
          work_id: tower.work_id
        });
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/towers'])
    });
  }

  onSubmit() {
    if (this.towerForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.towerForm.value;
    const dto: any = {
      code: formValue.code,
      tower_number: formValue.tower_number,
      type: formValue.type,
      coordinates: { latitude: formValue.latitude, longitude: formValue.longitude },
      distance: formValue.distance ?? undefined,
      height: formValue.height ?? undefined,
      weight: formValue.weight ?? undefined,
      embargo: formValue.embargo || undefined,
      work_id: formValue.work_id
    };

    const request$ = this.isEditMode()
      ? this.towerService.update(this.towerId()!, dto)
      : this.towerService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/towers']),
      error: () => this.isLoading.set(false)
    });
  }
}
