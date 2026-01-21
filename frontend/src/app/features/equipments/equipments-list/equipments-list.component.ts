import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EquipmentService } from '../services/equipment.service';
import { Equipment } from '../../../core/models/equipment.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Truck } from 'lucide-angular';

@Component({
  selector: 'app-equipments-list',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './equipments-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipmentsListComponent {
  private equipmentService = inject(EquipmentService);

  equipments = signal<Equipment[]>([]);
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;
  readonly TruckIcon = Truck;

  constructor() {
    this.loadEquipments();
  }

  loadEquipments() {
    this.equipmentService.getAll().subscribe(data => this.equipments.set(data));
  }

  deleteEquipment(id: string) {
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
      this.equipmentService.delete(id).subscribe(() => this.loadEquipments());
    }
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
