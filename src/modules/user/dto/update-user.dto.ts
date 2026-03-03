import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'newNickname',
    description: '변경할 닉네임',
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({
    example: 'a1234',
    description: '변경할 비밀번호 (최소 4자)',
    writeOnly: true,
  })
  @IsOptional()
  @MinLength(4)
  password?: string;
}
