import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class PostResponseDto {
  @ApiProperty({
    example: 1,
    description: '게시글 ID',
  })
  id: number;

  @ApiProperty({
    example: '게시글 내용입니다.',
    description: '게시글 본문 내용',
  })
  content: string;

  @ApiProperty({
    example: 'https://cdn.example.com/image.jpg',
    description: '게시글 이미지 URL',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example: '2026-01-01T12:00:00.000Z',
    description: '게시글 생성 시각',
  })
  createdAt: Date;

  @ApiProperty({
    description: '게시글 작성자 정보',
    type: () => UserResponseDto,
  })
  user: UserResponseDto;
}
