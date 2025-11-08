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

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
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
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return await this.transactionsService.findTransaction(id);
  }

  @Post(':id/revert')
  @HttpCode(HttpStatus.OK)
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
