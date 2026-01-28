import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkContextService } from '../../core/services/work-context.service';
import { WorkService } from '../works/services/work.service';
import { Work } from '../../core/models/work.model';
import { ProductionService } from '../../features/productions/services/production.service';
import { Production } from '../../core/models/production.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { LucideAngularModule, TrendingUp, CheckCircle, Clock, AlertCircle, Home, Map } from 'lucide-angular';
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LucideAngularModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent {
  private workContextService = inject(WorkContextService);
  private productionService = inject(ProductionService);
  private workService = inject(WorkService);

  readonly TrendingUp = TrendingUp;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly AlertCircle = AlertCircle;
  readonly Home = Home;
  readonly Map = Map;



  // Computed stats
  totalProductions = computed(() => this.productions().length);
  executed = computed(() => this.productions().filter(p => p.status === 'EXECUTED').length);
  programmed = computed(() => this.productions().filter(p => p.status === 'PROGRAMMED').length);
  inProgress = computed(() => this.productions().filter(p => p.status === 'PROGRESS').length);

  percentExecuted = computed(() => {
    const total = this.totalProductions();
    return total > 0 ? Math.round((this.executed() / total) * 100) : 0;
  });

  // Chart Data
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { x: {}, y: { min: 0 } },
    plugins: { legend: { display: true } }
  };
  public barChartType: ChartType = 'bar';

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    elements: { line: { tension: 0.5 } }
  };
  public lineChartType: ChartType = 'line';

  barChartData = computed<ChartData<'bar'>>(() => {
    // Group by Status
    return {
      labels: ['Executed', 'Programmed', 'In Progress'],
      datasets: [
        { data: [this.executed(), this.programmed(), this.inProgress()], label: 'Productions by Status', backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'] }
      ]
    };
  });

  lineChartData = computed<ChartData<'line'>>(() => {
    // Mocking time series or grouping by date if available.
    // Production has start_time.
    const validDates = this.productions()
      .filter(p => p.start_time)
      .map(p => new Date(p.start_time!).toLocaleDateString())
      .sort();

    // Count per date
    const counts: { [key: string]: number } = {};
    validDates.forEach(d => counts[d] = (counts[d] || 0) + 1);

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    return {
      labels: labels.length ? labels : ['No Data'],
      datasets: [
        {
          data: data.length ? data : [0],
          label: 'Daily Productions',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#10b981',
          fill: 'origin',
        }
      ]
    };
  });

  constructor() {
    effect(() => {
      const workId = this.workContextService.selectedWorkId();
      if (workId) {
        this.loadData(workId);
      }
    });
  }

  productions = signal<Production[]>([]);
  currentWork = signal<Work | null>(null);
  isLoading = signal(false);

  // ... (computed stats remain same) ...

  loadData(workId: string) {
    this.isLoading.set(true);

    // Fetch work details
    this.workService.getById(workId).subscribe({
      next: (work) => this.currentWork.set(work),
      error: (err) => console.error(err)
    });

    // Fetch productions - Get larger set for stats (e.g. 1000)
    this.productionService.getByWorkId(workId, { per_page: 1000 }).subscribe({
      next: (response) => {
        this.productions.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}
