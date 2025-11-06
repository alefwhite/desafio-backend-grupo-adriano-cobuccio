import { Injectable } from '@nestjs/common';
import { User } from '../../../modules/users/entities/user.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: User) {
    const createdUser = await this.prismaService.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.getPassword(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
