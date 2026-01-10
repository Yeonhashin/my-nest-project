import { IsString, IsOptional} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  imageUrl?: string | null;
}
