import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, UserCircle } from 'lucide-angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PaginationMeta } from '../../../core/models/collection.model';

@Component({
  selector: 'app-employees-list',
  imports: [RouterLink, LucideAngularModule, PageHeaderComponent, PaginationComponent],
  templateUrl: './employees-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesListComponent {
  private employeeService = inject(EmployeeService);

  employees = signal<Employee[]>([]);
  meta = signal<PaginationMeta | undefined>(undefined);
  isLoading = signal(false);

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;
  readonly UserIcon = UserCircle;

  breadcrumbs = [
    { label: 'Funcionários' }
  ];

  constructor() {
    this.loadEmployees();
  }

  loadEmployees(page: number = 1) {
    this.isLoading.set(true);
    this.employeeService.getAll({ page, per_page: 10 }).subscribe({
      next: (response) => {
        this.employees.set(response.data);
        this.meta.set(response.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    this.loadEmployees(page);
  }

  deleteEmployee(id: string) {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      this.employeeService.delete(id).subscribe(() => this.loadEmployees());
    }
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
