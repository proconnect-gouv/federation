/* Temporay hard coded oidc values. 
   Remove eslint-disable once values are removed */
/* eslint-disable @typescript-eslint/camelcase */
import {
  Controller,
  Get,
  Next,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OidcProviderService } from './oidc-provider.service';
import { GetAuthorizeParamsDTO } from './dto';

@Controller('/api/v2')
export class OidcProviderController {
  constructor(private readonly oidcProviderService: OidcProviderService) {}

  // @TODO: validation query by DTO (current DTO is almost empty)
  @Get('/authorize')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getAuthorize(@Next() next, @Query() params: GetAuthorizeParamsDTO) {
    // Start of business related stuff
    console.log('### NEST /api/v2/authorize');
    console.log(params);
    // End of business related stuff

    // Pass the query to oidc-provider
    return next();
  }

  // @TODO validation query by DTO
  @Post('/token')
  postToken(@Next() next, @Req() req) {
    // Start of business related stuff
    console.log('### NEST /api/v2/token');
    console.log(req.body);
    // End of business related stuff

    // Pass the query to oidc-provider
    return next();
  }

  // @TODO validation query by DTO
  // (authorisation header, do we really need to add DTO check? 🤔)
  @Get('/userinfo')
  getUserInfo(@Req() req) {
    // Start of business related stuff
    console.log('### NEST /api/v2/userinfo');
    console.log(req.headers);
    console.log(req.session);
    // End of business related stuff

    // Return userinfo
    /**
     * @TODO Inject the service in charge of "getting" userinfo
     * Should be data comming from IdP / RNIPP
     * something like:
     * 
     * const token: string = this.getToken(req); // private 
     * 
     * return this.identityManagementService.getIdentity(token)
     */

    
    return {
      sub: '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
      given_name: 'Angela Claire Louise', 
      family_name: 'DUBOIS',
      birthdate: '1962-08-24',
      gender: 'female',
      birthplace: '75107',
      birthcountry: '99100',
      preferred_username: '',
      _claim_names: {},
      _claim_sources: {
        src1: {
          JWT:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Int9Ig.uJPwtftRcQEhR2JYi4rIetaSA1nVt2g0oI3dZnB3yts',
        },
      },
      phone_number: '0123456789',
      email: 'test@franceconnect.gouv.fr',
      address: {
        country: 'France',
        formatted: 'France Paris 75107 20 avenue de Ségur',
        locality: 'Paris',
        postal_code: '75107',
        street_address: '20 avenue de Ségur',
      },
    };
  }
}
