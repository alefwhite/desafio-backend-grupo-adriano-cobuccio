import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto): Promise<any> {
    return await this.transactionsService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.transactionsService.findOne(id);
  }
}
