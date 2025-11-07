export class Wallet {
  readonly id: string;
  public userId: string;
  public balance: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: WalletData) {
    this.id = data.id;
    this.userId = data.userId;
    this.balance = data.balance;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static create(
    data: Omit<WalletData, 'id' | 'createdAt' | 'updatedAt' | 'balance'>,
  ) {
    return new Wallet({
      id: crypto.randomUUID(),
      userId: data.userId,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

type WalletData = {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};
