import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  getConnection,
  MoreThan,
  Repository,
} from 'typeorm';
import { Session, User, UserStatus } from './user.entity';
import { Node } from '../filesystem/filesystem.entity';
import {
  AuthenticationDto,
  PreRegisterUserDto,
  RegisterUserDto,
  UpdateUserDto,
  ValidateUserDto,
} from './user.dto';
import {
  addPadding,
  generateSessionIdentifier,
  hexToBase64Url,
  rsaPublicEncrypt,
  sha256,
  sha512,
} from 'src/utils/security';
import { err, Status } from '../utils/communication';
import { MailService } from '../mail/mail.service';
import forge from 'node-forge';
import { LogService } from '../log/log.service';
import { UserActivityType, UserLog } from '../log/log.entity';

export interface LoginDetails {
  user: User;
  encryptedSessionIdentifier: string;
  sessionExpire: number;
}

export interface SharingKeys {
  publicSharingKey: string;
  publicSharingKeySignature: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    private mailService: MailService,
    private logService: LogService,
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
  async findAll(options?: FindManyOptions): Promise<User[]> {
    return await this.userRepo.find(options);
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
    if (user.userStatus === UserStatus.DELETED) {
      throw err(Status.ERROR_USER_DELETED, 'User has been deleted.');
    }
    return user;
  }

  /**
   * Basic findOne function on Session repository,
   * but throws an error when no session is found.
   */
  async findOneSession(options: FindOneOptions<Session>): Promise<Session> {
    const session = await this.sessionRepo.findOne(options);
    if (!session) {
      throw err(Status.ERROR_INVALID_SESSION, 'Session not found.');
    }
    return session;
  }

  /**
   * Pre-registers a new user by an admin user and returns new user's registration key.
   * Throws an exception if the email or username is already used.
   */
  async preregister(
    session: Session,
    body: PreRegisterUserDto,
  ): Promise<string> {
    // handling exceptions
    if (await this.userExists(body.username)) {
      throw err(Status.ERROR_USERNAME_ALREADY_USED, 'Username already in use.');
    }
    if (await this.mailExists(body.email)) {
      throw err(Status.ERROR_EMAIL_ALREADY_USED, 'Email already in use.');
    }

    // new user object creation
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

    // database saving
    await this.userRepo.save(newUser);

    // new log entry for user creation
    await this.logService.createUserLog(
      newUser,
      UserActivityType.USER_CREATION,
      session,
    );

    return newUser.registerKey;
  }

  /**
   * Creates a new user and returns their instance public key signature.
   * Throws an exception if the email or username is already used.
   */
  async register(body: RegisterUserDto): Promise<string> {
    const curUser = await this.userRepo.findOne({
      where: { registerKey: body.registerKey },
    });

    if (curUser) {
      if (curUser.userStatus === UserStatus.PENDING_REGISTRATION) {
        curUser.clientRandomValue = body.clientRandomValue;
        curUser.encryptedMasterKey = body.encryptedMasterKey;
        curUser.hashedAuthenticationKey = body.hashedAuthenticationKey;
        curUser.encryptedRsaPrivateSharingKey =
          body.encryptedRsaPrivateSharingKey;
        curUser.rsaPublicSharingKey = body.rsaPublicSharingKey;
        curUser.userStatus = UserStatus.OK;
        curUser.createdAt = Date.now();
        await this.userRepo.save(curUser);

        await this.logService.createUserLog(
          curUser,
          UserActivityType.USER_REGISTRATION,
        );

        // TODO replace it with the actual signature (got from client as in whitepaper 4.1)
        return 'instancePublicKeySignature';
      } else {
        throw err(
          Status.ERROR_INVALID_USER_STATUS,
          'User has already been registered or is suspended.',
        );
      }
    } else {
      throw err(Status.ERROR_INVALID_REGISTER_KEY, 'Register key is invalid.');
    }
  }

  /**
   * Validates a new user.
   * Saves the user's public sharing key signature.
   */
  async validate(session: Session, body: ValidateUserDto) {
    const user = await this.userRepo.findOne({
      where: { username: body.username },
    });

    if (user.userStatus === UserStatus.PENDING_VALIDATION) {
      user.publicSharingKeySignature = body.publicSharingKeySignature;
      user.userStatus = UserStatus.OK;
      await this.userRepo.save(user);

      await this.logService.createUserLog(
        user,
        UserActivityType.USER_VALIDATION,
        session,
      );
    } else {
      throw err(
        Status.ERROR_INVALID_USER_STATUS,
        "User has already been validated, or hasn't been registered yet, or is suspended.",
      );
    }
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns the updated user.
   */
  async update(
    session: Session,
    username: string,
    body: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne({ where: { username: username } });

    if (
      user.email !== body.email.toLowerCase() &&
      (await this.mailExists(body.email))
    ) {
      throw err(Status.ERROR_EMAIL_ALREADY_USED, 'Email already in use.');
    }

    user.firstName = body.firstName;
    user.lastName = body.lastName;
    user.email = body.email;
    user.group = body.group;
    user.job = body.job;
    user.accessLevel = body.accessLevel;
    await this.userRepo.save(user);

    await this.logService.createUserLog(
      user,
      UserActivityType.USER_UPDATE,
      session,
    );

    return user;
  }

  /**
   * Deletes the target user,
   * leaving all of that user file system's nodes without any owner.
   * Returns the deleted user.
   */
  async delete(session: Session, username: string): Promise<User> {
    const user = await this.findOne({
      where: { username: username },
      relations: ['nodes'],
    });

    // set user status as deleted
    user.userStatus = UserStatus.DELETED;
    await this.userRepo.save(user);

    // remove nodes ownership
    const nodeRepo = getConnection().getRepository(Node);
    for (const node of user.nodes) {
      node.owner = null;
      await nodeRepo.save(node);
    }
    // remove user related sessions
    for (const session of user.sessions) {
      await this.sessionRepo.remove(session);
    }

    await this.logService.createUserLog(
      user,
      UserActivityType.USER_DELETION,
      session,
    );

    return user;
  }

  /**
   * Returns a salt generated from the specified username and a client random value.
   * If the corresponding user does not exist, the random value is generated by the server.
   */
  async getSalt(username: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { username: username },
    });

    return sha256(
      addPadding(
        (user ? user.registerKey : username) +
          process.env.PEC_API_INSTANCE_ID +
          (user
            ? user.clientRandomValue
            : process.env.PEC_API_SERVER_RANDOM_VALUE),
        128,
      ),
    );
  }

  /**
   * Logs in an existing user.
   * Creates a new session entity with an expiration date.
   * Returns the encryption keys of the user.
   * Throws an exception if user's credentials are not valid.
   */
  async login(body: AuthenticationDto): Promise<LoginDetails> {
    const user = await this.userRepo.findOne({ username: body.username });
    const key = sha512(body.derivedAuthenticationKey);

    if (user && key === user.hashedAuthenticationKey) {
      if (user.userStatus === UserStatus.OK) {
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
          user: user,
          encryptedSessionIdentifier: rsaPublicEncrypt(
            user.rsaPublicSharingKey,
            session.id,
          ),
          sessionExpire: session.expire,
        };
      } else {
        throw err(
          Status.ERROR_INVALID_USER_STATUS,
          'User is pending registration or is suspended.',
        );
      }
    } else {
      throw err(Status.ERROR_INVALID_CREDENTIALS, 'Invalid credentials.');
    }
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

  /**
   * Returns all logs related to a user.
   */
  async findLogs(username: string): Promise<UserLog[]> {
    const user = await this.findOne({
      where: { username: username },
      relations: ['logs'],
    });
    return user.logs;
  }

  /**
   * Returns the public sharing key and public sharing key signature of the node recipient.
   */
  async getSharingKeys(username: string): Promise<SharingKeys> {
    const user = await this.findOne({
      where: { username: username },
    });

    return {
      publicSharingKey: user.rsaPublicSharingKey,
      publicSharingKeySignature: user.publicSharingKeySignature,
    };
  }
}
