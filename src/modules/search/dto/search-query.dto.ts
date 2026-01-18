import { IsString, IsOptional, IsIn } from 'class-validator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

export class SearchQueryDto extends PageQueryDto {
  @IsString()
  keyword: string;

  @IsOptional()
  @IsIn(['post', 'user', 'all'])
  target: 'post' | 'user' | 'all' = 'all';
}
