export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
