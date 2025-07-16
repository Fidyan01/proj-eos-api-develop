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
  name: 'eos_v2',
})
export class EosV2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ name: 'eos_id' })
  EOSID: string;

  @Expose()
  @Column({ name: 'event_sub_stage' })
  EventSubStage: string;

  @Expose()
  @Column({ name: 'hash_id' })
  hashID: string;

  @Expose()
  @Column({ name: 'timestamp' })
  Timestamp: string;

  @Expose()
  @Column({ name: 'field1' })
  Field1: number;

  @Expose()
  @Column({ name: 'field2' })
  Field2: number;

  @Expose()
  @Column({ name: 'field3' })
  Field3: number;

  @Expose()
  @Column({ name: 'field4' })
  Field4: number;

  @Expose()
  @Column({ name: 'field5' })
  Field5: string;

  @Expose()
  @Column({ name: 'field6' })
  Field6: string;

  @Expose()
  @Column({ name: 'field7' })
  Field7: string;

  @Expose()
  @Column({ name: 'field8' })
  Field8: string;

  @Expose()
  @Column({ name: 'field9' })
  Field9: string;

  @Expose()
  @Column({ name: 'status', default: '0' })
  status: number;

  @Expose()
  @Column({ name: 'tx_hash' })
  txHash: string;

  @Expose()
  @Column({ name: 'note' })
  note: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
