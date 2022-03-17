import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from './share.entity';

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(Share)
    private shareRepo: Repository<Share>,
  ) {}
}
