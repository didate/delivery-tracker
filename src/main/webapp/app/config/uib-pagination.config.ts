import { Injectable } from '@angular/core';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';

@Injectable({ providedIn: 'root' })
export class PaginationConfig {
  boundaryLinks = true;
  maxSize = 5;
  pageSize = ITEMS_PER_PAGE;
  size = 'sm';
}
