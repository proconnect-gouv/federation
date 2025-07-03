import * as moment from 'moment-timezone';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Configuration } from './entity/configuration.mongodb.entity';
import { IndisponibiliteDTO } from './dto/indisponibilite.dto';
import { Repository } from 'typeorm';
import { MongoDriver } from 'typeorm/driver/mongodb/MongoDriver';

@Injectable()
export class ConfigurationService {
  private db: any;
  constructor(
    @InjectRepository(Configuration, 'fc-mongo')
    private readonly configurationRepository: Repository<Configuration>,
  ) {
    const mongoDriver = this.configurationRepository.manager.connection
      .driver as MongoDriver;
    const dbConnection = mongoDriver.queryRunner.databaseConnection;

    this.db = dbConnection.db('fc').collection('configuration');
  }

  async getLastConfig() {
    const lastConfiguration = await this.db
      .find()
      .sort({ '_meta.creation_date': -1 })
      .limit(1)
      .toArray();

    return lastConfiguration[0];
  }

  async getLastConfigIndisponibilityData() {
    const allConfigData = await this.getLastConfig();
    const data = {
      activateMessage: allConfigData.features.displayMessageOnLogin,
      messageOnLogin: { ...allConfigData.messageOnLogin },
    };

    return data;
  }

  /**
   * Update the messageOnLogin part
   * of the last configuration
   * @param newMessageInfo
   */
  async updateConfigWithNewMessage(
    newMessageInfo: IndisponibiliteDTO,
    user,
  ): Promise<any> {
    const lastConfig = await this.getLastConfig();

    delete lastConfig._id;

    lastConfig.messageOnLogin.message = newMessageInfo.message;
    lastConfig.messageOnLogin.startDate = newMessageInfo.dateDebut;
    lastConfig.messageOnLogin.stopDate = newMessageInfo.dateFin;
    lastConfig.messageOnLogin.startHour = moment
      .tz(newMessageInfo.heureDebut, 'HH:mm', 'Europe/Paris')
      .tz('UTC')
      .format('HH:mm');
    lastConfig.messageOnLogin.stopHour = moment
      .tz(newMessageInfo.heureFin, 'HH:mm', 'Europe/Paris')
      .tz('UTC')
      .format('HH:mm');
    lastConfig.features.displayMessageOnLogin = newMessageInfo.activateMessage;
    lastConfig._meta.author = user;
    lastConfig._meta.creation_date = new Date();

    this.configurationRepository.save(lastConfig);

    return lastConfig;
  }
}
