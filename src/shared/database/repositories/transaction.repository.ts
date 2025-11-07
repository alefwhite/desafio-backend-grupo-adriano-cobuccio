import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Transaction } from '../../../modules/transactions/entities/transaction.entity';
import { PrismaTransaction } from '../unit-of-work';

export interface ITransactionRepository {
  create(
    senderWalletId: string,
    receiverWalletId: string,
    amount: number,
    description?: string,
    tx?: PrismaTransaction,
  ): Promise<{ id: string }>;

  findById(id: string): Promise<Transaction | null>;
}

@Injectable()
export class TransactionsRepository implements ITransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    senderWalletId: string,
    receiverWalletId: string,
    amount: number,
    description?: string,
    tx?: PrismaTransaction,
  ) {
    const prisma = tx ?? this.prismaService;

    const created = await prisma.transaction.create({
      data: {
        senderWalletId,
        receiverWalletId,
        amount,
        description,
      },
    });

    return { id: created.id };
  }

  async findById(id: string) {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
    });

    return transaction
      ? new Transaction({
          id: transaction.id,
          senderWalletId: transaction.senderWalletId,
          receiverWalletId: transaction.receiverWalletId,
          amount: Number(transaction.amount),
          status: transaction.status,
          description: transaction.description ?? undefined,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt ?? undefined,
        })
      : null;
  }
}
