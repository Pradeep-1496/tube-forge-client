import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class.error]="toast.type === 'error'" [class.success]="toast.type === 'success'" [class.info]="toast.type === 'info'">
          <span class="msg">{{ toast.message }}</span>
          <button class="close" (click)="toastService.dismiss(toast.id)">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.55rem;
      font-size: 0.88rem;
      font-weight: 500;
      color: #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: slideIn 0.2s ease;
    }
    .toast.error { background: #dc2626; }
    .toast.success { background: #16a34a; }
    .toast.info { background: #2563eb; }
    .msg { flex: 1; }
    .close {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.8;
      padding: 0;
      line-height: 1;
    }
    .close:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
