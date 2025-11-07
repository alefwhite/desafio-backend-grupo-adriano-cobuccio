import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  async create(@Body() createWalletDto: CreateWalletDto): Promise<any> {
    return await this.walletsService.create(createWalletDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.walletsService.findOne(id);
  }
}
