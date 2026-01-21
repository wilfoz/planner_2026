import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductionService } from '../services/production.service';
import { Production } from '../../../core/models/production.model';
import { LucideAngularModule, ArrowLeft, Edit } from 'lucide-angular';

@Component({
  selector: 'app-productions-detail',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './productions-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productionService = inject(ProductionService);

  production = signal<Production | null>(null);
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EditIcon = Edit;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.productionService.getById(id).subscribe(data => this.production.set(data));
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PROGRAMMED': 'bg-blue-500/20 text-blue-400',
      'EXECUTED': 'bg-green-500/20 text-green-400',
      'JUSTIFIED': 'bg-yellow-500/20 text-yellow-400'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PROGRAMMED': 'Programado',
      'EXECUTED': 'Executado',
      'JUSTIFIED': 'Justificado'
    };
    return labels[status] || status;
  }
}
