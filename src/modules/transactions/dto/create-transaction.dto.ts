import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  receiverUserId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01, { message: 'O valor deve ser maior que 0' })
  amount: number;

  @IsString()
  description?: string;
}
