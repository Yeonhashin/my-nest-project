export class PageResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
