import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: '수정할 댓글 내용입니다.' })
  content: string;
}