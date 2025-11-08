import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

/* eslint-disable @typescript-eslint/unbound-method */

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST /users)', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      const expectedResult = {
        id: 'user-id-123',
        name: createUserDto.name,
        email: createUserDto.email,
      };

      usersService.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when email is already in use', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('This email is already in use'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle multiple user creation requests', async () => {
      const users = [
        {
          dto: { name: 'User 1', email: 'user1@test.com', password: 'pass1' },
          result: { id: 'id1', name: 'User 1', email: 'user1@test.com' },
        },
        {
          dto: { name: 'User 2', email: 'user2@test.com', password: 'pass2' },
          result: { id: 'id2', name: 'User 2', email: 'user2@test.com' },
        },
      ];

      for (const user of users) {
        usersService.create.mockResolvedValue(user.result as any);

        const result = await controller.create(user.dto);

        expect(result).toEqual(user.result);
        expect(usersService.create).toHaveBeenCalledWith(user.dto);
      }
    });
  });
});
