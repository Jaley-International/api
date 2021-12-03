import { Injectable, Module } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {
  async validate(request: Request): Promise<any> {

  
    //do the hashed auth key validation here
  }
}