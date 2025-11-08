import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../../shared/database/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';

/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-id-123',
    name: 'John Doe',
    email: 'john@example.com',
    getPassword: () => 'hashed-password',
  } as User;

  beforeEach(async () => {
    const mockUsersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signin', () => {
    const signinDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should return access token when credentials are valid', async () => {
      const accessToken = 'jwt-token-123';

      usersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(accessToken);

      const result = await service.signin(signinDto);

      expect(result).toEqual({ accessToken });
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(signinDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signinDto.password,
        mockUser.getPassword(),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.signin(signinDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.signin(signinDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(signinDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signin(signinDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.signin(signinDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(signinDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signinDto.password,
        mockUser.getPassword(),
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
