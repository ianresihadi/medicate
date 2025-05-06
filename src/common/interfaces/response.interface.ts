export interface ResponseInterface<T = any> {
  statusCode: number;
  message: string | string[];
  data?: T;
  error?: string;
}

export interface ResponsePaginationInterface<T = any> {
  statusCode: number;
  message: string | string[];
  data?: T;
  count?: number;
  currentPage?: number;
  totalPages?: number;
  error?: string;
}
