import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = signal<boolean>(false);
  private requestCount = 0;

  start() {
    this.requestCount++;
    if (this.requestCount > 0) {
      this.isLoading.set(true);
    }
  }

  stop() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.isLoading.set(false);
    }
  }
}
