import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountService } from './services';
import { AccountSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
  ],
  providers: [AccountService],
  exports: [AccountService, MongooseModule],
})
export class AccountModule {}
