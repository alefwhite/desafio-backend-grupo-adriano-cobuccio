import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from '../../shared/database/repositories/user.repository';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const emailTaken = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (emailTaken) {
      throw new ConflictException('This email is already in use');
    }

    const hashedPassword = await hash(createUserDto.password, 12);

    const user = User.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.createWithWallet(user);
  }
}
