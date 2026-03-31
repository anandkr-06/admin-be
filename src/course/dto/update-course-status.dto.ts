import { IsEnum } from 'class-validator';
import { courseStatus } from 'src/common/enum';


export class UpdateCourseStatusDto {
  @IsEnum(courseStatus)
  status: courseStatus;
}