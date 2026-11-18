import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
//import { paginate } from "../common/utils/paginate.js";
//import { ComplaintTag } from "../complaints/entities/complaint.entity.js";
import { CreateTagDto } from "./dto/create-tag.dto.js";
import { TagQueryDto } from "./dto/tag-query.dto.js";
import { UpdateTagDto } from "./dto/update-tag.dto.js";
import { Tag } from "./entities/tag.entity.js";
import { paginate } from "../common/helpers/paginate.helper.js";
import { ComplaintTag } from "../complaint-tags/entities/complaint-tag.entity.js";

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTagDto) {
    const existing = await this.tagRepo
      .createQueryBuilder("t")
      .where("LOWER(t.name) = LOWER(:name)", { name: dto.name })
      .getOne();
    if (existing) {
      throw new ConflictException("A tag with this name already exists");
    }

    const tag = await this.tagRepo.save(this.tagRepo.create(dto));
    return { message: "Tag created successfully", data: tag };
  }

  async findAll(query: TagQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const qb = this.tagRepo.createQueryBuilder("t");
    if (search) {
      qb.andWhere("t.name ILIKE :s", { s: `%${search}%` });
    }

    const [items, total] = await qb
      .orderBy("t.name", "ASC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      message: "Tags retrieved successfully",
      ...paginate(items, total, page, limit),
    };
  }

  async findOne(id: number) {
    const tag = await this.tagRepo.findOne({ where: { tagId: id } });
    if (!tag) throw new NotFoundException("Tag not found");

    return { message: "Tag retrieved successfully", data: tag };
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.tagRepo.findOne({ where: { tagId: id } });
    if (!tag) throw new NotFoundException("Tag not found");

    if (dto.name !== undefined && dto.name !== tag.name) {
      const duplicate = await this.tagRepo
        .createQueryBuilder("t")
        .where("LOWER(t.name) = LOWER(:name)", { name: dto.name })
        .andWhere("t.tagId != :id", { id })
        .getOne();
      if (duplicate) {
        throw new ConflictException("A tag with this name already exists");
      }
    }

    Object.assign(tag, dto);
    const saved = await this.tagRepo.save(tag);
    return { message: "Tag updated successfully", data: saved };
  }

  // Touches two tables (complaint_tags, tags), so it runs in one transaction.
  async remove(id: number) {
    const qr = this.dataSource.createQueryRunner();
    let connected = false;
    let transactionStarted = false;
    try {
      await qr.connect();
      connected = true;
      await qr.startTransaction();
      transactionStarted = true;
      const tag = await qr.manager.findOne(Tag, { where: { tagId: id } });
      if (!tag) throw new NotFoundException("Tag not found");

      await qr.manager.delete(ComplaintTag, { tagId: id });
      await qr.manager.delete(Tag, { tagId: id });

      await qr.commitTransaction();
      transactionStarted = false;
    } catch (err) {
      if (transactionStarted) await qr.rollbackTransaction();
      throw err; // rethrow so the exception filter formats it
    } finally {
      if (connected) await qr.release();
    }

    return { message: "Tag deleted successfully", data: null };
  }
}
