import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { PaginationMeta } from '../../../core/models/collection.model';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  @Input() meta?: PaginationMeta;
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();

  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  protected readonly min = Math.min;

  get pages(): (number | string)[] {
    if (!this.meta) return [];

    const { page, last_page } = this.meta;
    const delta = 2;
    const range: number[] = [];

    // Always show first page
    range.push(1);

    // Calculate range around current page
    for (let i = Math.max(2, page - delta); i <= Math.min(last_page - 1, page + delta); i++) {
      range.push(i);
    }

    // Always show last page
    if (last_page > 1) {
      range.push(last_page);
    }

    // Add ellipses
    const withDots: (number | string)[] = [];
    let l: number | null = null;

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          withDots.push(l + 1);
        } else if (i - l !== 1) {
          withDots.push('...');
        }
      }
      withDots.push(i);
      l = i;
    }

    return withDots;
  }

  isNumber(val: any): boolean {
    return typeof val === 'number';
  }

  changePage(newPage: number) {
    if (this.meta && newPage >= 1 && newPage <= this.meta.last_page && newPage !== this.meta.page && !this.loading) {
      this.pageChange.emit(newPage);
    }
  }
}
