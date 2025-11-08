import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID do usuário que receberá a transferência',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  receiverUserId: string;

  @ApiProperty({
    description: 'Valor da transferência (deve ser maior que 0)',
    example: 100.5,
    minimum: 0.01,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01, { message: 'O valor deve ser maior que 0' })
  amount: number;

  @ApiProperty({
    description:
      'Chave de idempotência para evitar transações duplicadas (UUID)',
    example: '660e8400-e29b-41d4-a716-446655440001',
    type: String,
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  idempotencyKey: string;

  @ApiPropertyOptional({
    description: 'Descrição opcional da transação',
    example: 'Pagamento de serviço',
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
