import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EquipmentService } from '../services/equipment.service';
import { Equipment } from '../../../core/models/equipment.model';
import { LucideAngularModule, ArrowLeft, Edit } from 'lucide-angular';

@Component({
  selector: 'app-equipments-detail',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './equipments-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipmentsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private equipmentService = inject(EquipmentService);

  equipment = signal<Equipment | null>(null);
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EditIcon = Edit;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadEquipment(id);
    });
  }

  loadEquipment(id: string) {
    this.equipmentService.getById(id).subscribe(data => this.equipment.set(data));
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-green-500/20 text-green-400',
      'MAINTENANCE': 'bg-yellow-500/20 text-yellow-400',
      'INACTIVE': 'bg-red-500/20 text-red-400'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Ativo',
      'MAINTENANCE': 'Manutenção',
      'INACTIVE': 'Inativo'
    };
    return labels[status] || status;
  }
}
