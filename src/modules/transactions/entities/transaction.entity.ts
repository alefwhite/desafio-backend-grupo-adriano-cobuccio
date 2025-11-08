export class Transaction {
  readonly id: string;
  public senderWalletId: string;
  public receiverWalletId: string;
  public amount: number;
  public status: string;
  public idempotencyKey: string;
  public description?: string;
  public createdAt: Date;
  public completedAt?: Date;

  constructor(data: TransactionData) {
    this.id = data.id;
    this.senderWalletId = data.senderWalletId;
    this.receiverWalletId = data.receiverWalletId;
    this.amount = data.amount;
    this.status = data.status;
    this.idempotencyKey = data.idempotencyKey;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.completedAt = data.completedAt;
  }

  static create(
    data: Omit<TransactionData, 'id' | 'createdAt' | 'completedAt' | 'status'>,
  ) {
    return new Transaction({
      id: crypto.randomUUID(),
      senderWalletId: data.senderWalletId,
      receiverWalletId: data.receiverWalletId,
      amount: data.amount,
      idempotencyKey: data.idempotencyKey,
      status: 'PENDING',
      description: data.description,
      createdAt: new Date(),
      completedAt: undefined,
    });
  }
}

type TransactionData = {
  id: string;
  senderWalletId: string;
  receiverWalletId: string;
  amount: number;
  status: string;
  idempotencyKey: string;
  description?: string;
  createdAt: Date;
  completedAt?: Date;
};
