import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsRepository } from '../../shared/database/repositories/transaction.repository';
import { WalletsRepository } from '../../shared/database/repositories/wallet.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly walletsRepository: WalletsRepository,
  ) {}

  async create(dto: CreateTransactionDto) {
    if (dto.amount <= 0)
      throw new BadRequestException('Amount must be greater than zero');

    const senderWallet = await this.walletsRepository.findByUserId(
      dto.senderWalletId,
    );

    const receiverWallet = await this.walletsRepository.findByUserId(
      dto.receiverWalletId,
    );

    if (!senderWallet) {
      throw new NotFoundException('Sender wallet not found');
    }

    if (!receiverWallet) {
      throw new NotFoundException('Receiver wallet not found');
    }

    if (senderWallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.transactionsRepository.createTransaction(
      senderWallet.id,
      receiverWallet.id,
      dto.amount,
      dto.description,
    );
  }

  async findOne(id: string) {
    const tx = await this.transactionsRepository.findById(id);
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }
}
