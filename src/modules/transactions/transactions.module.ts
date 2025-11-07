import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [PrismaService, TransactionsService],
})
export class TransactionsModule {}
