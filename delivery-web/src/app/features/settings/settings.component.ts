import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex flex-col items-center justify-center py-16 text-gray-500">
          <i class="pi pi-cog text-5xl mb-4"></i>
          <p class="text-lg font-medium text-gray-700">Settings page coming soon...</p>
          <p class="text-sm mt-2">This feature is under development</p>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {}
