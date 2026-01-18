import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, Index, DeleteDateColumn, Check, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Check(`"followerId" <> "followingId"`)
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  followerId: number;

  @Column()
  followingId: number;

  @ManyToOne(() => User, user => user.followings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @ManyToOne(() => User, user => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
