import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from '../../shared/database/repositories/transaction.repository';
import { WalletsRepository } from '../../shared/database/repositories/wallet.repository';
import { UnitOfWork } from '../../shared/database/unit-of-work';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';

/* eslint-disable @typescript-eslint/unbound-method */

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionsRepository: jest.Mocked<TransactionsRepository>;
  let walletsRepository: jest.Mocked<WalletsRepository>;
  let unitOfWork: jest.Mocked<UnitOfWork>;

  const mockSenderWallet = new Wallet({
    id: 'sender-wallet-id',
    userId: 'sender-user-id',
    balance: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockReceiverWallet = new Wallet({
    id: 'receiver-wallet-id',
    userId: 'receiver-user-id',
    balance: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockTransactionsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdempotencyKey: jest.fn(),
      updateStatus: jest.fn(),
      reverseTransaction: jest.fn(),
    };

    const mockWalletsRepository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      updateBalanceByUserId: jest.fn(),
      deposit: jest.fn(),
    };

    const mockUnitOfWork = {
      transaction: jest.fn((callback) => callback({})),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: mockTransactionsRepository,
        },
        {
          provide: WalletsRepository,
          useValue: mockWalletsRepository,
        },
        {
          provide: UnitOfWork,
          useValue: mockUnitOfWork,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionsRepository = module.get(TransactionsRepository);
    walletsRepository = module.get(WalletsRepository);
    unitOfWork = module.get(UnitOfWork);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTransactionDto = {
      senderUserId: 'sender-user-id',
      receiverUserId: 'receiver-user-id',
      amount: 100,
      description: 'Test transfer',
      idempotencyKey: 'idempotency-key-123',
    };

    it('should return existing transaction if idempotency key already exists', async () => {
      const existingTransaction = new Transaction({
        id: 'existing-transaction-id',
        senderWalletId: 'sender-wallet-id',
        receiverWalletId: 'receiver-wallet-id',
        amount: 100,
        status: 'COMPLETED',
        idempotencyKey: 'idempotency-key',
        createdAt: new Date(),
      });

      transactionsRepository.findByIdempotencyKey.mockResolvedValue(
        existingTransaction,
      );

      const result = await service.create(createTransactionDto);

      expect(result).toEqual({ id: existingTransaction.id });
      expect(transactionsRepository.findByIdempotencyKey).toHaveBeenCalledWith(
        createTransactionDto.idempotencyKey,
      );
      expect(transactionsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when amount is zero or negative', async () => {
      transactionsRepository.findByIdempotencyKey.mockResolvedValue(null);

      await expect(
        service.create({ ...createTransactionDto, amount: 0 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create({ ...createTransactionDto, amount: -10 }),
      ).rejects.toThrow('Amount must be greater than zero');
    });

    it('should throw NotFoundException when sender wallet is not found', async () => {
      transactionsRepository.findByIdempotencyKey.mockResolvedValue(null);
      walletsRepository.findByUserId.mockResolvedValue(null);

      await expect(service.create(createTransactionDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createTransactionDto)).rejects.toThrow(
        'Sender wallet not found',
      );
      expect(walletsRepository.findByUserId).toHaveBeenCalledWith(
        createTransactionDto.senderUserId,
      );
    });

    it('should throw NotFoundException when receiver wallet is not found', async () => {
      transactionsRepository.findByIdempotencyKey.mockResolvedValue(null);
      walletsRepository.findByUserId
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(null);

      await expect(service.create(createTransactionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when sender has insufficient balance', async () => {
      const poorWallet = new Wallet({
        ...mockSenderWallet,
        balance: 50,
      });

      transactionsRepository.findByIdempotencyKey.mockResolvedValue(null);
      walletsRepository.findByUserId
        .mockResolvedValueOnce(poorWallet)
        .mockResolvedValueOnce(mockReceiverWallet);

      await expect(service.create(createTransactionDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create transaction successfully', async () => {
      const createdTransaction = { id: 'new-transaction-id' };

      transactionsRepository.findByIdempotencyKey.mockResolvedValue(null);
      walletsRepository.findByUserId
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(mockReceiverWallet);
      transactionsRepository.create.mockResolvedValue(createdTransaction);
      walletsRepository.updateBalanceByUserId.mockResolvedValue(undefined);

      const result = await service.create(createTransactionDto);

      expect(result).toEqual(createdTransaction);
      expect(transactionsRepository.create).toHaveBeenCalledWith(
        mockSenderWallet.id,
        mockReceiverWallet.id,
        createTransactionDto.amount,
        createTransactionDto.idempotencyKey,
        createTransactionDto.description,
        {},
      );
      expect(walletsRepository.updateBalanceByUserId).toHaveBeenCalledWith(
        mockSenderWallet.userId,
        createTransactionDto.amount,
        'decrement',
        {},
      );
      expect(walletsRepository.updateBalanceByUserId).toHaveBeenCalledWith(
        mockReceiverWallet.userId,
        createTransactionDto.amount,
        'increment',
      );
    });
  });

  describe('revertTransaction', () => {
    const revertDto = {
      userId: 'sender-user-id',
      transactionId: 'transaction-id-123',
      idempotencyKey: 'revert-idempotency-key',
    };

    it('should throw BadRequestException if transaction already reverted', async () => {
      const revertedTransaction = new Transaction({
        id: revertDto.transactionId,
        senderWalletId: 'sender-wallet-id',
        receiverWalletId: 'receiver-wallet-id',
        amount: 100,
        status: 'REVERSED',
        idempotencyKey: 'idempotency-key',
        createdAt: new Date(),
      });

      transactionsRepository.findByIdempotencyKey.mockResolvedValue(
        revertedTransaction,
      );

      await expect(service.revertTransaction(revertDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.revertTransaction(revertDto)).rejects.toThrow(
        'Transaction has already been reverted',
      );
    });

    it('should throw BadRequestException if idempotency key belongs to different transaction', async () => {
      const differentTransaction = new Transaction({
        id: 'different-transaction-id',
        senderWalletId: 'sender-wallet-id',
        receiverWalletId: 'receiver-wallet-id',
        amount: 100,
        status: 'COMPLETED',
        idempotencyKey: 'idempotency-key',
        createdAt: new Date(),
      });

      transactionsRepository.findByIdempotencyKey.mockResolvedValue(
        differentTransaction,
      );

      await expect(service.revertTransaction(revertDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.revertTransaction(revertDto)).rejects.toThrow(
        'Idempotency key already used for another transaction',
      );
    });
  });
});
