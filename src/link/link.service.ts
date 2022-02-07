import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './link.entity';
import forge from 'node-forge';
import { FilesystemService } from '../filesystem/filesystem.service';
import { CreateLinkDto } from './link.dto';
import { NodeType } from '../filesystem/filesystem.entity';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private linkRepo: Repository<Link>,
    private fileService: FilesystemService,
  ) {}

  async createLink(dto: CreateLinkDto): Promise<string> {
    const link = new Link();
    link.shareId = forge.util.bytesToHex(forge.random.getBytesSync(8));
    link.encryptedNodeKey = dto.encryptedNodeKey;
    link.encryptedShareKey = dto.encryptedShareKey;
    link.iv = dto.iv;
    link.node = await this.fileService.findOne({
      where: { id: dto.nodeId, type: NodeType.FILE },
    });
    await this.linkRepo.save(link);
    return link.shareId;
  }

  //TODO move to file system module
  async getLinkByNode(nodeId: number): Promise<Link[]> {
    const node = await this.fileService.findOne({
      where: { id: nodeId },
      relations: ['links'],
    });
    return node.links;
  }
}
