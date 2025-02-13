import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SignupDto } from './auth.dto';
import { UserService } from '../user/user.service';
import constants from '../constants';
import { ConfigService } from '@nestjs/config';
import { JWTClaims, JWTSignedData } from '../types';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Signs up a new user.
   *
   * @param dto - The signup data.
   * @returns - An object containing the newly created user and JWT claims.
   * @throws ForbiddenException - If the user already exists.
   */
  async signup({ password, ...dto }: SignupDto) {
    // check if user exists
    let user: Partial<User> | null = await this.userService.findByEmail(
      dto.email,
    );
    if (user) throw new ForbiddenException(constants.USER_EXISTS);
    // generate password salt and hash
    const { salt, hash } = await this.#generateSaltAndHash(password);
    // create user
    user = await this.userService.create({
      ...dto,
      salt,
      hash,
      tokenVersion: 1,
    });
    // generate JWT token
    const claims = this.#generateJWTToken({
      id: user.id!,
      email: user.email!,
      tokenVersion: 1,
    });
    delete user.salt;
    delete user.hash;
    return { user, ...claims };
  }

  /**
   * Authenticates a user by checking their email and password.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns An object containing the authenticated user and JWT token claims.
   * @throws UnauthorizedException if the user does not exist or the credentials are invalid.
   */
  async login(email: string, password: string) {
    // check if user exists
    const user: Partial<User> | null =
      await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException(constants.INVALID_CREDENTIALS);
    // compare password
    const isValid = await this.#comparePassword(
      password,
      user.hash!,
      user.salt!,
    );
    if (!isValid)
      throw new UnauthorizedException(constants.INVALID_CREDENTIALS);
    // update user token version
    user.tokenVersion = user.tokenVersion! + 1;
    await this.userService.updateUser(user as User);
    // generate JWT token
    const claims = this.#generateJWTToken({
      id: user.id!,
      email: user.email!,
      tokenVersion: user.tokenVersion,
    });
    delete user.salt;
    delete user.hash;
    return { user, ...claims };
  }

  /**
   * Logs out the user by invalidating the token and updating the user information.
   * @param user - The user object.
   * @returns A promise that resolves when the user is successfully logged out.
   */
  async logout(user: User) {
    // invalidate token
    user.tokenVersion = user.tokenVersion + 1;
    await this.userService.updateUser(user);
  }

  /**
   * Generates a password salt and hash.
   * @private
   * @param  password - The password to hash.
   * @memberof AuthService
   * @returns An object containing the salt and hash.
   */
  async #generateSaltAndHash(
    password: string,
  ): Promise<{ salt: string; hash: string }> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }

  /**
   * Compares a password with a hash using the provided salt.
   * @param password - The password to compare.
   * @param hash - The hash to compare against.
   * @param salt - The salt used for hashing.
   * @returns A boolean indicating whether the password matches the hash.
   */
  async #comparePassword(password: string, hash: string, salt: string) {
    const compareHash = await bcrypt.hash(password, salt);
    return compareHash === hash;
  }

  /**
   * Synchronously signs the given payload into a JSON Web Token string.
   * @private
   * @param  data - An object that contains options required to sign a token.
   * @memberof AuthService
   * @returns An object that contains the signed token.
   */
  #generateJWTToken(data: JWTClaims): JWTSignedData {
    const options = {
      expiresIn: +this.configService.get<number>('JWT_EXPIRES_IN')!,
    };
    const token = jwt.sign(
      data,
      this.configService.get<string>('JWT_SECRET')!,
      options,
    );
    return { token, expires: options.expiresIn * 1000 };
  }

  /**
   * Verifies the given token.
   * @param token - The token to verify.
   * @returns The decoded token.
   */
  verifyJWTToken(token: string): JWTClaims {
    try {
      const decoded = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET')!,
      ) as unknown as JWTClaims;
      return decoded;
    } catch (err: unknown) {
      const message =
        (err as Error)?.message === 'jwt expired'
          ? constants.JWT_EXPIRED
          : constants.INVALID_TOKEN;
      throw new UnauthorizedException(message);
    }
  }
}
