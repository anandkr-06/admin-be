export class RefundRequestQueryDto {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'COMPLETED' | 'REJECTED';
  fromDate?: string;
  toDate?: string;
  search?: string;
}