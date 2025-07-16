import { Exclude, Expose } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({
  name: 'user_role',
})
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({
    name: 'user_id',
  })
  userId: number;

  @Expose()
  @Column({
    name: 'role_id',
  })
  roleId: number;

  @Expose()
  @Column()
  @Index()
  name: string;

  @Expose()
  @Column()
  @Index()
  code: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
