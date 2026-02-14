import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly STORAGE_KEY = 'sidebar_collapsed';

  isCollapsed = signal(this.loadState());

  toggle(): void {
    this.isCollapsed.update(v => !v);
    this.saveState();
  }

  expand(): void {
    this.isCollapsed.set(false);
    this.saveState();
  }

  collapse(): void {
    this.isCollapsed.set(true);
    this.saveState();
  }

  private loadState(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  private saveState(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, String(this.isCollapsed()));
    }
  }
}
