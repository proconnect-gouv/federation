import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ObjectId } from "mongodb";
import { Repository } from "typeorm";
import { ICrudTrack } from "../interfaces";
import { LoggerService } from "../logger/logger.service";
import { PaginationOptions, PaginationService } from "../pagination";
import { FederationUser } from "./federation-user.mongodb.entity";

@Injectable()
export class FederationUserService {
  constructor(
    @InjectRepository(FederationUser, "fc-mongo")
    private readonly federationUserRepository: Repository<FederationUser>,
    private readonly logger: LoggerService,
    private readonly paginationService: PaginationService,
  ) {}

  private track(log: ICrudTrack) {
    this.logger.businessEvent(log);
  }

  async activateFederationUser(id: string, username: string) {
    this.track({
      entity: "federation-user",
      action: "update",
      user: username,
      name: "Activate Federation User",
      id,
    });
    const result = await this.federationUserRepository.update(
      { _id: new ObjectId(id) },
      { active: true },
    );

    return { affectedUsers: result.affected };
  }

  async deactivateFederationUser(id: string, username: string) {
    this.track({
      entity: "federation-user",
      action: "update",
      user: username,
      name: "Deactivate Federation User",
      id,
    });
    const result = await this.federationUserRepository.update(
      { _id: new ObjectId(id) },
      { active: false },
    );

    return { affectedUsers: result.affected };
  }

  async paginate(options: PaginationOptions) {
    const paginationParams =
      this.paginationService.buildPaginationParams(options);

    const [items, total] =
      await this.federationUserRepository.findAndCount(paginationParams);

    return {
      items: items.map((federationUser) =>
        this.convertEntityToDto(federationUser),
      ),
      total,
    };
  }

  private convertEntityToDto(federationUser: FederationUser) {
    return {
      _id: federationUser._id.toString(),
      sub: federationUser.sub,
      lastConnection: federationUser.lastConnection.toUTCString(),
      emails: federationUser.idpIdentityKeys.map((key) => key.idpMail),
      active: federationUser.active,
    };
  }
}
