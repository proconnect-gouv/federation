import { v4 as uuidv4 } from 'uuid';
import { DeleteResult, ObjectId } from 'mongodb';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LoggerService } from '../logger/logger.service';

import { ICrudTrack } from '../interfaces';

import { Scopes } from './scopes.mongodb.entity';
import { IScopes } from './interface';

@Injectable()
export class ScopesService {
  constructor(
    @InjectRepository(Scopes, 'fc-mongo')
    private readonly scopesRepository: Repository<Scopes>,
    private readonly logger: LoggerService,
  ) {}

  private track(log: ICrudTrack) {
    this.logger.businessEvent(log);
  }

  /**
   * Create new scopes entry.
   *
   * @param {IScopes} newScope
   * @returns {Promise<Scopes>}
   */
  async create(newScope: IScopes, user: string) {
    const id = uuidv4().substring(0, 12);

    const scopeToSave: Scopes = {
      _id: new ObjectId(id),
      scope: newScope.scope,
      label: `${newScope.label} (${newScope.fd})`,
      updatedBy: user,
      fd: newScope.fd,
    };

    const result = await this.scopesRepository.insert(scopeToSave);

    const insertedId = result.identifiers[0].id;

    this.track({
      entity: 'scope',
      action: 'create',
      user,
      id: insertedId,
      name: newScope.scope,
    });

    return insertedId;
  }

  /**
   * Update scopes.
   *
   * @param {ObjectId} id
   * @param {IScopes} newScopes
   * @returns {Promise<Scopes>}
   */
  async update(
    _id: ObjectId,
    user: string,
    newScope: IScopes,
  ): Promise<Scopes> {
    this.track({
      entity: 'scope',
      action: 'update',
      user,
      id: _id.toString(),
      name: newScope.scope,
    });

    const { fd, label, scope } = newScope;
    const oldScope: IScopes = await this.getById(_id);
    const oldFd = ScopesService.getFdNameFromLabel(oldScope.label);
    const newLabel = newScope.label.replace(`(${oldFd})`, '').trim();

    /**
     * @TODO Remove the concatenation of the label + fd.
     * it shouldn't be anymore necessary.
     * @ticket FC-xxx
     * @author brice
     * @date 2021-08-12
     */
    const scopeToUpdate: Scopes = {
      scope,
      _id,
      updatedBy: user,
      label: `${newLabel} (${fd})`,
      fd,
    };

    const result = await this.scopesRepository.save(scopeToUpdate);

    return result;
  }

  async remove(_id: ObjectId, user: string) {
    const scope = await this.scopesRepository.findOneBy({ _id });

    await this.scopesRepository.delete({ _id });

    this.track({
      entity: 'scope',
      action: 'delete',
      user,
      id: _id.toString(),
      name: scope.scope,
    });

    return scope;
  }

  /**
   * Get scope labels list.
   *
   * @return {Promise<Scopes[]>}
   */
  async getAll(): Promise<Scopes[]> {
    return await this.scopesRepository.find();
  }

  /**
   * Get scopes list grouped by fd.
   * @returns {Promise<Record<string, Scopes[]>>}
   */
  async getScopesGroupedByFd(): Promise<Record<string, Scopes[]>> {
    const allScopes = await this.scopesRepository.find();

    return allScopes.reduce<Record<string, Scopes[]>>((acc, scope) => {
      const fdMetadata = acc[scope.fd] || [];
      return { ...acc, [scope.fd]: [...fdMetadata, scope] };
    }, {});
  }

  /**
   * Get a scope by its ID.
   *
   * @param {ObjectId} id Unic ID for a specific scope to retreive.
   * @returns {Promise<IScopes>}
   */
  async getById(_id: ObjectId): Promise<IScopes> {
    const scope = await this.scopesRepository.findOneBy({ _id });
    return scope;
  }

  /**
   * Extract the `fd` name from the label.
   * The RegExp extract the content of the parentessis.
   * Ex: label = `My Label (FD-NAME)` > return `FD-NAME`.
   *
   * @param {string} label
   * @returns {string}
   *
   *
   * @TODO Remove the concatenation of the label + fd.
   * it shouldn't be anymore necessary.
   * @ticket FC-xxx
   * @author brice
   * @date 2021-08-12
   */
  private static getFdNameFromLabel(label: string): string {
    const regExp = /\(([^()]*)\)/;
    const getFd = regExp.exec(label);
    return getFd && getFd.length > 0 ? getFd[1] : '';
  }
}
