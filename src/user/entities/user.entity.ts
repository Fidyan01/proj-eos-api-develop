import {Exclude, Expose} from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from 'src/user-role/entities/user-role.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  @Index()
  name: string;

  @Expose()
  @Column()
  email: string;

  @Expose()
  @Column()
  password: string;

  @Expose()
  @Column()
  type: string;

  @Expose()
  @Column()
  status: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
