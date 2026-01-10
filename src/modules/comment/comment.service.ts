import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../../database/entities/post.entity';
import { User } from '../../database/entities/user.entity';
import { Comment } from '../../database/entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
    constructor (
         @InjectRepository(Post)
         private readonly postRepo: Repository<Post>,
 
         @InjectRepository(User)
         private readonly userRepo: Repository<User>,

         @InjectRepository(Comment)
         private readonly commentRepo: Repository<Comment>,
     ) {}   

    async create (
        postId: number, 
        userId: number, 
        dto: CreateCommentDto
    ) {

        console.log('[comment-create] postId : '+ postId + ', userId : ' + userId + ', dto : ' + dto);

        // 게시글이 존재하는지 확인 존재하지 않을 경우 에러 내기 
        const post = await this.postRepo.findOneBy({ id: postId });
        if (!post) throw new NotFoundException();

        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new NotFoundException('User not found');

        // 작성한 댓글을 댓글 테이블에 삽입 삽입 실패시 에러 내기 
        const comment = this.commentRepo.create({
            content: dto.content,
            post,
            user,
        });

        return this.commentRepo.save(comment);    
    }

    async update(
        commentId: number,
        userId: number,
        dto: UpdateCommentDto
    ) {

        console.log('[comment-update] commentId : '+ commentId + ', userId : ' + userId + ', dto : ' + dto);

        const comment = await this.commentRepo.findOne({
        where: { id: commentId },
        relations: ['user'],
        });

        if (!comment) throw new NotFoundException();
        if (comment.user.id !== userId) throw new ForbiddenException();

        comment.content = dto.content;
        return this.commentRepo.save(comment);
    }

    async remove(
        commentId: number, 
        userId: number
        ) {

        console.log(' [comment-remove] commentId : '+ commentId + ', userId : ' + userId);

        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['user'],
        });

        if (!comment) throw new NotFoundException();
        if (comment.user.id !== userId) throw new ForbiddenException();

        await this.commentRepo.softRemove(comment);
        return { success: true };
        }
}
