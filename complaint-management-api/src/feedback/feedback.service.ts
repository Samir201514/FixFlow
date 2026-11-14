
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Feedback } from './entities/feedback.entity.js';
import { Complaint } from '../complaints/entities/complaint.entity.js';

import { CreateFeedbackDto } from './dto/create-feedback.dto.js';
import { FeedbackQueryDto } from './dto/feedback-query.dto.js';

import { paginate } from '../common/helpers/paginate.helper.js';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,

    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
  ) {}

  // Create Feedback
  async create(complaintId: number, dto: CreateFeedbackDto, user: any) {
    const complaint = await this.complaintRepo.findOne({
      where: { complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (complaint.reporterId !== user.userId) {
      throw new ForbiddenException(
        'Only the reporter can give feedback',
      );
    }

    if (complaint.status !== 'CLOSED') {
      throw new ConflictException(
        'Feedback is allowed only after the complaint is closed',
      );
    }

    const existing = await this.feedbackRepo.findOne({
      where: { complaintId },
    });

    if (existing) {
      throw new ConflictException(
        'Feedback has already been submitted',
      );
    }

    try {
      const feedback = this.feedbackRepo.create({
        complaintId,
        rating: dto.rating,
        comment: dto.comment,
      });

      const saved = await this.feedbackRepo.save(feedback);

      return {
        message: 'Feedback submitted successfully',
        data: saved,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'Feedback has already been submitted',
        );
      }

      throw error;
    }
  }

  // Get Feedback by Complaint
  async findByComplaint(complaintId: number, user: any) {
    const complaint = await this.complaintRepo.findOne({
      where: { complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (
      user.role !== 'ADMIN' &&
      complaint.reporterId !== user.userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    const feedback = await this.feedbackRepo.findOne({
      where: { complaintId },
    });

    if (!feedback) {
      throw new NotFoundException(
        'No feedback has been submitted for this complaint yet',
      );
    }

    return {
      message: 'Feedback retrieved successfully',
      data: feedback,
    };
  }

  // Get All Feedback
  async findAll(query: FeedbackQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const qb = this.feedbackRepo
      .createQueryBuilder('f')
      .innerJoin('f.complaint', 'c')
      .addSelect([
        'c.complaintId',
        'c.trackingCode',
        'c.title',
      ]);

    if (query.rating !== undefined) {
      qb.andWhere('f.rating = :rating', {
        rating: query.rating,
      });
    }

    const [items, total] = await qb
      .orderBy('f.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      message: 'Feedback retrieved successfully',
      ...paginate(items, total, page, limit),
    };
  }
}
