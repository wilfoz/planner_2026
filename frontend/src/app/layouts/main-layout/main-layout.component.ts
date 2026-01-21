import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideAngularModule,
  LayoutDashboard,
  HardHat,
  Users,
  Menu,
  X,
  LogOut,
  Radio,
  Truck,
  UsersRound,
  Box,
  ClipboardList,
  Activity
} from 'lucide-angular';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './main-layout.component.html',
  styles: ``
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  isSidebarOpen = signal(false);
  currentUser = this.authService.currentUser;

  readonly DashboardIcon = LayoutDashboard;
  readonly WorksIcon = HardHat;
  readonly EmployeesIcon = Users;
  readonly EquipmentsIcon = Truck;
  readonly TeamsIcon = UsersRound;
  readonly TowersIcon = Radio;
  readonly FoundationsIcon = Box;
  readonly TasksIcon = ClipboardList;
  readonly ProductionsIcon = Activity;
  readonly MenuIcon = Menu;
  readonly CloseIcon = X;
  readonly LogoutIcon = LogOut;

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
