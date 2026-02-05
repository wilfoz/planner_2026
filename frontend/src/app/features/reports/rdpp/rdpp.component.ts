import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkContextService } from '../../../core/services/work-context.service';
import { WorkService } from '../../works/services/work.service';
import { TaskService } from '../../tasks/services/task.service';
import { ProductionService } from '../../productions/services/production.service';
import { TowerService } from '../../towers/services/tower.service';
import { forkJoin, map } from 'rxjs';
import { TASK_HIERARCHY, StageDefinition, GroupDefinition, TaskDefinition, Task } from '../../../core/models/task.model';
import { Production } from '../../../core/models/production.model';
import { Tower } from '../../../core/models/tower.model';
import { Work } from '../../../core/models/work.model';

interface ReportRow {
  item: string;
  activity: string;
  startDate: string | undefined;
  endDate: string | undefined;
  unit: string;
  planned: number;
  accumulated: number;
  percentAccumulated: number;
  pending: number;
  planDay: number;
  prodDay: number;
  responsible: string;
  isHeader?: boolean;
  isGroup?: boolean;
}

@Component({
  selector: 'app-rdpp',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './rdpp.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RdppComponent implements OnInit {
  private workContext = inject(WorkContextService);
  private workService = inject(WorkService);
  private taskService = inject(TaskService);
  private productionService = inject(ProductionService);
  private towerService = inject(TowerService);

  currentDate = signal<string>(new Date().toLocaleDateString('en-CA'));

  work = signal<Work | null>(null);
  tasks = signal<Task[]>([]);
  productions = signal<Production[]>([]);
  towers = signal<Tower[]>([]);

  loading = signal<boolean>(true);
  now = new Date();

  // Computed properties for the report

  reportNumber = computed(() => {
    const w = this.work();
    if (!w || !w.start_date) return 0;
    const start = new Date(w.start_date);
    const reportDate = new Date(this.currentDate());
    const diffTime = Math.abs(reportDate.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  });

  nextDay = computed(() => {
    // currentDate is "YYYY-MM-DD" style string from toLocaleDateString('en-CA')
    // new Date("2026-01-26") -> UTC if ISO format. 
    // To ensure we just add a day to the conceptual date:
    const dateParts = this.currentDate().split('-');
    if (dateParts.length !== 3) return new Date();
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const date = new Date(year, month, day);
    date.setDate(date.getDate() + 1);
    return date;
  });

  weatherConditions = {
    bom: false,
    parcial: false,
    chuva: false,
    manha: false,
    tarde: false,
    noite: false
  };

  rows = computed(() => {
    const dbTasks = this.tasks();
    const prods = this.productions();
    const towers = this.towers();
    const hierarchy = TASK_HIERARCHY;
    const reportDateStr = this.currentDate();

    // Helper to find DB task by name
    const findTask = (name: string) => dbTasks.find(t => t.name === name);

    // Calculate totals
    const totalTowers = towers.length;
    const totalDistKm = towers.reduce((acc, t) => acc + (t.distance || 0), 0) / 1000;

    let rows: ReportRow[] = [];
    let itemCounter = 1;

    hierarchy.forEach(stage => {
      // Stage Header
      rows.push({
        item: itemCounter.toString(),
        activity: stage.name,
        startDate: '', endDate: '', unit: '', planned: 0, accumulated: 0,
        percentAccumulated: 0, pending: 0, planDay: 0, prodDay: 0, responsible: '',
        isHeader: true
      });

      const processTaskDef = (taskDef: TaskDefinition, itemPrefix: string) => {
        const dbTask = findTask(taskDef.name);
        if (!dbTask) return; // Should we show empty?

        const taskProds = prods.filter(p => p.task_id === dbTask.id);

        // Dates
        // Start: First production start_time
        // End: Last production final_time
        // This logic might need refinement based on exact requirements, 
        // but "data de cadastro da produção (start_time)" suggests taking from productions.
        const sortedProds = [...taskProds].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
        const startDate = sortedProds.length > 0 ? sortedProds[0].start_time : undefined;
        const endDate = sortedProds.length > 0 ? sortedProds[sortedProds.length - 1].final_time : undefined;

        // Unit
        const unit = dbTask.unit;

        // Planned
        let planned = 0;
        if (unit === 'TR' || unit === 'UN') planned = totalTowers; // Assuming UN is also towers?
        else if (unit === 'KM') planned = totalDistKm;
        else planned = 0; // Unknown unit logic

        // Accumulated (EXECUTED)
        // If unit is TR, count towers in EXECUTED productions? OR count productions?
        // "total de torres ou kms executados".
        // We need to sum up what was done.
        // If production has specific amount? production.model doesn't have amount.
        // It has `towers` array. So we count unique towers in EXECUTED productions.

        // Filter executed productions
        const executedProds = taskProds.filter(p => p.status === 'EXECUTED');

        let accumulated = 0;
        if (unit === 'TR' || unit === 'UN') {
          const executedTowers = new Set<string>();
          executedProds.forEach(p => p.towers?.forEach(t => executedTowers.add(t)));
          accumulated = executedTowers.size;
        } else if (unit === 'KM') {
          // Sum distance of towers in executed productions
          const executedTowers = new Set<string>();
          executedProds.forEach(p => p.towers?.forEach(t => executedTowers.add(t)));
          const executedTowerObjs = towers.filter(t => executedTowers.has(t.id));
          accumulated = executedTowerObjs.reduce((acc, t) => acc + (t.distance || 0), 0) / 1000;
        }

        // Percent
        const percent = planned > 0 ? (accumulated / planned) * 100 : 0;
        const pending = planned - accumulated;

        // Daily stats
        // Prod Day: EXECUTED on reportDate
        // Plan Day: PROGRAMMED or PROGRESS on reportDate
        // We need to check intersection of date ranges or single date?
        // "para as datas do relatorio". Assuming single day report.
        // Production dates are strings? We should compare date part.

        // Check if production overlaps/matches reportDate. 
        // Usually field reports are for a specific day. 
        // If logic is "start_time" is the date of production.

        const prodsOnDay = taskProds.filter(p => {
          return (p.start_time && p.start_time.startsWith(reportDateStr));
        });

        const dayExecutedProds = prodsOnDay.filter(p => p.status === 'EXECUTED');
        const dayPlannedProds = prodsOnDay.filter(p => p.status === 'PROGRAMMED' || p.status === 'PROGRESS');

        let prodDay = 0;
        let planDay = 0;

        if (unit === 'TR' || unit === 'UN') {
          const tSet = new Set<string>();
          dayExecutedProds.forEach(p => p.towers?.forEach(t => tSet.add(t)));
          prodDay = tSet.size;

          const pSet = new Set<string>();
          dayPlannedProds.forEach(p => p.towers?.forEach(t => pSet.add(t)));
          planDay = pSet.size;
        } else if (unit === 'KM') {
          const tSet = new Set<string>();
          dayExecutedProds.forEach(p => p.towers?.forEach(t => tSet.add(t)));
          const tObjs = towers.filter(t => tSet.has(t.id));
          prodDay = tObjs.reduce((acc, t) => acc + (t.distance || 0), 0) / 1000;

          const pSet = new Set<string>();
          dayPlannedProds.forEach(p => p.towers?.forEach(t => pSet.add(t)));
          const pObjs = towers.filter(t => pSet.has(t.id));
          planDay = pObjs.reduce((acc, t) => acc + (t.distance || 0), 0) / 1000;
        }

        // Responsavel
        // "LIDER DA EQUIPE". production has `teams`. We'd need to fetch teams names.
        // For now just joining team IDs or leaving blank if complex. 
        // I'll grab the first team id for now or skip. 
        // Ideally we need TeamService to resolve names. 
        const responsible = "N/A"; // TODO: Resolve team leader

        rows.push({
          item: itemPrefix,
          activity: taskDef.name,
          startDate, endDate, unit, planned, accumulated, percentAccumulated: percent,
          pending, planDay, prodDay, responsible
        });
      };

      let subItemCounter = 1;
      if (stage.groups) {
        stage.groups.forEach(group => {
          // Group Header?
          // Template does not explicitly show group headers in the same way, 
          // but 11.1 Launching Cables etc.
          // Let's add it as a bold row
          rows.push({
            item: `${itemCounter}.${subItemCounter}`,
            activity: group.name,
            startDate: '', endDate: '', unit: '', planned: 0, accumulated: 0,
            percentAccumulated: 0, pending: 0, planDay: 0, prodDay: 0, responsible: '',
            isGroup: true
          });

          let taskCounter = 1;
          group.tasks.forEach(task => {
            // 11.1.1
            processTaskDef(task, `${itemCounter}.${subItemCounter}.${taskCounter}`);
            taskCounter++;
          });
          subItemCounter++;
        });
      } else if (stage.tasks) {
        stage.tasks.forEach(task => {
          // 1.1
          processTaskDef(task, `${itemCounter}.${subItemCounter}`);
          subItemCounter++;
        });
      }

      itemCounter++;
    });

    return rows;
  });

  licenseStats = computed(() => {
    const towers = this.towers();
    const total = towers.length;
    // "soma de embargo"
    const embargoed = towers.filter(t => !!t.embargo).length;
    const liberated = total - embargoed;

    const libPercent = total > 0 ? (liberated / total) * 100 : 0;
    const embPercent = total > 0 ? (embargoed / total) * 100 : 0;

    return {
      liberatedCount: liberated,
      liberatedPercent: libPercent,
      embargoedCount: embargoed,
      embargoedPercent: embPercent
    };
  });

  comments = computed(() => {
    // "Todos comentarios relativos a data de execução"
    const prods = this.productions();
    const reportDateStr = this.currentDate();

    const relevantProds = prods.filter(p => p.start_time && p.start_time.startsWith(reportDateStr));
    const comments = relevantProds
      .filter(p => !!p.comments)
      .map(p => p.comments)
      .join('\n');

    return comments;
  });

  ngOnInit() {
    const workId = this.workContext.selectedWorkId();
    if (workId) {
      this.loadData(workId);
    }
  }

  loadData(workId: string) {
    this.loading.set(true);
    forkJoin({
      work: this.workService.getById(workId),
      tasks: this.taskService.getByWorkId(workId, { per_page: 9999 }),
      productions: this.productionService.getByWorkId(workId, { per_page: 9999 }),
      towers: this.towerService.getByWorkId(workId, { per_page: 9999 })
    }).subscribe({
      next: (data) => {
        this.work.set(data.work);
        this.tasks.set(data.tasks.data);
        this.productions.set(data.productions.data);
        this.towers.set(data.towers.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading report data', err);
        this.loading.set(false);
      }
    });
  }

  print() {
    window.print();
  }
}
