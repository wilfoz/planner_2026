import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TeamService } from '../services/team.service';
import { Team } from '../../../core/models/team.model';
import { LucideAngularModule, ArrowLeft, Edit } from 'lucide-angular';

@Component({
  selector: 'app-teams-detail',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './teams-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private teamService = inject(TeamService);

  team = signal<Team | null>(null);
  readonly ArrowLeftIcon = ArrowLeft;
  readonly EditIcon = Edit;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadTeam(id);
    });
  }

  loadTeam(id: string) {
    this.teamService.getById(id).subscribe(data => this.team.set(data));
  }
}
