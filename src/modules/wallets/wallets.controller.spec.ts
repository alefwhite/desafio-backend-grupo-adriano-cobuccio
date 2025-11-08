import { Test, TestingModule } from '@nestjs/testing';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { DepositWalletDto } from './dto/deposit-wallet.dto';

/* eslint-disable @typescript-eslint/unbound-method */

describe('WalletsController', () => {
  let controller: WalletsController;
  let walletsService: jest.Mocked<WalletsService>;

  beforeEach(async () => {
    const mockWalletsService = {
      deposit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [
        {
          provide: WalletsService,
          useValue: mockWalletsService,
        },
      ],
    }).compile();

    controller = module.get<WalletsController>(WalletsController);
    walletsService = module.get(WalletsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST /wallets/deposits)', () => {
    const userId = 'user-id-123';
    const depositDto: DepositWalletDto = {
      amount: 100.5,
    };

    it('should deposit money successfully', async () => {
      walletsService.deposit.mockResolvedValue(undefined);

      await controller.create(depositDto, userId);

      expect(walletsService.deposit).toHaveBeenCalledWith({
        userId,
        amount: depositDto.amount,
      });
      expect(walletsService.deposit).toHaveBeenCalledTimes(1);
    });

    it('should handle different deposit amounts', async () => {
      const testCases = [
        { amount: 0.01, userId: 'user-1' },
        { amount: 1000, userId: 'user-2' },
        { amount: 99.99, userId: 'user-3' },
      ];

      for (const testCase of testCases) {
        walletsService.deposit.mockResolvedValue(undefined);

        await controller.create({ amount: testCase.amount }, testCase.userId);

        expect(walletsService.deposit).toHaveBeenCalledWith({
          userId: testCase.userId,
          amount: testCase.amount,
        });
      }
    });

    it('should propagate service errors', async () => {
      const error = new Error('Database error');
      walletsService.deposit.mockRejectedValue(error);

      await expect(controller.create(depositDto, userId)).rejects.toThrow(
        error,
      );
      expect(walletsService.deposit).toHaveBeenCalledWith({
        userId,
        amount: depositDto.amount,
      });
    });
  });
});
