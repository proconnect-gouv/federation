import { v4 as uuid } from 'uuid';
import { DeleteResult, ObjectID, Repository } from 'mongodb';
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

  /**
   * Create new claim.
   *
   * @param {IClaims} newClaim
   * @returns {Promise<Claims>}
   */
  async create({ name }: IClaims): Promise<Claims> {
    const id = (uuid() as string).substr(0, 12);

    const claimToSave: IClaims = {
      id: new ObjectID(id),
      name,
    };

    const result = await this.claimsRepository.save(claimToSave);
    return result;
  }

  /**
   * Update claim.
   *
   * @param {string} id
   * @param {IClaims} newClaim
   * @returns {Promise<Claims>}
   */
  async update(id: string, { name }: IClaims): Promise<Claims> {
    const claimToUpdate: IClaims = {
      name,
      id,
    };

    const result = await this.claimsRepository.save(claimToUpdate);
    return result;
  }

  /**
   * Delete claim
   * @param {string} id
   * @returns {Promise<DeleteResult>}
   */
  async remove(id: string): Promise<DeleteResult> {
    const result = await this.claimsRepository.delete(id);
    return result;
  }

  /**
   * Get claims list.
   *
   * @return {Promise<Claims[]>}
   */
  async getAll(): Promise<Claims[]> {
    const result = await this.claimsRepository.find();
    return result;
  }

  /**
   * Get a claim by ID.
   *
   * @param {ObjectID} id
   * @returns {Promise<IClaims>}
   */
  async getById(id: string): Promise<IClaims> {
    const result = await this.claimsRepository.findOne(id);
    return result;
  }
}
