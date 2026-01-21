import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TowerService } from '../services/tower.service';
import { Tower } from '../../../core/models/tower.model';
import { LucideAngularModule, ArrowLeft, Edit } from 'lucide-angular';

@Component({
  selector: 'app-towers-detail',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './towers-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TowersDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private towerService = inject(TowerService);

  tower = signal<Tower | null>(null);
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EditIcon = Edit;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadTower(id);
    });
  }

  loadTower(id: string) {
    this.towerService.getById(id).subscribe(data => this.tower.set(data));
  }
}
