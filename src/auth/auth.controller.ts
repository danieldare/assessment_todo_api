import { Body, Controller, Post, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './auth.dto';
import { User as UserEntity } from '../user/user.entity';
import { User } from '../decorators';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  async login(@Body() data: LoginDto) {
    return this.authService.login(data.email, data.password);
  }

  @Post('/signup')
  @HttpCode(201)
  async signup(@Body() data: SignupDto) {
    return this.authService.signup(data);
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  @HttpCode(204)
  async logout(@User() data: UserEntity) {
    return this.authService.logout(data);
  }
}
