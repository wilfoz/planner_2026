import { Injectable, signal, effect, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkContextService {
  private readonly STORAGE_KEY = 'lt-planner-selected-work-id';

  // Signal to store the selected Work ID (or null if none selected)
  private selectedWorkIdSignal = signal<string | null>(this.getStoredWorkId());

  // Publicly exposed signal (readonly)
  readonly selectedWorkId = this.selectedWorkIdSignal.asReadonly();

  // Computed signal to check if a work is selected
  readonly hasWorkSelected = computed(() => !!this.selectedWorkIdSignal());

  constructor() {
    // Effect to persist selection changes to LocalStorage
    effect(() => {
      const id = this.selectedWorkIdSignal();
      if (id) {
        localStorage.setItem(this.STORAGE_KEY, id);
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });
  }

  selectWork(workId: string) {
    this.selectedWorkIdSignal.set(workId);
  }

  clearWork() {
    this.selectedWorkIdSignal.set(null);
  }

  private getStoredWorkId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }
}
