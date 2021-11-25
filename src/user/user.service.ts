import { Injectable } from '@nestjs/common';
import { CreateUserDto, FindUserResponseDto, UserResponseDto, UpdateUserDto, LoginUserDto } from './dto/user.dto';
import{v4 as uuid} from "uuid"
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {User} from "./entity/user.entity";

@Injectable()
export class UserService {


    login(payload: LoginUserDto): UserResponseDto {
        throw new Error('Method not implemented.');
    }
    getUserbyId(userId: string): FindUserResponseDto[] {
        throw new Error('Method not implemented.');
    }

    getUsers(): FindUserResponseDto[] {
        throw new Error('Method not implemented.');
    }

   private users;
    
    createUser(payload :CreateUserDto):UserResponseDto{
        let newUser = {
         id: uuid(),
         ...payload
        }
        this.users.push(newUser);
        return newUser;
    }


        constructor(
          @InjectRepository(User)
          private usersRepository: Repository<User>,
        ) {}
      
        findAll(): Promise<User[]> {
          return this.usersRepository.find();
        }
      
        findOne(id: string): Promise<User> {
          return this.usersRepository.findOne(id);
        }
      
        async remove(id: string): Promise<void> {
          await this.usersRepository.delete(id);
        }



  
        create(username: string): Promise<User> {
            const newUser = this.usersRepository.create({username});
            return this.usersRepository.save(newUser);
        }
  
  
}



