import { Injectable } from '@nestjs/common';
import { WalletsRepository } from '../../shared/database/repositories/wallet.repository';

@Injectable()
export class WalletsService {
  constructor(private readonly walletsRepository: WalletsRepository) {}
}
