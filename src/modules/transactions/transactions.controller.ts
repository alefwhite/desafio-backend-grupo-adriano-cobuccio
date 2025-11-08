import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { LoggedUserId } from '../../shared/decorators/current-user.decorator';
import { Transaction } from './entities/transaction.entity';
import { RevertTransactionDto } from './dto/revert-transaction.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova transação',
    description:
      'Realiza uma transferência entre carteiras. Requer autenticação. Usa chave de idempotência para evitar transações duplicadas.',
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({
    description: 'Transação criada com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '660e8400-e29b-41d4-a716-446655440003',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Saldo insuficiente, valor inválido ou não pode transferir para si mesmo',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Insufficient balance',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Carteira do remetente ou destinatário não encontrada',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado',
  })
  async create(
    @Body() dto: CreateTransactionDto,
    @LoggedUserId() userId: string,
  ): Promise<{ id: string }> {
    return await this.transactionsService.create({
      ...dto,
      senderUserId: userId,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar transação por ID',
    description: 'Retorna os detalhes de uma transação específica pelo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da transação',
    type: String,
    example: '660e8400-e29b-41d4-a716-446655440003',
  })
  @ApiResponse({
    status: 200,
    description: 'Transação encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '660e8400-e29b-41d4-a716-446655440003' },
        senderWalletId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        receiverWalletId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440002',
        },
        amount: { type: 'number', example: 100.5 },
        status: {
          type: 'string',
          enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
          example: 'COMPLETED',
        },
        description: { type: 'string', example: 'Pagamento de serviço' },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-08T10:00:00.000Z',
        },
        completedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-08T10:00:01.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Transação não encontrada',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado',
  })
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return await this.transactionsService.findTransaction(id);
  }

  @Post(':id/revert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Estornar transação',
    description:
      'Entorna uma transação completada, devolvendo o valor para a carteira do remetente. Usa chave de idempotência para evitar estornos duplicados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da transação a ser estornada',
    type: String,
    example: '660e8400-e29b-41d4-a716-446655440003',
  })
  @ApiBody({ type: RevertTransactionDto })
  @ApiResponse({
    status: 200,
    description: 'Transação estornada com sucesso',
  })
  @ApiBadRequestResponse({
    description:
      'Transação já foi estornada ou não pode ser estornada (status diferente de COMPLETED)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Transaction has already been reverted',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Transação não encontrada',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado',
  })
  async revert(
    @Param('id') id: string,
    @Body() { idempotencyKey }: RevertTransactionDto,
    @LoggedUserId() userId: string,
  ): Promise<void> {
    await this.transactionsService.revertTransaction({
      transactionId: id,
      idempotencyKey,
      userId,
    });
  }
}
