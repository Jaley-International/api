import { Injectable, Module, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {
  async validate(request: Request): Promise<any> {


        const valid = true;
        if(valid) 
        {
          throw new UnauthorizedException();
        }
        
        return "nice";
        
    

    //do the hashed auth key validation here
  
}}