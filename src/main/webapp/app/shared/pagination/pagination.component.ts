import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'jhi-pagination',
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center space-x-1">
        <!-- First page -->
        @if (boundaryLinks()) {
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
            [class]="page() === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
            [disabled]="page() === 1"
            (click)="selectPage(1)"
          >
            &laquo;
          </button>
        }

        <!-- Previous page -->
        <button
          type="button"
          class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
          [class]="page() === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
          [disabled]="page() === 1"
          (click)="selectPage(page() - 1)"
        >
          &lsaquo;
        </button>

        <!-- Page numbers -->
        @for (pageNum of visiblePages(); track pageNum) {
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
            [class]="pageNum === page() ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
            (click)="selectPage(pageNum)"
          >
            {{ pageNum }}
          </button>
        }

        <!-- Next page -->
        <button
          type="button"
          class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
          [class]="page() === totalPages() ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
          [disabled]="page() === totalPages()"
          (click)="selectPage(page() + 1)"
        >
          &rsaquo;
        </button>

        <!-- Last page -->
        @if (boundaryLinks()) {
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
            [class]="page() === totalPages() ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
            [disabled]="page() === totalPages()"
            (click)="selectPage(totalPages())"
          >
            &raquo;
          </button>
        }
      </nav>
    }
  `,
})
export class PaginationComponent {
  collectionSize = input<number>(0);
  page = input<number>(1);
  pageSize = input<number>(20);
  maxSize = input<number>(5);
  boundaryLinks = input<boolean>(true);

  pageChange = output<number>();

  totalPages = computed(() => Math.ceil(this.collectionSize() / this.pageSize()) || 1);

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const max = this.maxSize();
    const pages: number[] = [];

    let start = Math.max(1, current - Math.floor(max / 2));
    let end = Math.min(total, start + max - 1);

    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  selectPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages() && pageNum !== this.page()) {
      this.pageChange.emit(pageNum);
    }
  }
}
