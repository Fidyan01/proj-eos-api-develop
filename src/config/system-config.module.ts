import { Global, Module } from '@nestjs/common';
import { SystemConfigService } from 'src/config/system-config.service';

@Global()
@Module({
  imports: [],
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}
