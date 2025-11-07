export class CreateTransactionDto {
  senderWalletId: string;
  receiverWalletId: string;
  amount: number;
  description?: string;
}
