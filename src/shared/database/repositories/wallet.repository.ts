import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Wallet } from '../../../modules/wallets/entities/wallet.entity';

@Injectable()
export class WalletsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(wallet: Wallet) {
    const created = await this.prismaService.wallet.create({
      data: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    });

    return { id: created.id };
  }

  async findById(id: string) {
    const w = await this.prismaService.wallet.findUnique({ where: { id } });
    return w
      ? new Wallet({
          id: w.id,
          userId: w.userId,
          balance: Number(w.balance),
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })
      : null;
  }

  async findByUserId(userId: string) {
    const w = await this.prismaService.wallet.findUnique({ where: { userId } });

    return w
      ? new Wallet({
          id: w.id,
          userId: w.userId,
          balance: Number(w.balance),
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })
      : null;
  }

  async updateBalance(id: string, balance: number) {
    const updated = await this.prismaService.wallet.update({
      where: { id },
      data: { balance },
    });

    return { id: updated.id };
  }
}
