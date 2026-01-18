import { PageResponseDto } from "src/common/dto/page-response.dto";
import { SearchPostResponseDto } from "./search-post.response.dto";
import { SearchUserResponseDto } from "./search-user.response.dto";

export class SearchResponseDto {
  posts?: PageResponseDto<SearchPostResponseDto>;
  users?: PageResponseDto<SearchUserResponseDto>;
}
