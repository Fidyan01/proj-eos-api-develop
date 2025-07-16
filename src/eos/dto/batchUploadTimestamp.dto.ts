export class SaveDataTimestampsDTO {
  data: StoreTimestampsDTO[];
  metaData: StoreMetaTimestampsDTO[];
}
export class StoreTimestampsDTO {
  EOSID: number;
  info: EventSubStageTimestamps;
}

export class StoreMetaTimestampsDTO {
  EOSID: number;
  info: EventSubStageTimestampsMeta;
}

export class EventSubStageTimestampsMeta {
  eventSubStage: number;
  timestamp: number;
}
export class EventSubStageTimestamp {
  field1: number;
  field2: number;
  field3: number;
  field4: number;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  field9: string;
}

export class EventSubStageTimestamps {
  e1: EventSubStageTimestamp;
  e2: EventSubStageTimestamp;
  e3: EventSubStageTimestamp;
  e4: EventSubStageTimestamp;
}
