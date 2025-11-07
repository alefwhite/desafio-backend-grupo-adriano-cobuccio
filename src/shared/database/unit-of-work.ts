import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '../../../generated/prisma/client';

export type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface IUnitOfWork {
  transaction<T>(work: (tx: PrismaTransaction) => Promise<T>): Promise<T>;
}

@Injectable()
export class UnitOfWork implements IUnitOfWork {
  constructor(private readonly prismaService: PrismaService) {}

  transaction<T>(work: (tx: PrismaTransaction) => Promise<T>): Promise<T> {
    return this.prismaService.$transaction(work);
  }
}
