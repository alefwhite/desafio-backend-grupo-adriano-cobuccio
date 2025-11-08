import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RevertTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  idempotencyKey: string;
}
