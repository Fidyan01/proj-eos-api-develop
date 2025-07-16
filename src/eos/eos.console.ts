import { Command, Console } from 'nestjs-console';
import EosService from 'src/eos/eos.service';
import { EEOSStatus } from 'src/shares/enums/common.enum';
import { encrypt, decrypt } from 'src/shares/helpers/encryption';

@Console()
export class EOSConsole {
  constructor(private readonly eosService: EosService) {}

  @Command({
    command: 'encrypt <input>',
    description: 'encrypt input',
  })
  encrypt(input: string) {
    const output = encrypt(input);

    console.log(output);

    process.exit(0);
  }

  @Command({
    command: 'scan:eos',
    description: 'scan and resend EOS failed tx',
  })
  async scanAndResendEOSTx() {
    const failedTx = await this.eosService.filterEOS({
      status: EEOSStatus.FAILED,
    });

    const pendingTx = await this.eosService.filterEOS({
      status: EEOSStatus.PENDING,
      pendingTimeOverInSec: 20 * 60, // 20mins
    });

    await this.eosService.resendEOSs([...failedTx, ...pendingTx]);
    process.exit(0);
  }

  @Command({
    command: 'scan:eos-header',
    description: 'scan and resend EOS Header failed tx',
  })
  async scanAndResendEOSHeaderTx() {
    const failedTx = await this.eosService.filterEOSHeader({
      status: EEOSStatus.FAILED,
    });

    const pendingTx = await this.eosService.filterEOSHeader({
      status: EEOSStatus.PENDING,
      pendingTimeOverInSec: 20 * 60, // 20mins
    });

    await this.eosService.resendEOSHeaders([
      ...failedTx,
      ...pendingTx,
    ] as any[]);
    process.exit(0);
  }
}
