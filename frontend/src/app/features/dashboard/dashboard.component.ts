import { Component } from '@angular/core';
import { LucideAngularModule, HardHat, Users } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly HardHatIcon = HardHat;
  readonly UsersIcon = Users;
}
