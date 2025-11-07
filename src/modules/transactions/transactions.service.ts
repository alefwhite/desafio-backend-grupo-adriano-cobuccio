import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsRepository } from '../../shared/database/repositories/transaction.repository';
import { WalletsRepository } from '../../shared/database/repositories/wallet.repository';
import { UnitOfWork } from '../../shared/database/unit-of-work';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly walletsRepository: WalletsRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async create(dto: CreateTransactionDto & { senderUserId: string }) {
    if (dto.amount <= 0)
      throw new BadRequestException('Amount must be greater than zero');

    const senderWallet = await this.walletsRepository.findByUserId(
      dto.senderUserId,
    );

    if (!senderWallet) {
      throw new NotFoundException('Sender wallet not found');
    }

    const receiverWallet = await this.walletsRepository.findByUserId(
      dto.receiverUserId,
    );

    if (!receiverWallet) {
      throw new NotFoundException('Receiver wallet not found');
    }

    if (senderWallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.unitOfWork.transaction(async (tx) => {
      const transactionResult = await this.transactionsRepository.create(
        senderWallet.id,
        receiverWallet.id,
        dto.amount,
        dto.description,
        tx,
      );

      await this.walletsRepository.updateBalanceByUserId(
        senderWallet.userId,
        dto.amount,
        'decrement',
        tx,
      );

      await this.walletsRepository.updateBalanceByUserId(
        receiverWallet.userId,
        dto.amount,
        'increment',
      );

      return transactionResult;
    });
  }

  async findOne(id: string) {
    const transaction = await this.transactionsRepository.findById(id);

    if (!transaction) throw new NotFoundException('Transaction not found');

    return transaction;
  }
}
