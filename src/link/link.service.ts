import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Link } from './link.entity';
import forge from 'node-forge';
import { FilesystemService } from '../filesystem/filesystem.service';
import { CreateLinkDto } from './link.dto';
import { Node, NodeType } from '../filesystem/filesystem.entity';
import { err, Status } from '../utils/communication';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private linkRepo: Repository<Link>,
    private fileService: FilesystemService,
  ) {}

  /**
   * Basic findOne function on Link repository,
   * but throws an exception when no link is found.
   */
  async findOne(options: FindOneOptions<Link>): Promise<Link> {
    const link = await this.linkRepo.findOne(options);
    if (!link) {
      throw err(Status.ERROR_LINK_NOT_FOUND, 'Link not found.');
    }
    return link;
  }

  /**
   * Returns the link corresponding to the id passed in argument.
   */
  async findById(linkId: string): Promise<Link> {
    return await this.findOne({ where: { shareId: linkId } });
  }

  /**
   * Creates a new link in relation with an existing node;
   * Returns the created link's id (shareId).
   */
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

  /**
   * Returns the node in relation with a targeted link.
   */
  async getNode(linkId: string): Promise<Node> {
    const link = await this.findOne({
      where: { shareId: linkId },
      relations: ['node'],
    });
    return link.node;
  }
}
