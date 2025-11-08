import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { RevertTransactionDto } from './dto/revert-transaction.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';

/* eslint-disable @typescript-eslint/unbound-method */

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: jest.Mocked<TransactionsService>;

  beforeEach(async () => {
    const mockTransactionsService = {
      create: jest.fn(),
      findTransaction: jest.fn(),
      revertTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST /transactions)', () => {
    const userId = 'sender-user-id';
    const createTransactionDto: CreateTransactionDto = {
      receiverUserId: 'receiver-user-id',
      amount: 100,
      description: 'Test transfer',
      idempotencyKey: 'idempotency-key-123',
    };

    it('should create a transaction successfully', async () => {
      const expectedResult = { id: 'transaction-id-123' };

      transactionsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTransactionDto, userId);

      expect(result).toEqual(expectedResult);
      expect(transactionsService.create).toHaveBeenCalledWith({
        ...createTransactionDto,
        senderUserId: userId,
      });
      expect(transactionsService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when amount is invalid', async () => {
      transactionsService.create.mockRejectedValue(
        new BadRequestException('Amount must be greater than zero'),
      );

      await expect(
        controller.create(createTransactionDto, userId),
      ).rejects.toThrow(BadRequestException);
      expect(transactionsService.create).toHaveBeenCalledWith({
        ...createTransactionDto,
        senderUserId: userId,
      });
    });

    it('should throw NotFoundException when wallet is not found', async () => {
      transactionsService.create.mockRejectedValue(
        new NotFoundException('Sender wallet not found'),
      );

      await expect(
        controller.create(createTransactionDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when balance is insufficient', async () => {
      transactionsService.create.mockRejectedValue(
        new BadRequestException('Insufficient balance'),
      );

      await expect(
        controller.create(createTransactionDto, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne (GET /transactions/:id)', () => {
    const transactionId = 'transaction-id-123';

    it('should return a transaction by id', async () => {
      const expectedTransaction = new Transaction({
        id: transactionId,
        senderWalletId: 'sender-wallet-id',
        receiverWalletId: 'receiver-wallet-id',
        amount: 100,
        idempotencyKey: 'idempotency-key',
        status: 'COMPLETED',
        createdAt: new Date(),
      });

      transactionsService.findTransaction.mockResolvedValue(
        expectedTransaction,
      );

      const result = await controller.findOne(transactionId);

      expect(result).toEqual(expectedTransaction);
      expect(transactionsService.findTransaction).toHaveBeenCalledWith(
        transactionId,
      );
      expect(transactionsService.findTransaction).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      transactionsService.findTransaction.mockRejectedValue(
        new NotFoundException('Transaction not found'),
      );

      await expect(controller.findOne(transactionId)).rejects.toThrow(
        NotFoundException,
      );
      expect(transactionsService.findTransaction).toHaveBeenCalledWith(
        transactionId,
      );
    });
  });

  describe('revert (POST /transactions/:id/revert)', () => {
    const userId = 'user-id-123';
    const transactionId = 'transaction-id-123';
    const revertDto: RevertTransactionDto = {
      idempotencyKey: 'revert-idempotency-key',
    };

    it('should revert a transaction successfully', async () => {
      transactionsService.revertTransaction.mockResolvedValue(undefined);

      await controller.revert(transactionId, revertDto, userId);

      expect(transactionsService.revertTransaction).toHaveBeenCalledWith({
        transactionId,
        idempotencyKey: revertDto.idempotencyKey,
        userId,
      });
      expect(transactionsService.revertTransaction).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      transactionsService.revertTransaction.mockRejectedValue(
        new NotFoundException('Transaction not found'),
      );

      await expect(
        controller.revert(transactionId, revertDto, userId),
      ).rejects.toThrow(NotFoundException);
      expect(transactionsService.revertTransaction).toHaveBeenCalledWith({
        transactionId,
        idempotencyKey: revertDto.idempotencyKey,
        userId,
      });
    });

    it('should throw BadRequestException when transaction already reverted', async () => {
      transactionsService.revertTransaction.mockRejectedValue(
        new BadRequestException('Transaction has already been reverted'),
      );

      await expect(
        controller.revert(transactionId, revertDto, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle idempotency key conflicts', async () => {
      transactionsService.revertTransaction.mockRejectedValue(
        new BadRequestException(
          'Idempotency key already used for another transaction',
        ),
      );

      await expect(
        controller.revert(transactionId, revertDto, userId),
      ).rejects.toThrow(BadRequestException);
      expect(transactionsService.revertTransaction).toHaveBeenCalledWith({
        transactionId,
        idempotencyKey: revertDto.idempotencyKey,
        userId,
      });
    });
  });
});
