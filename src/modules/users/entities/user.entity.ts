export class User {
  readonly id: string;
  public name: string;
  public email: string;
  private readonly password: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: DataConstructor) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static create(
    data: Omit<DataConstructor, 'id' | 'createdAt' | 'updatedAt'>,
  ): User {
    return new User({
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  getPassword(): string {
    return this.password;
  }
}

type DataConstructor = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};
