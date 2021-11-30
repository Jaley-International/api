import { IsEmail,  IsNotEmpty, IsString} from "class-validator";


export class LoginUserDto{
   
   
    @IsEmail()
    email: string; 

    @IsNotEmpty()
    password:string;
}

export class CreateUserDto extends LoginUserDto{
    @IsString()
    name: string; 

}






