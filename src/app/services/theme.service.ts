import { Injectable, signal, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme-preference';
  private readonly root: HTMLElement;

  constructor(@Inject(DOCUMENT) root: any) {
    this.root = root.documentElement;
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(this.storageKey) : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(saved ? saved === 'dark' : prefersDark);
  }

  readonly dark = signal<boolean>(false);

  toggle() {
    this.applyTheme(!this.dark());
    localStorage.setItem(this.storageKey, this.dark() ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean) {
    this.dark.set(isDark);
    this.root.classList.toggle('dark', isDark);
    this.root.classList.toggle('light', !isDark);
  }
}
