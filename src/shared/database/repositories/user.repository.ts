import { Injectable } from '@nestjs/common';
import { User } from '../../../modules/users/entities/user.entity';
import { PrismaService } from '../prisma.service';

export interface IUsersRepository {
  createWithWallet(user: User): Promise<{ id: string }>;
  findByEmail(email: string): Promise<User | null>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createWithWallet(user: User) {
    const createdUser = await this.prismaService.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.getPassword(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        wallet: {
          create: {
            balance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });

    return {
      id: createdUser.id,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    return user
      ? new User({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
      : null;
  }
}
