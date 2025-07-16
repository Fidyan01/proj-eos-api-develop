import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  buildMessage,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  isNumber,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateBy,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isIsoDate, validateISO8601DateTime } from 'src/eos/utilities/helper';

import {
  ToArray,
  ToBoolean,
  ToLowerCase,
  ToUpperCase,
  Trim,
} from 'src/shares/decorators/transform.decorator';
import { getVariableName } from 'src/shares/helpers/util';

interface IBaseOptions {
  swagger?: boolean;
  expose?: boolean;
}

interface IStringFieldOptions extends IBaseOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
}

interface INumberFieldOptions extends IBaseOptions {
  each?: boolean;
  minimum?: number;
  maximum?: number;
  int?: boolean;
  isPositive?: boolean;
}

export function initDecoratorField(
  options: ApiPropertyOptions & Partial<{ expose: boolean }>,
  decorators: PropertyDecorator[],
) {
  if (options?.expose) {
    decorators.push(Expose());
  }

  if (options?.required === false) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  return applyDecorators(...decorators);
}

export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Number)];

  const { each, int, minimum, maximum, isPositive, swagger } = options;

  if (swagger !== false) {
    decorators.push(
      ApiProperty({ type: Number, ...options, example: int ? 1 : 1.2 }),
    );
  }

  if (each) {
    decorators.push(ToArray());
  }

  if (int) {
    decorators.push(IsInt({ each }));
  } else {
    decorators.push(IsNumber({}, { each }));
  }

  if (minimum && isNumber(minimum)) {
    decorators.push(Min(minimum, { each }));
  }

  if (maximum && isNumber(maximum)) {
    decorators.push(Max(maximum, { each }));
  }

  if (isPositive) {
    decorators.push(IsPositive({ each }));
  }

  return initDecoratorField(options, decorators);
}

export function NumberFieldOption(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  return NumberField({ ...options, required: false });
}

export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [IsNotEmpty(), IsString(), Trim()];
  const { swagger, minLength, maxLength, toLowerCase, toUpperCase } = options;

  if (swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  if (minLength) {
    decorators.push(MinLength(minLength));
  }

  if (maxLength) {
    decorators.push(MaxLength(maxLength));
  }

  if (toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (toUpperCase) {
    decorators.push(ToUpperCase());
  }

  return initDecoratorField(options, decorators);
}

export function StringFieldOption(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  return StringField({ ...options, required: false });
}

export function BooleanField(
  options: Omit<ApiPropertyOptions, 'type'> &
    Partial<{ swagger: boolean }> = {},
): PropertyDecorator {
  const decorators = [IsBoolean(), ToBoolean()];

  if (options?.swagger !== false) {
    decorators.push(ApiProperty({ type: Boolean, ...options }));
  }

  return initDecoratorField(options, decorators);
}

export function BooleanFieldOption(
  options: Omit<ApiPropertyOptions, 'type'> &
    Partial<{ swagger: boolean }> = {},
): PropertyDecorator {
  return BooleanField({ ...options, required: false });
}

export function EnumField<TEnum>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'enumName'> &
    Partial<{
      each: boolean;
      swagger: boolean;
      enumNumber: boolean;
    }> = {},
): PropertyDecorator {
  const enumValue = getEnum() as any;
  const decorators = [IsEnum(enumValue)];
  let description = '';

  if (options?.enumNumber) {
    const enumObject = Object.values(enumValue).filter(
      (x) => typeof x === 'string',
    );
    description = Object.keys(enumObject)
      .map((key) => enumObject[key] + ': ' + enumValue[enumObject[key]])
      .join(', ');
    decorators.push(Type(() => Number));
  } else {
    description = Object.values(enumValue)
      .map((key) => key)
      .join(', ');
  }

  if (options?.swagger !== false) {
    options = { ...options, description };
    decorators.push(
      ApiProperty({
        enumName: getVariableName(getEnum),
        ...options,
      }),
    );
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  return initDecoratorField(options, decorators);
}

export function EnumFieldOptional<TEnum>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum' | 'enumName'> &
    Partial<{ each: boolean; swagger: boolean; enumNumber: boolean }> = {},
): PropertyDecorator {
  return EnumField(getEnum, { ...options, required: false });
}

export function ISO8601Field(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [/* IsNotEmpty(), */ IsString(), Trim()];
  const { swagger } = options;

  if (swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  decorators.push(
    ValidateBy({
      name: 'ISO8601',
      validator: {
        validate: (value, args): boolean => {
          return validateISO8601DateTime(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + 'time must be a ISO 8601 format',
          null,
        ),
      },
    }),
  );

  return initDecoratorField(options, decorators);
}

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrString implements ValidatorConstraintInterface {
  validate(text: any, args: ValidationArguments) {
    return typeof text === 'number' || typeof text === 'string';
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) must be number or string and not overflow MAX_INT';
  }
}

@ValidatorConstraint({ name: 'less-than-uint32', async: false })
export class LessThanUint32 implements ValidatorConstraintInterface {
  validate(text: any, args: ValidationArguments) {
    if (Number(text > 4294967295)) return false;
    return typeof text === 'number' || typeof text === 'string';
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) must be number or string and not overflow MAX_UINT32';
  }
}
