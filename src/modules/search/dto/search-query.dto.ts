import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

export class SearchQueryDto extends PageQueryDto {
  @ApiProperty({
    example: 'nestjs',
    description: '검색 키워드',
  })
  @IsString()
  keyword: string;

  @ApiPropertyOptional({
    example: 'all',
    description: '검색 대상 (post | user | all)',
    enum: ['post', 'user', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['post', 'user', 'all'])
  target: 'post' | 'user' | 'all' = 'all';
}
