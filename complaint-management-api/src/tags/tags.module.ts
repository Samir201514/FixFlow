import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintTag } from '../complaints/entities/complaint-tag.entity';
import { Tag } from './entities/tag.entity';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, ComplaintTag])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService, TypeOrmModule],
})
export class TagsModule {}