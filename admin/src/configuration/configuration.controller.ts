import * as moment from 'moment-timezone';
import { plainToClass } from 'class-transformer';

import {
  Controller,
  Get,
  Render,
  Post,
  Body,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';

import { UserRole } from '@pc/shared/user/roles.enum';
import { Roles } from '@pc/shared/authentication/decorator/roles.decorator';
import { FormErrorsInterceptor } from '@pc/shared/form/interceptor/form-errors.interceptor';

import { ConfigurationService } from './configuration.service';
import { Configuration } from './entity/configuration.mongodb.entity';
import { IndisponibiliteDTO } from './dto/indisponibilite.dto';

@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('/indisponibilite')
  @Roles(UserRole.OPERATOR)
  @Render('configuration/indisponibilite')
  async indisponibilite(@Req() req) {
    const csrfToken = req.csrfToken();
    let data;
    if (!req.session?.flash?.values?.[0]) {
      data = await this.configurationService.getLastConfigIndisponibilityData();
      return { csrfToken, data, moment };
    }
    data = plainToClass(IndisponibiliteDTO, req.session.flash.values[0]);
    return { csrfToken, data, moment };
  }

  @Post('/indisponibilite')
  @Roles(UserRole.OPERATOR)
  @UseInterceptors(new FormErrorsInterceptor(`/configuration/indisponibilite`))
  @Render('configuration/indisponibilite')
  async setIndisponibilite(
    @Body() indisponibilite: IndisponibiliteDTO,
    @Req() req,
    @Res() res,
  ) {
    const csrfToken = req.csrfToken();
    let data: Configuration;

    try {
      data = await this.configurationService.updateConfigWithNewMessage(
        indisponibilite,
        req.user.username,
      );
      req.flash(
        'success',
        `La modification du message d'indisponibilité a été réalisée avec succès !`,
      );
      return { csrfToken, data, moment };
    } catch (err) {
      req.flash(
        'globalError',
        "Suite à une erreur la modification du message d'indisponibilité n'a pas été réalisée !",
      );
    }
  }
}
