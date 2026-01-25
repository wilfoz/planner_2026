import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';

export interface Breadcrumb {
  label: string;
  link?: string | any[];
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="mb-8">
      <div>
        <nav class="sm:hidden" aria-label="Back">
          <a [routerLink]="breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].link : '/'" class="flex items-center text-sm font-medium text-gray-400 hover:text-gray-200">
            <lucide-icon [img]="ChevronRightIcon" class="mr-1 h-4 w-4 shrink-0 -scale-x-100 text-gray-500"></lucide-icon>
            Back
          </a>
        </nav>
        <nav class="hidden sm:flex" aria-label="Breadcrumb">
          <ol role="list" class="flex items-center space-x-4">
            @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
              <li>
                <div class="flex items-center">
                  @if (!$first) {
                    <lucide-icon [img]="ChevronRightIcon" class="h-5 w-5 flex-shrink-0 text-gray-500" aria-hidden="true"></lucide-icon>
                  }
                  @if (crumb.link && !last) {
                    <a [routerLink]="crumb.link" [class.ml-4]="!$first" class="text-sm font-medium text-gray-400 hover:text-gray-200">{{ crumb.label }}</a>
                  } @else {
                    <span [class.ml-4]="!$first" class="text-sm font-medium text-gray-400" [class.text-white]="last" [attr.aria-current]="last ? 'page' : undefined">{{ crumb.label }}</span>
                  }
                </div>
              </li>
            }
          </ol>
        </nav>
      </div>
      <div class="mt-2 md:flex md:items-center md:justify-between">
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">{{ title }}</h2>
        </div>
        <div class="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) breadcrumbs: Breadcrumb[] = [];

  readonly ChevronRightIcon = ChevronRight;
}
