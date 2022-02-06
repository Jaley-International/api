import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Session, User } from './user.entity';
import {
  AuthenticationDto,
  CreateUserDto,
  DeleteUserDto,
  UpdateUserDto,
} from './user.dto';
import {
  addPadding,
  generateSessionIdentifier,
  INSTANCE_ID,
  rsaPublicEncrypt,
  SERVER_RANDOM_VALUE,
  sha256,
  sha512,
} from 'src/utils/security';
import { Communication, Status } from '../utils/communication';
import { UploadsManager } from '../utils/uploadsManager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
  ) {}

  /**
   * Returns all existing users.
   */
  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  /**
   * Basic findOne function on User repository,
   * but throws an error when no user is found.
   */
  async findOne(options: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepo.findOne(options);
    if (!user) {
      throw Communication.err(Status.ERROR_USER_NOT_FOUND, 'User not found.');
    }
    return user;
  }

  /**
   * Creates a new user and returns it.
   * Throws an exception if the email or username is already used.
   */
  async create(dto: CreateUserDto): Promise<User> {
    if (!(await this.userExists(dto.username))) {
      if (!(await this.mailExists(dto.email))) {
        const newUser = new User();
        newUser.username = dto.username;
        newUser.clientRandomValue = dto.clientRandomValue;
        newUser.encryptedMasterKey = dto.encryptedMasterKey;
        newUser.hashedAuthenticationKey = dto.hashedAuthenticationKey;
        newUser.encryptedRsaPrivateSharingKey =
          dto.encryptedRsaPrivateSharingKey;
        newUser.rsaPublicSharingKey = dto.rsaPublicSharingKey;
        newUser.email = dto.email;
        return await this.userRepo.save(newUser);
      } else {
        throw Communication.err(
          Status.ERROR_EMAIL_ALREADY_USED,
          'Email already in use.',
        );
      }
    } else {
      throw Communication.err(
        Status.ERROR_USERNAME_ALREADY_USED,
        'Username already in use.',
      );
    }
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns the updated user.
   */
  async update(dto: UpdateUserDto): Promise<User> {
    dto.user.email = dto.email;
    await this.userRepo.save(dto.user);
    return dto.user;
  }

  /**
   * Delete the user possessing the id specified in the request
   * and all of its possessed nodes.
   * Returns the deleted user.
   */
  async delete(dto: DeleteUserDto): Promise<User> {
    // loads the target user with its nodes
    const user = await this.findOne({
      where: { id: dto.user.id },
      relations: ['nodes'],
    });

    // removes the files stored on server disk
    // for the nodes representing a file
    for (const node of user.nodes) {
      UploadsManager.deletePermanentFile(node);
    }

    // removes from database the target user and all its nodes
    // because their onDelete option should be set to CASCADE
    return await this.userRepo.remove(user);
  }

  /**
   * Returns a salt generated from the specified username and a client random value.
   * If the corresponding user does not exist, the random value is generated by the server.
   */
  async getSalt(username: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { username: username } });
    if (user) {
      return sha256(
        addPadding(username + INSTANCE_ID + user.clientRandomValue, 128),
      );
    } else {
      return sha256(
        addPadding(username + INSTANCE_ID + SERVER_RANDOM_VALUE, 128),
      );
    }
  }

  /**
   * Logs in an existing user.
   * Creates a new session entity with an expiration date.
   * Returns the encryption keys of the user.
   * Throws an exception if user's credential are not valid.
   */
  async login(dto: AuthenticationDto): Promise<object> {
    const user = await this.userRepo.findOne({ username: dto.username });

    if (user) {
      const key = sha512(dto.derivedAuthenticationKey);

      if (key === user.hashedAuthenticationKey) {
        // session creation
        const session = new Session();
        session.id = generateSessionIdentifier();
        session.issuedAt = Date.now();
        session.expire =
          Date.now() +
          parseInt(process.env.PEC_API_SESSION_MAX_IDLE_TIME) * 1000;
        session.ip = '0.0.0.0'; //TODO get user ip
        session.user = user;

        // database upload
        await this.sessionRepo.save(session);

        // returning encryption keys and connection information
        return {
          encryptedMasterKey: user.encryptedMasterKey,
          encryptedRsaPrivateSharingKey: user.encryptedRsaPrivateSharingKey,
          rsaPublicSharingKey: user.rsaPublicSharingKey,
          encryptedSessionIdentifier: rsaPublicEncrypt(
            user.rsaPublicSharingKey,
            session.id,
          ),
          sessionExpire: session.expire,
        };
      }
    }
    throw Communication.err(
      Status.ERROR_INVALID_CREDENTIALS,
      'Invalid credentials.',
    );
  }

  private async mailExists(email: string): Promise<boolean> {
    return !!(await this.userRepo.findOne({ email }));
  }

  private async userExists(username: string): Promise<boolean> {
    return !!(await this.userRepo.findOne({ username }));
  }
}
