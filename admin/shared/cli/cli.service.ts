import { Console, Command } from 'nestjs-console';
import { validate } from 'class-validator';
import { ICreateUserDTO } from '@fc/shared/user/interface/create-user-dto.interface';
import { CreateUserDto } from '@fc/shared/account/dto/create-user.dto';
import { UserService } from '@fc/shared/user/user.service';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';
import { UserRole } from '@fc/shared/user/roles.enum';

@Console()
export class CliService {
  constructor(
    private readonly userService: UserService,
    private readonly totpService: TotpService,
  ) {}

  @Command({
    command: 'user:create <username> <email> <roles>',
    description: 'Creates a new user',
  })
  async createUser(username: string, email: string, roles: string) {
    try {
      const user = await this.getUser(username, email, roles);

      await this.userService.createUser(user, 'cli');

      // We are in a CLI app
      // tslint:disable-next-line no-console
      console.log(user.password);
      process.exit(0);
    } catch (error) {
      // tslint:disable-next-line no-console
      console.error(`
        Impossible de créer le compte
        Message : ${error.message}
      `);
      process.exit(1);
    }
  }

  private async getUser(
    username: string,
    email: string,
    rolesInput: string,
  ): Promise<ICreateUserDTO> {
    const password = this.userService.generateTmpPass();
    const roles = this.getRoles(rolesInput);
    const secret = this.totpService.generateTotpSecret();

    const user: ICreateUserDTO = new CreateUserDto(
      username,
      email,
      password,
      roles,
      secret,
    );

    const errors: any[] = await validate(user);

    if (errors.length > 0) {
      const errorMessages: string = this.formatValidationErrors(errors);
      throw new Error(`Erreur de saisie, ${errorMessages}`);
    }

    return user;
  }

  private formatValidationErrors(errors: any[]): string {
    return errors
      .map(error =>
        Object.keys(error.constraints).reduce(
          (acc, curr) => acc.concat([error.constraints[curr]]),
          [],
        ),
      )
      .join('\n');
  }

  private getRoles(roles: string): UserRole[] {
    return roles
      .split(',')
      .map(role => `inactive_${role}`)
      .concat(['new_account']) as UserRole[];
  }
}
