import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import {
  GetSaltDto,
  CreateUserDto,
  AuthenticationDto,
  LoginResponseDto,
  DeleteUserDto,
  UpdateUserDto,
} from './user.dto';
import {
  INSTANCE_ID,
  SERVER_RANDOM_VALUE,
  sha256,
  sha512,
  addPadding,
  generateSessionIdentifier,
  rsaPublicEncrypt,
} from 'src/security';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  //TODO make all functions return Promise instead of Observable

  /**
   * Creates a new user and returns it.
   * Throw an exception if the email or username is already used.
   */
  async create(dto: CreateUserDto): Promise<User> {
    if (!(await this.mailExists(dto.email))) {
      if (!(await this.userExists(dto.username))) {
        return await this.userRepo.save(dto);
      } else {
        throw new HttpException('username already in use', HttpStatus.CONFLICT);
      }
    } else {
      throw new HttpException('Email already in use', HttpStatus.CONFLICT);
    }
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns the updated user.
   */
  async update(dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(dto.userId);
    user.email = dto.email;
    await this.userRepo.save(user);
    return user;
  }

  /**
   * Delete the user possessing the id specified in the request
   * and all of its possessed nodes.
   * Returns the deleted user.
   */
  async delete(dto: DeleteUserDto): Promise<User> {
    // loads the target user with its nodes
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
      relations: ['nodes'],
    });

    // removes the files stored on server disk
    // for the nodes representing a file
    for (const node of user.nodes) {
      node.deleteStoredFile();
    }

    // removes from database the target user and all its nodes
    // because their onDelete option is set to CASCADE
    return await this.userRepo.remove(user);
  }

  /**
   * Returns a salt generated from the specified username and a client random value.
   * If the corresponding user does not exist, the random value is generated by the server.
   */
  async getSalt(dto: GetSaltDto): Promise<string> {
    const user = await this.userRepo.findOne({ username: dto.username });
    if (user !== undefined) {
      return sha256(
        addPadding(dto.username + INSTANCE_ID + user.clientRandomValue, 128),
      );
    } else {
      return sha256(
        addPadding(dto.username + INSTANCE_ID + SERVER_RANDOM_VALUE, 128),
      );
    }
  }

  async authentication(dto: AuthenticationDto): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({ username: dto.username });
    if (user !== undefined) {
      const key = sha512(dto.derivedAuthenticationKey);

      if (key === user.hashedAuthenticationKey) {
        const session = generateSessionIdentifier();
        user.sessionIdentifiers.push(session);
        await this.userRepo.save(user);

        const res = new LoginResponseDto();
        res.encryptedMasterKey = user.encryptedMasterKey;
        res.encryptedRsaPrivateSharingKey = user.encryptedRsaPrivateSharingKey;
        res.rsaPublicSharingKey = user.rsaPublicSharingKey;
        res.encryptedSessionIdentifier = rsaPublicEncrypt(
          user.rsaPublicSharingKey,
          session,
        );
        return res;
      } else
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    } else
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: id },
    });
    if (user === undefined) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  private async mailExists(email: string): Promise<boolean> {
    return !!(await this.userRepo.findOne({ email }));
  }

  private async userExists(username: string): Promise<boolean> {
    return !!(await this.userRepo.findOne({ username }));
  }
}
