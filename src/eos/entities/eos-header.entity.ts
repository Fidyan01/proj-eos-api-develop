import { Expose } from 'class-transformer';
import { EEOSStatus } from 'src/shares/enums/common.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'eos_headers',
})
export class EosHeader {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({
    name: 'eos_id',
    type: 'varchar',
    length: 64,
    unique: true,
    nullable: false,
  })
  EOSID: string;

  @Expose()
  @Column({
    name: 'hash_id',
    type: 'varchar',
    length: 64,
    unique: true,
    nullable: false,
  })
  HashID: string;

  @Expose()
  @Column({
    name: 'start_transaction',
    type: 'varchar',
    length: 64,
    default: '0',
  })
  StartOfTransaction: string;

  @Expose()
  @Column({
    name: 'end_transaction',
    type: 'varchar',
    length: 64,
    default: '0',
  })
  EndOfTransaction: string;

  @Expose()
  @Column({ name: 'imo_number', type: 'varchar', length: 64, default: '0' })
  IMONumber: string;

  @Expose()
  @Column({ name: 'arrival_id', type: 'varchar', length: 64, default: '0' })
  ArrivalID: string;

  @Expose()
  @Column({ name: 'vessel_name', type: 'varchar', length: 64, nullable: false })
  VesselName: string;

  @Expose()
  @Column({ name: 'jetty', type: 'varchar', length: 64, nullable: false })
  Jetty: string;

  @Expose()
  @Column({
    name: 'terminal_name',
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  TerminalName: string;

  @Expose()
  @Column({ name: 'trader_name', type: 'varchar', length: 64, nullable: false })
  TraderName: string;

  @Expose()
  @Column({ name: 'agent', type: 'varchar', length: 64, nullable: false })
  Agent: string;

  @Expose()
  @Column({ name: 'status', type: 'varchar', length: 64, nullable: false })
  Status: string;

  @Expose()
  @Column({ name: 'berthing_pilotage_id', type: 'int', nullable: false })
  BerthingPilotageID: number;

  @Expose()
  @Column({ name: 'vessel_size', type: 'int', nullable: false })
  VesselSize: number;

  @Expose()
  @Column({
    name: 'pilotage_location_from_1',
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  PilotageLocationFrom1: string;

  @Expose()
  @Column({
    name: 'pilotage_location_to_1',
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  PilotageLocationTo1: string;

  @Expose()
  @Column({
    name: 'arrival_status',
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  ArrivalStatus: string;

  @Expose()
  @Column({ name: 'unberthing_pilotage_id', type: 'int', nullable: false })
  UnberthingPilotageID: number;

  @Expose()
  @Column({
    name: 'pilotage_location_from_2',
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  PilotageLocationFrom2: string;

  @Expose()
  @Column({
    name: 'pilotage_location_to_2',
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  PilotageLocationTo2: string;

  @Expose()
  @Column({ name: 'record_status', default: '0' })
  RecordStatus: EEOSStatus;

  @Expose()
  @Column({ name: 'tx_hash' })
  txHash: string;

  @Expose()
  @Column({ name: 'note' })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
