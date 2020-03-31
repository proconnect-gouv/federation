import { Module, Global } from '@nestjs/common';

import { mongooseProvider } from './mongoose.provider';

@Global()
@Module({
  imports: [mongooseProvider],
  exports: [mongooseProvider],
})
export class MongooseModule {}
