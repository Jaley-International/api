import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { map, Observable, sampleTime } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CustomStrategy } from 'src/auth/strategies/custom.strategy';
import { LoginUserDto,LoginUserDto2,CreateUserDto, loginResponseDto} from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { UserEntity } from './entity/user.entity';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post()
    create(@Body() createdUserDto: CreateUserDto): Observable<UserEntity> {
        return this.userService.create(createdUserDto);
    }


    
    @Post('getSalt')
    @HttpCode(200)
    login(@Body() LoginUserDto: LoginUserDto): Observable<any> {

        const salt = this.userService.login(LoginUserDto);
        console.log(salt)
        return salt
    }


    @Post('login')
    @HttpCode(200)
    login2(@Body() LoginUserDto2: LoginUserDto2): Observable<any> {

        const salt = this.userService.login2(LoginUserDto2);
        console.log(salt)
        return salt
    }

    // @Post('login')
    // @HttpCode(200)
    // login(@Body() loginUserDto: LoginUserDto): Observable<Object> {
    //     return this.userService.login(loginUserDto).pipe(
    //         map((jwt: string) => {
    //             return {
    //                 access_token: jwt,
    //                 token_type: 'JWT',
    //                 expires_in: 600000000000000000
    //             }
    //         })
    //     );
    // }

    @UseGuards(CustomStrategy)
    @Get()
    findAll(@Req() request): Observable<UserEntity[]> {
        console.log(request.user);
        return this.userService.findAll();
    }


   
}