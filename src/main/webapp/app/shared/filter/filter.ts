import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { TranslateDirective } from 'app/shared/language';

import { IFilterOptions } from './filter.model';

export interface FilterField {
  name: string;
  label: string;
  type: 'contains' | 'equals';
  placeholder?: string;
}

@Component({
  selector: 'jhi-filter',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, FormsModule],
  templateUrl: './filter.html',
})
export default class Filter {
  readonly filters = input.required<IFilterOptions>();
  readonly filterFields = input<FilterField[]>([]);

  filterValues: Record<string, string> = {};

  applyFilter(field: FilterField): void {
    const value = this.filterValues[field.name];
    if (value?.trim()) {
      const filterName = field.type === 'contains' ? `${field.name}.contains` : `${field.name}.equals`;
      this.filters().addFilter(filterName, value.trim());
      this.filterValues[field.name] = '';
    }
  }

  applyAllFilters(): void {
    for (const field of this.filterFields()) {
      this.applyFilter(field);
    }
  }

  clearAllFilters(): void {
    this.filters().clear();
  }

  clearFilter(filterName: string, value: string): void {
    this.filters().removeFilter(filterName, value);
  }
}
