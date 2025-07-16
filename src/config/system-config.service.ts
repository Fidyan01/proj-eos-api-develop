import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemConfigService {
  constructor(private configService: ConfigService) {}
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get defaultDeviceUsername(): string {
    return 'root';
  }

  get defaultDevicePassword(): string {
    return 'root';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV', 'development');
  }

  //   PRIVATE_KEY=0xf4f278dd7abd22e07ce4c0aa6ec1b8d8444c2ccbb83f81dc16360b337ca1043e
  // SMARTCONTRACT_ADDRESS=0xbE474124B5FCf78f25Af704f27fF7Df845cBE834
  // GOERLI_URL=https://goerli.infura.io/v3/2b3f62613bc2428b9058e2e588f40564
  // PROVIDER=https://arbitrum-goerli.infura.io/v3/2b3f62613bc2428b9058e2e588f40564

  get provider(): string {
    return this.getString('PROVIDER', '');
  }

  get sender(): string {
    return this.getString('SENDER', '');
  }

  get confirmation(): number {
    return this.getNumber('CONFIRMATION', 10);
  }

  get smartcontract(): string {
    return this.getString('SMARTCONTRACT_ADDRESS', '');
  }

  get privatekey(): string {
    return this.getString('PRIVATE_KEY', '');
  }

  private getString(key: string, defaultValue?: string): string {
    const value = this.configService.get(key, defaultValue);

    if (!value) {
      console.warn(`"${key}" environment variable is not set`);
      return;
    }
    return value.toString().replace(/\\n/g, '\n');
  }
  private getNumber(key: string, defaultValue?: number): number {
    const value = this.configService.get(key, defaultValue);
    if (value === undefined) {
      throw new Error(key + ' env var not set'); // probably we should call process.exit() too to avoid locking the service
    }
    try {
      return Number(value);
    } catch {
      throw new Error(key + ' env var is not a number');
    }
  }
  private getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.configService.get(key, defaultValue?.toString());
    if (value === undefined) {
      throw new Error(key + ' env var not set');
    }
    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }
}
