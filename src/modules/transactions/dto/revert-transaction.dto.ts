import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RevertTransactionDto {
  @ApiProperty({
    description:
      'Chave de idempotência para o estorno (evita estornos duplicados)',
    example: '770e8400-e29b-41d4-a716-446655440002',
    type: String,
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  idempotencyKey: string;
}
