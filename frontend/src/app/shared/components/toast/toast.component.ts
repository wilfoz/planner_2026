import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';
import { LucideAngularModule, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4 sm:p-0">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition transform ease-out duration-300"
          [ngClass]="{
            'bg-white text-gray-900 ring-gray-200': true,
            'animate-in slide-in-from-top-2 fade-in': true
          }"
        >
          <div class="p-4 flex items-start">
            <div class="flex-shrink-0">
              @switch (toast.type) {
                @case ('success') { <lucide-icon [img]="CheckCircleIcon" class="h-6 w-6 text-green-500"></lucide-icon> }
                @case ('error') { <lucide-icon [img]="AlertCircleIcon" class="h-6 w-6 text-red-500"></lucide-icon> }
                @case ('warning') { <lucide-icon [img]="AlertTriangleIcon" class="h-6 w-6 text-yellow-500"></lucide-icon> }
                @case ('info') { <lucide-icon [img]="InfoIcon" class="h-6 w-6 text-blue-500"></lucide-icon> }
              }
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              @if (toast.title) {
                <p class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
              }
              <p class="text-sm text-gray-500" [class.mt-1]="toast.title">{{ toast.message }}</p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button 
                type="button" 
                class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                (click)="toastService.remove(toast.id)"
              >
                <span class="sr-only">Close</span>
                <lucide-icon [img]="XIcon" class="h-5 w-5"></lucide-icon>
              </button>
            </div>
          </div>
          <!-- Progress bar could go here but simple autohide is enough for now -->
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  readonly XIcon = X;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly InfoIcon = Info;
  readonly AlertTriangleIcon = AlertTriangle;
}
