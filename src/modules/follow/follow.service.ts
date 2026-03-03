import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from '../../database/entities/follow.entity';
import { User } from '../../database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FollowService {
    constructor (
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Follow)
        private readonly followRepo: Repository<Follow>,
    ) {}

    async follow(userId: number, targetUserId: number) {
        if (userId === targetUserId) {
            throw new ForbiddenException('자기 자신을 팔로우할 수 없습니다.');
        }

        const targetUser = await this.userRepo.findOne({
            where: { id: targetUserId },
        });

        if (!targetUser) {
            throw new NotFoundException('존재하지 않는 유저입니다.');
        }

        await this.followRepo.manager.transaction(async (manager) => {
            const followRepo = manager.getRepository(Follow);

            const follow = await followRepo.findOne({
            where: {
                follower: { id: userId },
                following: { id: targetUserId },
            },
            withDeleted: true,
            lock: { mode: 'pessimistic_write' },
            });

            if (follow && !follow.deletedAt) {
            throw new ConflictException('이미 팔로우한 유저입니다.');
            }

            if (follow && follow.deletedAt) {
            await followRepo.restore(follow.id);
            return;
            }

            const newFollow = followRepo.create({
            follower: { id: userId },
            following: { id: targetUserId },
            });

            await followRepo.save(newFollow);
        });

        return { success: true };
    }


    async unfollow(userId: number, targetUserId: number) {
        if (userId === targetUserId) {
            throw new ForbiddenException('자기 자신을 언팔로우할 수 없습니다.');
        }

        const targetUser = await this.userRepo.findOne({
            where: { id: targetUserId },
        });

        if (!targetUser) {
            throw new NotFoundException('존재하지 않는 유저입니다.');
        }

        await this.followRepo.manager.transaction(async (manager) => {
            const followRepo = manager.getRepository(Follow);
            const follow = await followRepo.findOne({
            where: {
                follower: { id: userId },
                following: { id: targetUserId },
            },
            withDeleted: true,
            lock: { mode: 'pessimistic_write' },
            });

            if (!follow) {
                throw new NotFoundException('팔로우한 이력이 존재하지 않습니다.');
            }

            if (follow.deletedAt) {
                return; 
            }

            await followRepo.softDelete(follow.id);
        });

        return { success: true };
    }

    // 로그인한 유저가 팔로잉 한 사람들 리스트 
    async getFollowings(userId: number) {
        return this.userRepo
            .createQueryBuilder('user')
            .innerJoin(
                Follow,
                'follow',
                'follow.followingId = user.id AND follow.followerId = :userId AND follow.deletedAt IS NULL',
                { userId },
            )
            .select(['user.id', 'user.email','user.nickname'])
            .getMany();
    }

    // 로그인한 유저의 팔로워들
    async getFollowers(userId: number) {
        return this.userRepo
            .createQueryBuilder('user')
            .innerJoin(
                Follow,
                'follow',
                'follow.followerId = user.id AND follow.followingId = :userId AND follow.deletedAt IS NULL',
                { userId },
            )
            .select(['user.id', 'user.email', 'user.nickname'])
            .getMany();
    }
}
