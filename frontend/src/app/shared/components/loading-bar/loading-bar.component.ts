import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed top-0 left-0 right-0 z-[10000] h-1 bg-gray-200 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-progress origin-left"></div>
      </div>
    }
  `,
  styles: [`
    @keyframes progress {
      0% { transform: scaleX(0); }
      50% { transform: scaleX(0.5); }
      100% { transform: scaleX(1); }
    }
    .animate-progress {
      animation: progress 2s infinite linear;
    }
  `]
})
export class LoadingBarComponent {
  loadingService = inject(LoadingService);
}
