import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class DepositWalletDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01, { message: 'O valor deve ser maior que 0' })
  amount: number;
}
