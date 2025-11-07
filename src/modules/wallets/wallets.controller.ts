import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { LoggedUserId } from '../../shared/decorators/current-user.decorator';
import { DepositWalletDto } from './dto/deposit-wallet.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('deposits')
  @HttpCode(HttpStatus.OK)
  create(
    @Body() depositWalletDto: DepositWalletDto,
    @LoggedUserId() userId: string,
  ) {
    return this.walletsService.deposit({
      userId,
      amount: depositWalletDto.amount,
    });
  }
}
