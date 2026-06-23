import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  format?: (value: unknown, row: T) => string;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th *ngFor="let col of columns()" [style.width]="col.width">{{ col.label }}</th>
            <th class="actions-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows(); trackBy: trackBy" [class.row-error]="row['status'] === 'failed'">
            <td *ngFor="let col of columns()">
              <ng-container [ngSwitch]="col.key">
                <ng-container *ngSwitchCase="'status'">
                  <app-status-badge [status]="getValue(row, col.key)" />
                </ng-container>
                <ng-container *ngSwitchDefault>
                  {{ formatCell(getValue(row, col.key), row) }}
                </ng-container>
              </ng-container>
            </td>
            <td class="actions">
              <ng-container *ngIf="onView(); let viewFn">
                <button class="btn sm ghost" (click)="viewFn(row)">View</button>
              </ng-container>
              <button class="btn sm" (click)="onAction.emit(row)" [disabled]="actionDisabled(row)">
                {{ actionLabel() }}
              </button>
              <button class="btn sm danger ghost" (click)="onDelete.emit(row)">Delete</button>
            </td>
          </tr>
          <tr *ngIf="rows().length === 0">
            <td class="empty" [attr.colspan]="columns().length + 1">No records found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 0.9rem; }
    table { width: 100%; border-collapse: collapse; min-width: 720px; }
    thead { background: var(--border-subtle); }
    th, td { padding: 0.75rem 1rem; text-align: left; font-size: 0.88rem; color: var(--text); }
    th { font-weight: 600; color: var(--muted); text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.08em; border-bottom: 1px solid var(--border); }
    tr { border-bottom: 1px solid var(--border-subtle); transition: background 0.15s ease; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--border-subtle); }
    tr.row-error td { background: rgba(239,68,68,0.08); }
    td.actions, th.actions-th { text-align: right; white-space: nowrap; }
    td.empty { text-align: center; color: var(--muted); padding: 2.5rem; font-style: italic; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.55rem; border: 1px solid transparent; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.12); color: var(--danger); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class DataTableComponent<T extends Record<string, unknown>> {
  columns = input.required<Column<T>[]>();
  rows = input.required<T[]>();
  onView = input<((row: T) => void) | undefined>(undefined);
  onAction = output<T>();
  onDelete = output<T>();
  actionLabel = input<string>('Generate');

  trackBy = (_index: number, row: T) => {
    const id = (row as Record<string, unknown>)['id'];
    return typeof id === 'number' ? id : JSON.stringify(row);
  };

  getValue(row: T, key: Column<T>['key']): unknown {
    if (typeof key === 'string') return (row as Record<string, unknown>)[key];
    return undefined;
  }

  formatCell(value: unknown, _row: T): string {
    if (value == null) return '—';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }

  actionDisabled(_row: T): boolean {
    return false;
  }
}
