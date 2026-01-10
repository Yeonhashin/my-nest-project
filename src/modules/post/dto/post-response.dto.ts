import { UserResponseDto } from '../../user/dto/user-response.dto';

export class PostResponseDto {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  user: UserResponseDto;
}
