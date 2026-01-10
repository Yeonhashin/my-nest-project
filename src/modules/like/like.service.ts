import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/database/entities/post.entity';
import { Like } from 'src/database/entities/like.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class LikeService {
    constructor (
            @InjectRepository(Post)
            private readonly postRepo: Repository<Post>,
    
            @InjectRepository(Like)
            private readonly likeRepo: Repository<Like>,

    ) {}

    async likePost(userId: number, postId: number){
        const post = await this.postRepo.findOne({
            where: {id: postId},
            relations: ['user'],
        })

        if(!post){
            throw new NotFoundException('게시물이 존재하지 않습니다.');
        }

        if(post.user.id === userId){
            throw new ForbiddenException('내가 쓴 글에는 좋아요를 할 수 없습니다.');
        }

        const like = await this.likeRepo.findOne({
            where: {
                post: {id: postId},
                user: {id: userId}
            },
            withDeleted: true,
        });

        if (like) {
            if(like.deletedAt === null){
                throw new ConflictException('이미 좋아요한 게시글입니다.');
            }
            await this.likeRepo.restore(like.id);
            return { success: true };
        }

        const newLike = this.likeRepo.create({
            post: { id: postId },
            user: { id: userId },
        });

        try {
            await this.likeRepo.save(newLike);
        } catch (e) {
            throw new ConflictException('이미 좋아요한 게시글입니다.');
        }
        return { success: true };
    }

    async unlikePost(userId: number, postId: number){
        const like = await this.likeRepo.findOne({
            where: {
                post: { id: postId },
                user: { id: userId },
                deletedAt: IsNull(),
            },
        });
        
        if (!like) {
            throw new NotFoundException('좋아요 내역이 없습니다.');
        }

        await this.likeRepo.softDelete(like.id);
        return { success: true };
    }
}
