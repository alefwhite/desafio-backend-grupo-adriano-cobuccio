import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/create-auth.dto';
import { Public } from 'src/shared/decorators/is-public-route.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  create(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }
}
