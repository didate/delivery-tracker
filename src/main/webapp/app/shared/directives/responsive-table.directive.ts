import { Directive, ElementRef, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[jhiResponsiveTable]',
  standalone: true,
})
export class ResponsiveTableDirective implements AfterViewInit, OnDestroy {
  private observer?: MutationObserver;

  constructor(
    private el: ElementRef<HTMLTableElement>,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    const table = this.el.nativeElement;
    // Add the necessary class for the CSS to apply
    this.renderer.addClass(table, 'responsive-table');

    // Use a small delay to ensure rows are rendered
    setTimeout(() => {
      this.processTable();
    }, 100);

    // Also set up a mutation observer to handle dynamic content changes
    this.observer = new MutationObserver(() => {
      this.processTable();
    });

    this.observer.observe(table, {
      childList: true,
      subtree: true,
    });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private processTable(): void {
    const table = this.el.nativeElement;

    const headerElements = Array.from(table.querySelectorAll('thead th'));
    const headers = headerElements.map(th => {
      // First try to get text from span elements
      const span = th.querySelector('span');
      if (span) {
        return span.textContent?.trim() ?? '';
      }
      // Fallback to full text content, but filter out icon text
      const text = th.textContent?.trim() ?? '';
      // Remove common icon characters and clean up
      const cleanText = text.replace(/[\u{1F000}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
      return cleanText;
    });

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    if (rows.length === 0) {
      return;
    }
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      cells.forEach((cell, cellIndex) => {
        if (headers[cellIndex]) {
          this.renderer.setAttribute(cell, 'data-label', headers[cellIndex]);
        }
      });
    });
  }
}
