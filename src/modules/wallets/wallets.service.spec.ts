import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { WalletsRepository } from '../../shared/database/repositories/wallet.repository';

/* eslint-disable @typescript-eslint/unbound-method */

describe('WalletsService', () => {
  let service: WalletsService;
  let walletsRepository: jest.Mocked<WalletsRepository>;

  beforeEach(async () => {
    const mockWalletsRepository = {
      deposit: jest.fn(),
      findByUserId: jest.fn(),
      updateBalanceByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: WalletsRepository,
          useValue: mockWalletsRepository,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
    walletsRepository = module.get(WalletsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should deposit money into wallet successfully', async () => {
      const depositData = {
        userId: 'user-id-123',
        amount: 100.5,
      };

      walletsRepository.deposit.mockResolvedValue(undefined);

      await service.deposit(depositData);

      expect(walletsRepository.deposit).toHaveBeenCalledWith(depositData);
      expect(walletsRepository.deposit).toHaveBeenCalledTimes(1);
    });

    it('should handle different amounts', async () => {
      const testCases = [
        { userId: 'user-1', amount: 0.01 },
        { userId: 'user-2', amount: 1000 },
        { userId: 'user-3', amount: 99.99 },
      ];

      for (const testCase of testCases) {
        walletsRepository.deposit.mockResolvedValue(undefined);

        await service.deposit(testCase);

        expect(walletsRepository.deposit).toHaveBeenCalledWith(testCase);
      }
    });
  });
});
