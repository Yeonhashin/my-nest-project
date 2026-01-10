import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 외부 모듈 가져오기 : 다른 모듈의 Provider(Service, Repository)를 사용
  controllers: [UserController], // API 엔드포인트 : 이 모듈에서 HTTP 요청을 처리하는 컨트롤러 목록
  providers: [UserService], // 이 모듈의 로직 : 이 모듈에서 실제 로직을 담당하는 “서비스”들을 등록
  exports: [UserService], // 이 모듈이 외부에 제공하는 기능
})
export class UserModule {}
