import { v4 as uuidv4 } from 'uuid';
import { DeleteResult, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Claims } from './claims.mongodb.entity';
import { IClaims } from './interface';

@Injectable()
export class ClaimsService {
  baseClaims: IClaims[] = null;

  constructor(
    @InjectRepository(Claims, 'fc-mongo')
    private readonly claimsRepository: Repository<Claims>,
  ) {}

  async create({ name }: IClaims): Promise<Claims> {
    const id = (uuidv4() as string).substr(0, 12);

    const claimToSave: IClaims = {
      id,
      name,
    };

    const result = await this.claimsRepository.save(claimToSave);
    return result;
  }

  async update(id: string, { name }: IClaims): Promise<Claims> {
    const claimToUpdate: IClaims = {
      name,
      id,
    };

    const result = await this.claimsRepository.save(claimToUpdate);
    return result;
  }

  async remove(id: string): Promise<DeleteResult> {
    const result = await this.claimsRepository.delete(id);
    return result;
  }

  async getAll(): Promise<Claims[]> {
    const result = await this.claimsRepository.find();
    return result;
  }

  async getById(id: string): Promise<IClaims> {
    const result = await this.claimsRepository.findOneBy({ id });
    return result;
  }
}
