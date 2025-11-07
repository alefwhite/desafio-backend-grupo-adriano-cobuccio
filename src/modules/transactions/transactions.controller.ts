import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { LoggedUserId } from '../../shared/decorators/current-user.decorator';

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
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.transactionsService.findOne(id);
  }
}
