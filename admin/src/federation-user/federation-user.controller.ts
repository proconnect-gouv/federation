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
import { type PaginationSortDirectionType } from "../pagination";
import { UserRole } from "../user/roles.enum";
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
    @Query("sortField") querySortField?: string,
    @Query("sortDirection")
    querySortDirection: PaginationSortDirectionType = "asc",
    @Query("page") queryPage: string = "1",
    @Query("limit") queryLimit: string = "10",
  ) {
    const page = parseInt(queryPage, 10);
    const limit = parseInt(queryLimit, 10);
    const csrfToken = req.csrfToken();
    const { items: paginatedFederationUsers, total: totalItems } =
      await this.federationUserService.paginate({
        page,
        limit,
        search: querySearch
          ? { fields: ["sub", "idpIdentityKeys.idpMail"], value: querySearch }
          : undefined,
        sort: querySortField
          ? { field: querySortField, direction: querySortDirection }
          : undefined,
        defaultSort: {
          field: "createdAt",
          direction: "desc",
        },
      });

    return {
      federationUsers: paginatedFederationUsers,
      totalItems,
      csrfToken,
      page,
      limit,
      querySortField,
      querySortDirection,
      querySearch,
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
