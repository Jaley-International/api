import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ObjectID, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import {
  LoginUserDto,
  CreateUserDto,
  LoginUserDto2,
  loginResponseDto,
} from './user.dto';
import {
  INSTANCE_ID,
  SERVER_RANDOM_VALUE,
  sha256,
  sha512,
  addPadding,
  generateSessionIdentifier,
  rsaPublicEncrypt,
} from 'src/logic/security';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  create(createdUserDto: CreateUserDto): Observable<UserEntity> {
    return this.mailExists(createdUserDto.email).pipe(
      switchMap((exists: boolean) => {
        if (!exists) {
          return this.userExists(createdUserDto.username).pipe(
            switchMap((exists: boolean) => {
              if (!exists) {
                return from(this.userRepository.save(createdUserDto));
              } else {
                throw new HttpException(
                  'username already in use',
                  HttpStatus.CONFLICT,
                );
              }
            }),
          );
        } else {
          throw new HttpException('Email  already in use', HttpStatus.CONFLICT);
        }
      }),
    );
  }

  login(loginUserDto: LoginUserDto): Observable<string> {
    return this.findUser(loginUserDto.username).pipe(
      map((user: UserEntity) => {
        if (user !== null) {
          const salt = sha256(
            addPadding(
              loginUserDto.username + INSTANCE_ID + user.clientRandomValue,
              128,
            ),
          );
          console.log(salt);

          return salt;
        } else {
          const salt = sha256(
            addPadding(
              loginUserDto.username + INSTANCE_ID + SERVER_RANDOM_VALUE,
              128,
            ),
          );
          console.log(salt);
          return salt;
        }
      }),
    );
  }

  login2(loginUserDto2: LoginUserDto2): Observable<any> {
    return this.findUser(loginUserDto2.username).pipe(
      map((user: UserEntity) => {
        if (user !== null) {
          const key = sha512(loginUserDto2.derivedAuthenticationKey);

          if (key === user.hashedAuthenticationKey) {
            const session = generateSessionIdentifier();
            user.sessionIdentifiers.push(session);
            this.userRepository.save(user);

            const res = new loginResponseDto();
            res.encryptedMasterKey = user.encryptedMasterKey;
            res.encryptedRsaPrivateSharingKey =
              user.encryptedRsaPrivateSharingKey;
            res.rsaPublicSharingKey = user.rsaPublicSharingKey;
            res.encryptedSessionIdentifier = rsaPublicEncrypt(
              user.rsaPublicSharingKey,
              session,
            );
            return res;
          }

          return key;
        } else {
          throw new HttpException(
            'Invalid credentials',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }),
    );
  }

  findAll(): Observable<UserEntity[]> {
    return from(this.userRepository.find());
  }

  findOne(id: ObjectID): Observable<UserEntity> {
    return from(this.userRepository.findOne({ id }));
  }

  private mailExists(email: string): Observable<boolean> {
    return from(this.userRepository.findOne({ email })).pipe(
      map((user: UserEntity) => {
        return !!user;
      }),
    );
  }

  private userExists(username: string): Observable<boolean> {
    return from(this.userRepository.findOne({ username })).pipe(
      map((user: UserEntity) => {
        return !!user;
      }),
    );
  }

  findUser(username: string): Observable<UserEntity> | null {
    return from(this.userRepository.findOne({ username })).pipe(
      map((user: UserEntity) => {
        return user ? user : null;
      }),
    );
  }
}
