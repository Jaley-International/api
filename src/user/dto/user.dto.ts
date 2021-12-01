import { IsEmail, IsNotEmpty, isString, IsString, Length, Matches, matches } from "class-validator";


export class LoginUserDto {


    @Matches(/^[0-9a-zA-Z-]{3,16}$/)
    username: string;


}

export class CreateUserDto {

    @Matches(/^[0-9a-zA-Z-]{3,16}$/)
    username: string;

    @Matches(/^[0-9a-f]{32}$/)
    clientRandomValue: string;

    @Matches(/^[0-9a-f]{128}$/)
    encryptedMasterKey: string;

    @Matches(/^[0-9a-f]{128}$/)
    hashedAuthenticationKey: string;

    @Matches(/^[0-9a-f]+$/)
    encryptedRsaPrivateSharingKey: string;

    @IsString()
    rsaPublicSharingKey: string;

    @IsEmail()
    email: string;


}






