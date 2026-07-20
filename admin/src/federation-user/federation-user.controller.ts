import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Render,
  Req,
  Res,
  UseInterceptors,
} from "@nestjs/common";
import { Roles } from "../authentication/decorator/roles.decorator";
import { FormErrorsInterceptor } from "../form/interceptor/form-errors.interceptor";
import { UserRole } from "../user/roles.enum";
import { VALID_EMAIL_REGEX_STRING } from "../utils/regex/valid-email-regex";
import { FederationUserService } from "./federation-user.service";

@Controller("federation-user")
export class FederationUserController {
  constructor(private readonly federationUserService: FederationUserService) {}

  /**
   * Lists the federation users
   */
  @Get()
  @Roles(UserRole.SECURITY)
  @Render("federation-user/list")
  async list(
    @Req() req,
    @Query("search") querySearch?: string,
    @Query("page") queryPage: string = "1",
    @Query("limit") queryLimit: string = "10",
  ) {
    const UUID_REGEX_STRING =
      "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
    const searchPattern = `^(${UUID_REGEX_STRING}|${VALID_EMAIL_REGEX_STRING})$`;
    const page = parseInt(queryPage, 10);
    const limit = parseInt(queryLimit, 10);
    const csrfToken = req.csrfToken();
    const { items: paginatedFederationUsers, total: totalItems } =
      await this.federationUserService.paginate({
        page,
        limit,
        search: querySearch
          ? {
              fields: [
                {
                  name: "sub",
                  searchKind: "exactMatch",
                  pattern: new RegExp(UUID_REGEX_STRING),
                },
                {
                  name: "idpIdentityKeys.idpMail",
                  searchKind: "exactMatch",
                  pattern: new RegExp(VALID_EMAIL_REGEX_STRING),
                },
              ],
              value: querySearch,
            }
          : undefined,
      });

    return {
      federationUsers: paginatedFederationUsers,
      totalItems,
      csrfToken,
      page,
      limit,
      querySearch,
      searchPattern,
    };
  }

  /**
   * Deactivates a federation user account
   */
  @Patch(":id/deactivate")
  @Roles(UserRole.SECURITY)
  @UseInterceptors(new FormErrorsInterceptor("/federation-user"))
  async deactivateFederationUser(
    @Param("id") _id: string,
    @Req() req,
    @Res() res,
    @Body() body,
  ) {
    const { affectedUsers } =
      await this.federationUserService.deactivateFederationUser(
        _id,
        req.user.username,
      );
    if (affectedUsers === 0) {
      req.flash(
        "error",
        `L'utilisateur de Fédération ${body.sub} n'a pas pu être bloqué !`,
      );
    } else {
      req.flash(
        "success",
        `L'utilisateur de Fédération ${body.sub} a été bloqué avec succès !`,
      );
    }
    return res.redirect("/federation-user");
  }
  /**
   * Activates a federation user account
   */
  @Patch(":id/activate")
  @Roles(UserRole.SECURITY)
  @UseInterceptors(new FormErrorsInterceptor("/federation-user"))
  async activateFederationUser(
    @Param("id") _id: string,
    @Req() req,
    @Res() res,
    @Body() body,
  ) {
    const { affectedUsers } =
      await this.federationUserService.activateFederationUser(
        _id,
        req.user.username,
      );
    if (affectedUsers === 0) {
      req.flash(
        "error",
        `L'utilisateur de Fédération ${body.sub} n'a pas pu être débloqué !`,
      );
    } else {
      req.flash(
        "success",
        `L'utilisateur de Fédération ${body.sub} a été débloqué avec succès !`,
      );
    }
    return res.redirect("/federation-user");
  }
}
