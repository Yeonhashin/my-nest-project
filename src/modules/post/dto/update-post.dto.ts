import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '게시글 내용' })
  content?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '게시글 이미지 url' })
  imageUrl?: string | null;
}
