import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  /* =========================
     REGISTER
  ========================= */

  async register(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      nickname: dto.nickname,
    });

    try {
      const saved = await this.userRepo.save(user);

      return {
        id: saved.id,
        email: saved.email,
        nickname: saved.nickname,
      };
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new BadRequestException('이미 사용 중인 이메일입니다.');
      }

      throw new InternalServerErrorException(
        '회원가입 중 오류가 발생했습니다.',
      );
    }
  }

  /* =========================
     FIND
  ========================= */

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findMe(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'nickname', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /* =========================
     UPDATE
  ========================= */

  async updateMe(userId: number, dto: UpdateUserDto) {
    const hasNickname = dto.nickname !== undefined;
    const hasPassword = dto.password !== undefined;

    if (!hasNickname && !hasPassword) {
      throw new BadRequestException('No update fields');
    }

    const updateData: Partial<User> = {};

    if (hasNickname) {
      updateData.nickname = dto.nickname!;
    }

    if (hasPassword) {
      updateData.password = await bcrypt.hash(dto.password!, 10);
    }

    await this.userRepo.update(userId, updateData);

    return { success: true };
  }
}
