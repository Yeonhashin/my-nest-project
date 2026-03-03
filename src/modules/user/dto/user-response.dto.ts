import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    description: '사용자 ID',
  })
  id: number;

  @ApiProperty({
    example: 'user@test.com',
    description: '사용자 이메일',
  })
  email: string;
}
