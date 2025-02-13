import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import constants from '../constants';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // fetch bearer token from req headers
    const token = req.headers?.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException(constants.TOKEN_REQUIRED);
    const { id, tokenVersion } = this.authService.verifyJWTToken(token);
    const user = await this.userService.findById(id);
    if (!user) throw new UnauthorizedException(constants.USER_NOT_FOUND);

    if (+user.tokenVersion !== tokenVersion)
      throw new UnauthorizedException(constants.USER_LOGGED_OUT);
    req.user = user;
    return true;
  }
}
