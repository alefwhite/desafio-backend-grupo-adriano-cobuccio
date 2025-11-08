import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/create-auth.dto';
import { UnauthorizedException } from '@nestjs/common';

/* eslint-disable @typescript-eslint/unbound-method */

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      signin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST /auth/signin)', () => {
    const signinDto: SigninDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should return access token on successful signin', async () => {
      const expectedResult = { accessToken: 'jwt-token-123' };
      authService.signin.mockResolvedValue(expectedResult);

      const result = await controller.create(signinDto);

      expect(result).toEqual(expectedResult);
      expect(authService.signin).toHaveBeenCalledWith(signinDto);
      expect(authService.signin).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      authService.signin.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.create(signinDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.signin).toHaveBeenCalledWith(signinDto);
    });

    it('should handle different signin attempts', async () => {
      const testCases = [
        {
          dto: { email: 'user1@test.com', password: 'pass1' },
          token: 'token1',
        },
        {
          dto: { email: 'user2@test.com', password: 'pass2' },
          token: 'token2',
        },
      ];

      for (const testCase of testCases) {
        authService.signin.mockResolvedValue({
          accessToken: testCase.token,
        });

        const result = await controller.create(testCase.dto);

        expect(result.accessToken).toBe(testCase.token);
        expect(authService.signin).toHaveBeenCalledWith(testCase.dto);
      }
    });
  });
});
