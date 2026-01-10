import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, Index, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'follows' })
@Unique(['follower', 'following'])
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.followings, { nullable: false, onDelete: 'CASCADE' })
  @Index()
  follower: User;

  @ManyToOne(() => User, (user) => user.followers, { nullable: false, onDelete: 'CASCADE' })
  @Index()
  following: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
