import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WorkService } from '../services/work.service';
import { Work } from '../../../core/models/work.model';
import { LucideAngularModule, ArrowLeft, Edit } from 'lucide-angular';

@Component({
  selector: 'app-works-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './works-detail.component.html',
  styles: ``
})
export class WorksDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private workService = inject(WorkService);

  work = signal<Work | null>(null);
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EditIcon = Edit;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadWork(id);
      }
    });
  }

  loadWork(id: string) {
    this.workService.getById(id).subscribe(work => this.work.set(work));
  }
}
