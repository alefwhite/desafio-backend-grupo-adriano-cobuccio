import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { LoggedUserId } from '../../shared/decorators/current-user.decorator';
import { DepositWalletDto } from './dto/deposit-wallet.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('wallets')
@ApiBearerAuth('JWT-auth')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('deposits')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Realizar depósito na carteira',
    description:
      'Adiciona saldo à carteira digital do usuário autenticado. O valor deve ser maior que 0.',
  })
  @ApiBody({ type: DepositWalletDto })
  @ApiResponse({
    status: 200,
    description: 'Depósito realizado com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Valor inválido (deve ser maior que 0)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['O valor deve ser maior que 0'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado',
  })
  @ApiNotFoundResponse({
    description: 'Carteira não encontrada',
  })
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
