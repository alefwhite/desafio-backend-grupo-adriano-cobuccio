import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class DepositWalletDto {
  @ApiProperty({
    description: 'Valor do depósito (deve ser maior que 0)',
    example: 100.5,
    minimum: 0.01,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01, { message: 'O valor deve ser maior que 0' })
  amount: number;
}
