import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { ObjectID, Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { LoginUserDto, CreateUserDto, LoginUserDto2} from '../user/dto/user.dto';
import { INSTANCE_ID, SERVER_RANDOM_VALUE, sha256,sha512, addPadding } from 'src/logic/security';

@Injectable()
export class UserService {


    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private authService: AuthService
    ) { }

    create(createdUserDto: CreateUserDto): Observable<UserEntity> {
        return this.mailExists(createdUserDto.email).pipe(
            switchMap((exists: boolean) => {
                if (!exists) {
                    return this.userExists(createdUserDto.username).pipe(
                        switchMap((exists: boolean) => {
                            if (!exists) {
                                return from(this.userRepository.save(createdUserDto))
                            } else {
                                throw new HttpException('username already in use', HttpStatus.CONFLICT);
                            }
                        })
                    )
                } else {
                    throw new HttpException('Email  already in use', HttpStatus.CONFLICT);
                }
            })
        )
    }



    login(loginUserDto: LoginUserDto): Observable<string> {
        return this.findUser(loginUserDto.username).pipe(
            map((user: UserEntity) => {
                if (user !== null) {
                    const salt = sha256(addPadding(loginUserDto.username + INSTANCE_ID + user.clientRandomValue, 128));  
                    console.log(salt)
                    
                    return salt      
                } else {
                    const salt= sha256(addPadding(loginUserDto.username + INSTANCE_ID + SERVER_RANDOM_VALUE, 128));
                    console.log(salt)
                    return salt  }
            })
        )
        
    }

    
    login2(loginUserDto2: LoginUserDto2): Observable<string> {
        return this.findUser(loginUserDto2.username).pipe(
            map((user: UserEntity) => {
                if (user !== null) {
                    const  key = sha512(loginUserDto2.derivedAuthenticationKey);  
                    console.log(key)
                    
                    return key      
                } else {
                    const  key = sha512(loginUserDto2.derivedAuthenticationKey);  
                    console.log(key)
                    return key }
            })
        )
        
    }

    



      

    // login(loginUserDto: LoginUserDto): Observable<string> {
    //     return this.findUserByEmail(loginUserDto.email).pipe(
    //         switchMap((user: UserEntity) => {
    //             if (user) {
    //                 return this.validatePassword(loginUserDto.password, user.password).pipe(
    //                     switchMap((passwordsMatches: boolean) => {
    //                         if (passwordsMatches) {
    //                             return this.findOne(user.id).pipe(
    //                                 switchMap((user: UserI) => this.authService.generateJwt(user))
    //                             )
    //                         } else {
    //                             throw new HttpException('Login was not Successfulll', HttpStatus.UNAUTHORIZED);9801
    //                         }
    //                     })
    //                 )
    //             } else {
    //                 throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    //             }
    //         }
    //         )
    //     )
    // }

    findAll(): Observable<UserEntity[]> {
        return from(this.userRepository.find());
    }

    findOne(id: ObjectID): Observable<UserEntity> {
        return from(this.userRepository.findOne({ id }));
    }

   
    // private findUserByEmail(email: string): Observable<UserEntity> {
    //     return from(this.userRepository.findOne({ email }, { select: ['id', 'email', 'name', 'password'] }));
    // }

    private validatePassword(password: string, storedPasswordHash: string): Observable<boolean> {
        return this.authService.comparePasswords(password, storedPasswordHash);
    }

    private mailExists(email: string): Observable<boolean> {
        return from(this.userRepository.findOne({ email })).pipe(
            map((user: UserEntity) => {
                if (user) {
                    return true;
                } else {
                    return false;
                }
            })
        )
    }


    private userExists(username: string): Observable<boolean> {
        return from(this.userRepository.findOne({ username })).pipe(
            map((user: UserEntity) => {
                if (user) {
                    return true;
                } else {
                    return false;
                }
            })
        )
    }

    
    findUser(username: string): Observable<UserEntity> | null {
        return from(this.userRepository.findOne({ username })).pipe(
            map((user: UserEntity) => {
                return user ? user : null;
            })
        )
    }

}