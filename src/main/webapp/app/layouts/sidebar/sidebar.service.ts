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
    const storedState = localStorage.getItem(this.STORAGE_KEY);
    if (storedState !== null) {
      return storedState === 'true';
    }
    // Default to collapsed on mobile (< 1024px) if no state is stored
    return window.innerWidth < 1024;
  }

  private saveState(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, String(this.isCollapsed()));
    }
  }
}
