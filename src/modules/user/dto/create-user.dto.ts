import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@test.com',
    description: '사용자 이메일 (로그인 ID)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'a1234',
    description:
      '비밀번호 (4~8자, 영문자와 숫자 최소 1개 이상 포함)',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()-_=+]{4,8}$/, {
    message: '패스워드에는 영문자와 숫자가 하나 이상 포함되어야 합니다.',
  })
  password: string;

  @ApiProperty({
    example: 'yeonhi',
    description: '사용자 닉네임',
  })
  @IsString()
  nickname: string;
}
