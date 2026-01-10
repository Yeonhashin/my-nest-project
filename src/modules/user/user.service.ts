// src/user/user.service.ts
import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashed,
      nickname: dto.nickname,
    });

      console.log('register service', dto.email);

    try {
      const saved = await this.userRepo.save(user);
      console.log(await this.userRepo.save(user));
      return { id: saved.id, email: saved.email, nickname: saved.nickname };
    } catch (err: any) {
      // Postgres unique violation code: 23505
      if (err?.code === '23505') {
        throw new BadRequestException('이미 사용 중인 이메일입니다.');
      }
      throw new InternalServerErrorException('회원가입 중 오류가 발생했습니다.');
    }
  }

  // private users = [
  //   {
  //     id: 1,
  //     email: 'test@test.com',
  //     password: '$2b$10$ABCDE1234567890ABCDE1234567890ABCDE1234567890ABCDE', // bcrypt 해시
  //     nickname: 'tester',
  //   },
  // ];

  // async findByEmail(email: string) {
  //   return this.users.find((u) => u.email === email);
  // }

  async findByEmail(email: string){
    return this.userRepo.findOne({ where: { email } });
  }

  async findMe(userId: number){
    console.log('USER SERVICE HIT');
    const user = await this.userRepo.findOne({
      where: {id: userId},
      select: ['id', 'email', 'nickname', 'createdAt'],
    });

    if(!user){
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: number, dto: UpdateUserDto) {
    if (!dto.nickname && !dto.password) {
      throw new BadRequestException('No update fields');
    }

    const updateData: any = {};

    if (dto.nickname) {
      updateData.nickname = dto.nickname;
    }

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepo.update(userId, updateData);

    return { success: true };
  }

}
