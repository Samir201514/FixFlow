import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
//import { ComplaintTag } from "../complaints/entities/complaint.entity.js";
import { Tag } from "./entities/tag.entity.js";
import { TagsController } from "./tag.controller.js";
import { TagsService } from "./tag.service.js";
import { ComplaintTag } from "../complaint-tags/entities/complaint-tag.entity.js";
@Module({
  imports: [TypeOrmModule.forFeature([Tag, ComplaintTag])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService, TypeOrmModule],
})
export class TagsModule {}
