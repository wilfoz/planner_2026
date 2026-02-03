import { Injectable, signal } from '@angular/core';

export interface CableDefinition {
  id: string;
  type: 'conductor' | 'lightning';
  offsetX: number;
  offsetY: number;
  color: string;
  width?: number;
}

export interface TowerTypeConfig {
  cables: CableDefinition[];
}

export interface WorkCableConfig {
  [towerType: string]: TowerTypeConfig;
}

@Injectable({
  providedIn: 'root'
})
export class CableConfigurationService {
  private readonly STORAGE_KEY = 'cable_configurations';

  // Signals
  readonly configurations = signal<Record<string, WorkCableConfig>>({});

  constructor() {
    this.loadFromStorage();
  }

  getSettings(workId: string, towerType: string): CableDefinition[] {
    return this.configurations()[workId]?.[towerType]?.cables || [];
  }

  saveSettings(workId: string, towerType: string, cables: CableDefinition[]) {
    const currentConfigs = this.configurations();
    const workConfig = currentConfigs[workId] || {};

    workConfig[towerType] = { cables };

    const newConfigs = {
      ...currentConfigs,
      [workId]: workConfig
    };

    this.configurations.set(newConfigs);
    this.saveToStorage(newConfigs);
  }

  initializeDefaults(workId: string, towerType: string, calculatedCables: CableDefinition[]) {
    // Only initialize if no config exists for this tower type
    if (!this.configurations()[workId]?.[towerType]) {
      this.saveSettings(workId, towerType, calculatedCables);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.configurations.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cable configurations', e);
    }
  }

  private saveToStorage(configs: Record<string, WorkCableConfig>) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    } catch (e) {
      console.error('Failed to save cable configurations', e);
    }
  }
}
