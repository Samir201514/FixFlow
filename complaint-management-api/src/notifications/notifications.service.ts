import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity.js';
import { NotificationType } from '../common/enums/notification-type.enum.js';
import { NotificationQueryDto } from './dto/notification-query.dto.js';
import { paginate } from '../common/helpers/paginate.helper.js';

type NotificationRow = {
  userId: number;
  complaintId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createMany(manager: EntityManager, rows: NotificationRow[]) {
    if (!rows.length) return [];
    const repo = manager.getRepository(Notification);
    const cleanedRows = rows.map((row) => ({
      ...row,
      title: row.title.slice(0, 150),
    }));
    return repo.save(repo.create(cleanedRows));
  }

  async findMine(userId: number, query: NotificationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const qb = this.notificationRepo.createQueryBuilder('n')
      .where('n.userId = :userId', { userId });

    if (query.isRead === true) qb.andWhere('n.readAt IS NOT NULL');
    if (query.isRead === false) qb.andWhere('n.readAt IS NULL');
    if (query.type) qb.andWhere('n.type = :type', { type: query.type });

    const [items, total] = await qb.orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit).take(limit).getManyAndCount();
    const mappedItems = items.map((item) => ({ ...item, isRead: item.readAt !== null }));
    return { message: 'Notifications retrieved successfully', ...paginate(mappedItems, total, page, limit) };
  }

  async markRead(id: number, userId: number) {
    const notification = await this.notificationRepo.findOne({ where: { notificationId: id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('This notification belongs to another user');
    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationRepo.save(notification);
    }
    return {
      message: 'Notification marked as read',
      data: { ...notification, isRead: true },
    };
  }

  async markAllRead(userId: number) {
    const result = await this.notificationRepo.update(
      { userId, readAt: IsNull() },
      { readAt: new Date() },
    );
    return { message: 'Notifications marked as read', data: { updated: result.affected ?? 0 } };
  }
}
