import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <!-- Sidebar -->
    <app-sidebar
      [isOpen]="sidebarOpen()"
      (closeSidebar)="closeSidebar()">
    </app-sidebar>

    <!-- Main Content Area -->
    <div class="md:ml-[280px] min-h-screen bg-gray-50">
      <!-- Top Header -->
      <header class="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6">
        <!-- Mobile menu button -->
        <button
          (click)="toggleSidebar()"
          class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 mr-4">
          <i class="pi pi-bars text-lg"></i>
        </button>

        <div class="flex-1">
          <!-- Breadcrumb or page title can go here -->
        </div>

        <!-- Header actions -->
        <div class="flex items-center gap-2">
          <button class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
            <i class="pi pi-bell text-lg"></i>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 md:p-6">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Mobile overlay -->
    @if (sidebarOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-30 md:hidden"
        (click)="closeSidebar()">
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LayoutComponent {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
