import { IsEnum } from 'class-validator';

export class UpdateReviewStatusDto {
  @IsEnum(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';
}