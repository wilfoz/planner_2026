import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Tower, Span, CableSettings } from '../models';

interface CachedMapData {
  projectId: string;
  towers: Tower[];
  spans: Span[];
  cableSettings: CableSettings;
  cachedAt: number;
}

class MapDatabase extends Dexie {
  mapData!: Table<CachedMapData, string>;

  constructor() {
    super('MapCacheDB');
    this.version(1).stores({
      mapData: 'projectId'
    });
  }
}

@Injectable({ providedIn: 'root' })
export class MapCacheService {
  private db = new MapDatabase();

  async get(projectId: string): Promise<CachedMapData | undefined> {
    const cached = await this.db.mapData.get(projectId);
    if (!cached) return undefined;

    // Return cached data regardless of age to support offline capabilities
    // The component will handle updating with fresh data from the network
    return cached;
  }

  async set(projectId: string, towers: Tower[], spans: Span[], cableSettings: CableSettings): Promise<void> {
    await this.db.mapData.put({ projectId, towers, spans, cableSettings, cachedAt: Date.now() });
  }

  async clear(projectId: string): Promise<void> {
    await this.db.mapData.delete(projectId);
  }
}
