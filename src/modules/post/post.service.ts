import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';
import { Comment } from '../../database/entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostQueryDto } from './dto/get-post-query.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
    constructor (
        @InjectRepository(Post)
        private readonly postRepo: Repository<Post>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Comment)
        private readonly commentRepo: Repository<Comment>,
    ) {}

    async create(userId: number, dto: CreatePostDto): Promise<Post> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });

        if(!user) {
            throw new NotFoundException('User not found');
        }

        const post = this.postRepo.create({
            content: dto.content,
            imageUrl: dto.imageUrl,
            user,
        });

        return await this.postRepo.save(post);
    }

    async findAll(query: GetPostQueryDto): Promise<PostResponseDto[]> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const posts = await this.postRepo.find({
            where: { deletedAt: IsNull() },
            relations: { user: true },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return posts.map(post => ({
            id: post.id,
            content: post.content,
            imageUrl: post.imageUrl ?? null,
            createdAt: post.createdAt,
            user: {
                id: post.user.id,
                email: post.user.email,
            },
        }));
    }

    async findOne(postId: number) {
        const post = await this.postRepo.findOne({
            where: { id: postId },
            relations: ['user', 'comments', 'comments.user'],
            order: {
                comments: {
                    createdAt: 'ASC',
                },
            },
        });
        
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return {
            id: post.id,
            content: post.content,
            imageUrl: post.imageUrl ?? null,
            createdAt: post.createdAt,
            user: {
            id: post.user.id,
            email: post.user.email,
            },
            comments: post.comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            user: {
                id: comment.user.id,
                email: comment.user.email,
            },
            })),
        };
        }

    async update(postId: number, dto: UpdatePostDto, userId: number): Promise<PostResponseDto>{
        const post = await this.getPostWithPermission(postId, userId);

        if (dto.content !== undefined) {
            post.content = dto.content;
        }

        if (dto.imageUrl !== undefined) {
            post.imageUrl = dto.imageUrl === null ? undefined : dto.imageUrl;
        }

        await this.postRepo.save(post);

        return {
            id: post.id,
            content: post.content,
            imageUrl: post.imageUrl ?? null,
            createdAt: post.createdAt,
            user: {
            id: post.user.id,
            email: post.user.email,
            },
        };
    }

    async remove(postId: number, userId: number): Promise<void> {
        const post = await this.getPostWithPermission(postId, userId);

        await this.postRepo.softRemove(post);
    }

    private async getPostWithPermission(postId: number, userId: number) {
        const post = await this.postRepo.findOne({
            where: { id: postId, deletedAt: IsNull() },
            relations: { user: true },
        });

        if (!post) throw new NotFoundException();

        if (post.user.id !== userId) {
            throw new ForbiddenException();
        }
        return post;
    }
}
