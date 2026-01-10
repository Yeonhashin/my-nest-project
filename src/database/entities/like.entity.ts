import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity({ name: 'likes' })
@Unique(['post', 'user'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.likes, { nullable: false, onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.likes, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
