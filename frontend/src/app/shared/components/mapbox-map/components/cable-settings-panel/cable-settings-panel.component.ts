import { Component, ChangeDetectionStrategy, signal, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Save, RotateCcw, MapPin } from 'lucide-angular';
import { CableConfigurationService, CableDefinition } from '../../services/cable-configuration.service';
import { Work } from '../../../../../core/models/work.model';

@Component({
  selector: 'app-cable-settings-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col bg-[#18181b] text-white shadow-xl border-l border-white/10 w-80">
      <!-- Header -->
      <div class="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Configuração de Cabos</h2>
        <button (click)="close.emit()" class="text-gray-400 hover:text-white transition-colors">
          <lucide-icon [img]="XIcon" class="h-5 w-5"></lucide-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        
        <!-- Tower Type Selector -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-400">Tipo de Torre</label>
          <select 
            [ngModel]="selectedTowerType()" 
            (ngModelChange)="selectedTowerType.set($event)"
            class="w-full rounded-md border-0 bg-[#27272a] text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 sm:text-sm py-2 px-3">
            <option value="suspension">Suspensão</option>
            <option value="anchor">Ancoragem</option>
            <option value="terminal">Terminal</option>
            <option value="transposition">Transposição</option>
          </select>
        </div>

        <!-- Cables List -->
        <div class="space-y-4">
          <div *ngFor="let cable of cables(); let i = index" class="p-3 rounded-lg bg-[#27272a] border border-white/5 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider" 
                    [class.text-blue-400]="cable.type === 'conductor'"
                    [class.text-green-400]="cable.type === 'lightning'">
                {{ cable.type === 'conductor' ? 'Condutor' : 'Para-raios' }} #{{ i + 1 }}
              </span>
              <div class="h-3 w-3 rounded-full" [style.background-color]="cable.color"></div>
            </div>

            <div class="grid grid-cols-2 gap-3 items-end">
              <div>
                <label class="text-[10px] text-gray-400 uppercase">Offset X (m)</label>
                <input type="number" step="0.1" [(ngModel)]="cable.offsetX"
                  class="mt-1 w-full rounded bg-[#18181b] border-white/10 text-white text-xs py-1 px-2 focus:ring-1 focus:ring-indigo-500">
              </div>
              <div>
                <label class="text-[10px] text-gray-400 uppercase">Distância do Topo (m)</label>
                <input type="number" step="0.1" [(ngModel)]="cable.offsetY"
                  title="Distância em relação ao topo da torre (para baixo)"
                  class="mt-1 w-full rounded bg-[#18181b] border-white/10 text-white text-xs py-1 px-2 focus:ring-1 focus:ring-indigo-500">
              </div>
            </div>
            
            <!-- Pick Button -->
            <button (click)="togglePick(i)"
              [class.bg-indigo-500]="pickingIndex() === i"
              [class.text-white]="pickingIndex() === i"
              [class.bg-white-5]="pickingIndex() !== i"
              class="w-full flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors border border-white/10">
              <lucide-icon [img]="MapPinIcon" class="h-3 w-3"></lucide-icon>
              {{ pickingIndex() === i ? 'Clique no Mapa...' : 'Capturar do Mapa' }}
            </button>

            <div>
              <label class="text-[10px] text-gray-400 uppercase">Cor</label>
              <div class="flex items-center gap-2 mt-1">
                <input type="color" [(ngModel)]="cable.color" class="h-6 w-8 rounded cursor-pointer bg-transparent">
                <input type="text" [(ngModel)]="cable.color" class="flex-1 rounded bg-[#18181b] border-white/10 text-white text-xs py-1 px-2 uppercase shadow-sm border-0">
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="cables().length === 0" class="text-center py-8 text-gray-500 text-sm">
          Nenhum cabo configurado ou work não carregado.
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-white/10 bg-[#27272a] flex gap-3">
        <button (click)="resetDefaults()" 
                class="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-300 bg-[#3f3f46] border border-transparent rounded-md hover:bg-[#52525b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          <lucide-icon [img]="RotateCcwIcon" class="mr-2 h-4 w-4"></lucide-icon>
          Resetar
        </button>
        <button (click)="save()" 
                class="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <lucide-icon [img]="SaveIcon" class="mr-2 h-4 w-4"></lucide-icon>
          Salvar
        </button>
      </div>
    </div>
  `
})
export class CableSettingsPanelComponent {
  work = input<Work | null>(null);
  pickedResult = input<{ index: number; h: number; v: number } | null>(null);

  close = output<void>();
  pickRequest = output<number>();
  cancelPick = output<void>();

  private readonly configService = inject(CableConfigurationService);

  readonly selectedTowerType = signal('suspension');
  readonly cables = signal<CableDefinition[]>([]);
  readonly pickingIndex = signal<number | null>(null);

  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly RotateCcwIcon = RotateCcw;
  readonly MapPinIcon = MapPin;

  constructor() {
    effect(() => {
      this.loadSettings();
    }, { allowSignalWrites: true });

    effect(() => {
      const res = this.pickedResult();
      if (res && res.index === this.pickingIndex()) {
        // Update the specific cable
        this.cables.update(list => {
          const newList = [...list];
          if (newList[res.index]) {
            newList[res.index] = {
              ...newList[res.index],
              offsetX: res.h,
              offsetY: res.v
            };
          }
          return newList;
        });
        this.pickingIndex.set(null); // Stop picking
      }
    }, { allowSignalWrites: true });
  }

  loadSettings() {
    const work = this.work();
    if (!work) return;

    let settings = this.configService.getSettings(work.id, this.selectedTowerType());

    // If empty, generate defaults in memory to show user
    if (settings.length === 0) {
      settings = this.generateDefaults(work);
    }

    this.cables.set(JSON.parse(JSON.stringify(settings)));
  }

  togglePick(index: number) {
    if (this.pickingIndex() === index) {
      this.pickingIndex.set(null);
      this.cancelPick.emit();
    } else {
      this.pickingIndex.set(index);
      this.pickRequest.emit(index);
    }
  }

  generateDefaults(work: Work): CableDefinition[] {
    const cables: CableDefinition[] = [];
    const conductCount = (work.phases || 3) * (work.circuits || 1);
    const lightningCount = work.lightning_rod || 0;

    // Use absolute heights for defaults now (e.g. 25m)
    // Conductors
    for (let i = 0; i < conductCount; i++) {
      cables.push({
        id: `cond-${i}`,
        type: 'conductor',
        offsetX: (i - (conductCount - 1) / 2) * 5,
        offsetY: 20, // 20m height
        color: '#0000FF',
        width: 3
      });
    }

    // Lightning rods
    for (let i = 0; i < lightningCount; i++) {
      cables.push({
        id: `light-${i}`,
        type: 'lightning',
        offsetX: (i - (lightningCount - 1) / 2) * 4,
        offsetY: 30, // 30m height
        color: '#FFFF00',
        width: 2
      });
    }

    return cables;
  }

  save() {
    const work = this.work();
    if (!work) return;
    this.configService.saveSettings(work.id, this.selectedTowerType(), this.cables());
    this.close.emit();
  }

  resetDefaults() {
    const work = this.work();
    if (!work) return;
    this.cables.set(this.generateDefaults(work));
  }
}
