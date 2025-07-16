import {
  EnumFieldOptional,
  NumberFieldOption,
  StringFieldOption,
} from 'src/shares/decorators/field.decorator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PageOptionsDto {
  @NumberFieldOption({
    minimum: 1,
    default: 1,
    int: true,
  })
  readonly page: number = 1;

  @NumberFieldOption({
    minimum: 1,
    maximum: 100,
    default: 10,
    int: true,
  })
  readonly limit: number = 10;

  @StringFieldOption()
  readonly orderBy: string;

  @EnumFieldOptional(() => Order, {
    default: Order.ASC,
  })
  readonly direction: Order = Order.ASC;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
