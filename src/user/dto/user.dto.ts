export class FindUserResponseDto{
    id:string;
    username:string;

}

export class UserResponseDto{
    username:string;  
}

export class LoginUserDto{
    id:string;
    username:string;
}

export class CreateUserDto{
    emailaddress:string;
    username:string;
    password:string;
}


export class UpdateUserDto{
    username:string;
}