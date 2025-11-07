import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { UsersRepository } from './repositories/user.repository';
import { WalletsRepository } from './repositories/wallet.repository';
import { TransactionsRepository } from './repositories/transaction.repository';
import { UnitOfWork } from './unit-of-work';

@Global()
@Module({
  providers: [
    PrismaService,
    UsersRepository,
    WalletsRepository,
    TransactionsRepository,
    UnitOfWork,
  ],
  exports: [
    UsersRepository,
    WalletsRepository,
    TransactionsRepository,
    UnitOfWork,
  ],
})
export class DatabaseModule {}
