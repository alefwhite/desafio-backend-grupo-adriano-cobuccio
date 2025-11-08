import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Transaction } from '../../../modules/transactions/entities/transaction.entity';
import { PrismaTransaction } from '../unit-of-work';

export interface ITransactionRepository {
  create(
    senderWalletId: string,
    receiverWalletId: string,
    amount: number,
    idempotencyKey: string,
    description?: string,
    tx?: PrismaTransaction,
  ): Promise<{ id: string }>;
  findById(id: string): Promise<Transaction | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<{ id: string } | null>;
  revertTransaction(
    id: string,
    idempotencyKey: string,
    tx: PrismaTransaction,
  ): Promise<void>;
}

@Injectable()
export class TransactionsRepository implements ITransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    senderWalletId: string,
    receiverWalletId: string,
    amount: number,
    idempotencyKey: string,
    description?: string,
    tx?: PrismaTransaction,
  ) {
    const prisma = tx ?? this.prismaService;

    const created = await prisma.transaction.create({
      data: {
        senderWalletId,
        receiverWalletId,
        amount,
        idempotencyKey,
        description,
        status: 'COMPLETED',
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
          idempotencyKey: transaction.idempotencyKey,
          description: transaction.description ?? undefined,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt ?? undefined,
        })
      : null;
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { idempotencyKey },
    });

    return transaction
      ? new Transaction({
          id: transaction.id,
          senderWalletId: transaction.senderWalletId,
          receiverWalletId: transaction.receiverWalletId,
          amount: Number(transaction.amount),
          idempotencyKey: transaction.idempotencyKey,
          status: transaction.status,
          description: transaction.description ?? undefined,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt ?? undefined,
        })
      : null;
  }

  async revertTransaction(
    id: string,
    idempotencyKey: string,
    tx: PrismaTransaction,
  ) {
    await tx.transaction.update({
      where: { id },
      data: {
        status: 'REVERSED',
        idempotencyKey,
      },
    });
  }
}
