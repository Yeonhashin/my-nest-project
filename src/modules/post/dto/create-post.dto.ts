import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({ example: '게시글 내용' })
  content: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '게시글 이미지 url' })
  imageUrl?: string;
}
