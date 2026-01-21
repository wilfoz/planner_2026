import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { LucideAngularModule, ArrowLeft, Edit } from 'lucide-angular';

@Component({
  selector: 'app-employees-detail',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './employees-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);

  employee = signal<Employee | null>(null);
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EditIcon = Edit;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadEmployee(id);
      }
    });
  }

  loadEmployee(id: string) {
    this.employeeService.getById(id).subscribe(employee => this.employee.set(employee));
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-green-500/20 text-green-400',
      'INACTIVE': 'bg-red-500/20 text-red-400',
      'VACATION': 'bg-yellow-500/20 text-yellow-400'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Ativo',
      'INACTIVE': 'Inativo',
      'VACATION': 'Férias'
    };
    return labels[status] || status;
  }
}
