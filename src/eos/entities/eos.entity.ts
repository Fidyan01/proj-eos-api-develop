import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'eos',
})
export class Eos {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ name: 'arrival_id' })
  arrivalID: string;

  @Expose()
  @Column({ name: 'woid' })
  woid: string;

  @Expose()
  @Column({ name: 'prd_id' })
  prdID: string;

  @Expose()
  @Column({ name: 'event_stage' })
  eventStage: string;

  @Expose()
  @Column({ name: 'substage' })
  substage: string;

  @Expose()
  @Column({ name: 'timestamp' })
  timestamp: string;

  @Expose()
  @Column({ name: 'unix_time' })
  unixTime: number;

  @Expose()
  @Column({ name: 'hash_id' })
  hashID: string;

  @Expose()
  @Column({ name: 'status', default: '0' })
  status: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
