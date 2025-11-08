import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Wallet } from '../../../modules/wallets/entities/wallet.entity';
import { PrismaTransaction } from '../unit-of-work';

export interface IWalletsRepository {
  deposit(data: { userId: string; amount: number }): Promise<void>;
  findByUserId(userId: string): Promise<Wallet | null>;
  updateBalanceByUserId(
    userId: string,
    amount: number,
    operation: 'increment' | 'decrement',
    tx?: PrismaTransaction,
  ): Promise<void>;
  findOne(walletId: string): Promise<Wallet | null>;
}

@Injectable()
export class WalletsRepository implements IWalletsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async deposit({
    userId,
    amount,
  }: {
    userId: string;
    amount: number;
  }): Promise<void> {
    await this.prismaService.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async findByUserId(userId: string) {
    const wallet = await this.prismaService.wallet.findUnique({
      where: { userId },
    });

    return wallet
      ? new Wallet({
          id: wallet.id,
          userId: wallet.userId,
          balance: Number(wallet.balance),
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt,
        })
      : null;
  }

  async updateBalanceByUserId(
    userId: string,
    amount: number,
    operation: 'increment' | 'decrement',
    tx?: PrismaTransaction,
  ) {
    const prisma = tx ?? this.prismaService;

    await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          [operation]: amount,
        },
      },
    });
  }

  async findOne(walletId: string) {
    const wallet = await this.prismaService.wallet.findUnique({
      where: { id: walletId },
    });

    return wallet
      ? new Wallet({
          id: wallet.id,
          userId: wallet.userId,
          balance: Number(wallet.balance),
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt,
        })
      : null;
  }
}
