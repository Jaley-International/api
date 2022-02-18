import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, getConnection, MoreThan, Repository } from 'typeorm';
import { AccessLevel, Session, User, UserStatus } from './user.entity';
import { Node } from '../filesystem/filesystem.entity';
import {
  AuthenticationDto,
  CreateUserDto,
  LoginDetails,
  RegisterUserDto,
  UpdateUserDto,
} from './user.dto';
import {
  addPadding,
  generateSessionIdentifier,
  hexToBase64Url,
  INSTANCE_ID,
  rsaPublicEncrypt,
  SERVER_RANDOM_VALUE,
  sha256,
  sha512,
} from 'src/utils/security';
import { err, Status } from '../utils/communication';
import { MailService } from '../mail/mail.service';
import forge from 'node-forge';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    private mailService: MailService,
  ) {}

  private async mailExists(email: string): Promise<boolean> {
    return !!(await this.userRepo.findOne({ email }));
  }

  private async userExists(username: string): Promise<boolean> {
    return !!(await this.userRepo.findOne({ username }));
  }

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
      throw err(Status.ERROR_USER_NOT_FOUND, 'User not found.');
    }
    return user;
  }

  /**
   * Basic findOne function on Session repository,
   * but throws an error when no session is found;
   */
  async findOneSession(options: FindOneOptions<Session>): Promise<Session> {
    const session = await this.sessionRepo.findOne(options);
    if (!session) {
      throw err(Status.ERROR_INVALID_SESSION, 'Session not found.');
    }
    return session;
  }

  // TODO remove in the future as it is replaced by register
  /**
   * Creates a new user and returns it.
   * Throws an exception if the email or username is already used.
   */
  async create(body: CreateUserDto): Promise<User> {
    if (!(await this.userExists(body.username))) {
      if (!(await this.mailExists(body.email))) {
        const newUser = new User();
        newUser.username = body.username;
        newUser.clientRandomValue = body.clientRandomValue;
        newUser.encryptedMasterKey = body.encryptedMasterKey;
        newUser.hashedAuthenticationKey = body.hashedAuthenticationKey;
        newUser.encryptedRsaPrivateSharingKey =
          body.encryptedRsaPrivateSharingKey;
        newUser.rsaPublicSharingKey = body.rsaPublicSharingKey;
        newUser.email = body.email;
        return await this.userRepo.save(newUser);
      } else {
        throw err(Status.ERROR_EMAIL_ALREADY_USED, 'Email already in use.');
      }
    } else {
      throw err(Status.ERROR_USERNAME_ALREADY_USED, 'Username already in use.');
    }
  }

  /**
   * Pre-registers a new user by an admin user and returns it.
   * Throws an exception if the email or username is already used.
   * Throws an exception if the current user is not an admin.
   */
  async register(curUser: User, body: RegisterUserDto): Promise<User> {
    if (curUser.accessLevel === AccessLevel.ADMINISTRATOR) {
      if (!(await this.userExists(body.username))) {
        if (!(await this.mailExists(body.email))) {
          const newUser = new User();
          newUser.username = body.username;
          newUser.firstName = body.firstName;
          newUser.lastName = body.lastName;
          newUser.email = body.email;
          newUser.group = body.group;
          newUser.job = body.job;
          newUser.accessLevel = body.accessLevel;
          newUser.userStatus = UserStatus.PENDING_REGISTRATION;
          newUser.registerKey = hexToBase64Url(
            forge.util.bytesToHex(forge.random.getBytesSync(12)),
          );
          await this.mailService.sendUserConfirmation(newUser);
          return await this.userRepo.save(newUser);
        } else {
          throw err(Status.ERROR_EMAIL_ALREADY_USED, 'Email already in use.');
        }
      } else {
        throw err(
          Status.ERROR_USERNAME_ALREADY_USED,
          'Username already in use.',
        );
      }
    } else {
      throw err(
        Status.ERROR_INVALID_ACCESS_LEVEL,
        'User Access Level is not Administrator',
      );
    }
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns the updated user.
   */
  async update(username: string, body: UpdateUserDto): Promise<User> {
    const user = await this.findOne({ where: { username: username } });
    user.email = body.email;
    // ...add other things to update in the future
    await this.userRepo.save(user);
    return user;
  }

  /**
   * Delete the target user,
   * leaving all of that user file system's nodes without any owner.
   * Returns the deleted user.
   */
  async delete(username: string): Promise<User> {
    const user = await this.findOne({
      where: { username: username },
      relations: ['nodes'],
    });
    // removing nodes ownership
    const nodeRepo = getConnection().getRepository(Node);
    for (const node of user.nodes) {
      node.owner = null;
      await nodeRepo.save(node);
    }
    return await this.userRepo.remove(user);
  }

  /**
   * Returns a salt generated from the specified username and a client random value.
   * If the corresponding user does not exist, the random value is generated by the server.
   */
  async getSalt(username: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { username: username } });
    return sha256(
      addPadding(
        username +
          INSTANCE_ID +
          (user ? user.clientRandomValue : SERVER_RANDOM_VALUE),
        128,
      ),
    );
  }

  /**
   * Logs in an existing user.
   * Creates a new session entity with an expiration date.
   * Returns the encryption keys of the user.
   * Throws an exception if user's credential are not valid.
   */
  async login(body: AuthenticationDto): Promise<LoginDetails> {
    const user = await this.userRepo.findOne({ username: body.username });

    if (user) {
      const key = sha512(body.derivedAuthenticationKey);

      if (key === user.hashedAuthenticationKey) {
        // new session
        const session = new Session();
        session.id = generateSessionIdentifier();
        session.issuedAt = Date.now();
        session.expire =
          Date.now() +
          parseInt(process.env.PEC_API_SESSION_MAX_IDLE_TIME) * 1000;
        session.ip = '0.0.0.0'; //TODO get user ip
        session.user = user;
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
    throw err(Status.ERROR_INVALID_CREDENTIALS, 'Invalid credentials.');
  }

  /**
   * Sets the expiration of the session to be the current datetime.
   */
  async terminateSession(sessionId: string): Promise<void> {
    const now = Date.now();

    const session = await this.findOneSession({
      where: { id: sessionId, expire: MoreThan(now) },
    });

    session.expire = now;

    await this.sessionRepo.save(session);
  }

  /**
   * Extends the duration of the target session if it's about to be expired.
   * Returns the new expiration date time of the session.
   */
  async extendSession(sessionId: string): Promise<number> {
    const now = Date.now();
    const session = await this.findOneSession({
      where: { id: sessionId, expire: MoreThan(now) },
    });
    session.expire =
      now + parseInt(process.env.PEC_API_SESSION_MAX_IDLE_TIME) * 1000;
    await this.sessionRepo.save(session);
    return session.expire;
  }
}
