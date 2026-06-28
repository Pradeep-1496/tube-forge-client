import { Component, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="select-wrap">
      <label class="select-label" *ngIf="label()">{{ label() }}</label>
      <div class="select-container" [class.focused]="focused">
        <select
          class="app-select"
          [ngModel]="value()"
          (ngModelChange)="value.set($event)"
          (focus)="focused = true"
          (blur)="focused = false"
        >
          @if (placeholder()) {
            <option value="" disabled>{{ placeholder() }}</option>
          }
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        <span class="select-arrow">▾</span>
      </div>
    </div>
  `,
  styles: [`
    .select-wrap { display: flex; flex-direction: column; gap: 0.35rem; }
    .select-label { font-size: 0.82rem; color: var(--muted); font-weight: 500; }
    .select-container { position: relative; display: flex; align-items: center; }
    .app-select {
      width: 100%; background: var(--border-subtle); border: 1px solid var(--border); color: var(--text);
      padding: 0.6rem 2rem 0.6rem 0.85rem; border-radius: 0.55rem; font-size: 0.9rem; font-family: inherit;
      cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
      -webkit-appearance: none; -moz-appearance: none; appearance: none;
    }
    .app-select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }
    .app-select:disabled { opacity: 0.5; cursor: not-allowed; }
    .app-select option { background: var(--surface); color: var(--text); }
    .select-arrow { position: absolute; right: 0.75rem; pointer-events: none; color: var(--muted); font-size: 0.7rem; line-height: 1; }
  `]
})
export class AppSelectComponent {
  label = input<string>('');
  placeholder = input<string>('');
  options = input<SelectOption[]>([]);
  value = model('');
  focused = false;
}
