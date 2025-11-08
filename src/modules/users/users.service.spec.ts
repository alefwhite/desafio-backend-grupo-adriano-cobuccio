import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../../shared/database/repositories/user.repository';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockUsersRepository = {
      findByEmail: jest.fn(),
      createWithWallet: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should create a user successfully', async () => {
      const hashedPassword = 'hashed-password-123';
      const createdUser = {
        id: 'user-id-123',
        ...createUserDto,
        password: hashedPassword,
      };

      usersRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersRepository.createWithWallet.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(usersRepository.createWithWallet).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashedPassword,
        }),
      );
    });

    it('should throw ConflictException when email is already in use', async () => {
      const existingUser = {
        id: 'existing-user-id',
        name: 'Existing User',
        email: createUserDto.email,
        getPassword: () => 'hashed-password',
      } as User;

      usersRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'This email is already in use',
      );
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(usersRepository.createWithWallet).not.toHaveBeenCalled();
    });
  });
});
