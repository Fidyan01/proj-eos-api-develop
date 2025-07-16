import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'meta',
})
export class Meta {
  @Expose()
  @Column({ name: 'key' })
  @PrimaryColumn()
  key: string;

  @Expose()
  @Column({ type: 'json', name: 'value' })
  value: any;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
