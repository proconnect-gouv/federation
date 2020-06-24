import { Module } from '@nestjs/common';
import { MockServiceProviderService } from './mock-service-provider.service';

@Module({
  providers: [MockServiceProviderService],
  exports: [MockServiceProviderService],
})
export class MockServiceProviderModule {}
