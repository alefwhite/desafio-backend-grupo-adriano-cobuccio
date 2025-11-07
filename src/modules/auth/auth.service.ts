import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SigninDto } from './dto/create-auth.dto';
import { UsersRepository } from '../../shared/database/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  private generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId });
  }

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;

    const user = await this.usersRepository.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordMatched = await compare(password, password);

    if (!isPasswordMatched)
      throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }
}
