import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsRepository } from '../../shared/database/repositories/transaction.repository';
import { WalletsRepository } from '../../shared/database/repositories/wallet.repository';
import { UnitOfWork } from '../../shared/database/unit-of-work';
import { RevertTransactionDto } from './dto/revert-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly walletsRepository: WalletsRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async create(dto: CreateTransactionDto & { senderUserId: string }) {
    const existingTransaction =
      await this.transactionsRepository.findByIdempotencyKey(
        dto.idempotencyKey,
      );

    if (existingTransaction) {
      return {
        id: existingTransaction.id,
      };
    }

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
        dto.idempotencyKey,
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

  async revertTransaction({
    transactionId,
    userId,
    idempotencyKey,
  }: RevertTransactionDto & { userId: string; transactionId: string }) {
    const existingTransaction =
      await this.transactionsRepository.findByIdempotencyKey(idempotencyKey);

    if (existingTransaction) {
      if (existingTransaction.id !== transactionId) {
        throw new BadRequestException(
          'Idempotency key already used for another transaction',
        );
      }

      if (existingTransaction.status === 'REVERSED') {
        throw new BadRequestException('Transaction has already been reverted');
      }

      return existingTransaction;
    }

    const transaction =
      await this.transactionsRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === 'REVERSED') {
      throw new BadRequestException('Transaction has already been reverted');
    }

    const senderWallet = await this.walletsRepository.findOne(
      transaction.senderWalletId,
    );

    if (!senderWallet) {
      throw new NotFoundException('Sender wallet not found');
    }

    if (userId !== senderWallet.userId) {
      throw new BadRequestException(
        'Only the sender can revert the transaction',
      );
    }

    return this.unitOfWork.transaction(async (tx) => {
      await this.walletsRepository.updateBalanceByUserId(
        senderWallet.userId,
        transaction.amount,
        'increment',
        tx,
      );

      const receiverWallet = await this.walletsRepository.findOne(
        transaction.receiverWalletId,
      );

      if (!receiverWallet) {
        throw new NotFoundException('Receiver wallet not found');
      }

      await this.walletsRepository.updateBalanceByUserId(
        receiverWallet.userId,
        transaction.amount,
        'decrement',
        tx,
      );

      await this.transactionsRepository.revertTransaction(
        transaction.id,
        idempotencyKey,
        tx,
      );
    });
  }

  async findTransaction(id: string) {
    const transaction = await this.transactionsRepository.findById(id);

    if (!transaction) throw new NotFoundException('Transaction not found');

    return transaction;
  }
}
