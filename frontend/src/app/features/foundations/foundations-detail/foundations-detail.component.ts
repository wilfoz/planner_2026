import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FoundationService } from '../services/foundation.service';
import { Foundation } from '../../../core/models/foundation.model';
import { LucideAngularModule, ArrowLeft, Edit } from 'lucide-angular';

@Component({
  selector: 'app-foundations-detail',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './foundations-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoundationsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private foundationService = inject(FoundationService);

  foundation = signal<Foundation | null>(null);
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EditIcon = Edit;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.foundationService.getById(id).subscribe(data => this.foundation.set(data));
    });
  }
}
