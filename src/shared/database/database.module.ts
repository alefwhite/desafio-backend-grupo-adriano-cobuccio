import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { UsersRepository } from './repositories/user.repository';
import { WalletsRepository } from './repositories/wallet.repository';
import { TransactionsRepository } from './repositories/transaction.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UsersRepository,
    WalletsRepository,
    TransactionsRepository,
  ],
  exports: [UsersRepository, WalletsRepository, TransactionsRepository],
})
export class DatabaseModule {}
