import { IsString, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: '생성할 댓글 내용입니다.' })
  content: string;
}