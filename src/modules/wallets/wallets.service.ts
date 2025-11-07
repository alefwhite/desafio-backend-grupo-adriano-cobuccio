import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { WalletsRepository } from '../../shared/database/repositories/wallet.repository';

@Injectable()
export class WalletsService {
  constructor(private readonly walletsRepository: WalletsRepository) {}

  async create(dto: CreateWalletDto) {
    const wallet = Wallet.create({ userId: dto.userId });
    return this.walletsRepository.create(wallet);
  }

  async findOne(id: string) {
    const wallet = await this.walletsRepository.findById(id);
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }
}
