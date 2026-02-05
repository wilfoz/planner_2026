import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamService } from '../services/team.service';
import { Team } from '../../../core/models/team.model';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Users } from 'lucide-angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-teams-list',
  imports: [RouterLink, LucideAngularModule, PageHeaderComponent],
  templateUrl: './teams-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsListComponent {
  private teamService = inject(TeamService);

  teams = signal<Team[]>([]);
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;
  readonly UsersIcon = Users;

  breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Map', link: '/map' },
    { label: 'Equipes' }
  ];

  constructor() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getAll().subscribe(data => this.teams.set(data));
  }

  deleteTeam(id: string) {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
      this.teamService.delete(id).subscribe(() => this.loadTeams());
    }
  }
}
