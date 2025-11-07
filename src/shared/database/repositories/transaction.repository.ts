import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TransactionEntity } from '../../../modules/transactions/entities/transaction.entity';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createTransaction(
    senderWalletId: string,
    receiverWalletId: string,
    amount: number,
    description?: string,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          senderWalletId,
          receiverWalletId,
          amount,
          description,
        },
      });

      await tx.wallet.update({
        where: { id: senderWalletId },
        data: { balance: { decrement: amount } },
      });

      await tx.wallet.update({
        where: { id: receiverWalletId },
        data: { balance: { increment: amount } },
      });

      return { id: created.id };
    });
  }

  async findById(id: string) {
    const t = await this.prismaService.transaction.findUnique({
      where: { id },
    });

    return t
      ? new TransactionEntity({
          id: t.id,
          senderWalletId: t.senderWalletId,
          receiverWalletId: t.receiverWalletId,
          amount: Number(t.amount),
          status: t.status,
          description: t.description ?? undefined,
          createdAt: t.createdAt,
          completedAt: t.completedAt ?? undefined,
        })
      : null;
  }
}
