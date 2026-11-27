import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ComplaintTagModule } from './complaint-tags/complaint-tags.module.js';
import { ComplaintAttachmentModule } from './complaint-attachment/complaint-attachment.module.js';
import { AuditModule } from './audit/audit.module.js';
import { ComplaintHistoryModule } from './complaint-history/complaint-history.module.js';
import { ComplaintsModule } from './complaints/complaints.module.js';
import { ComplaintAssignmentModule } from './complaint-assignments/complaint-assignments.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { FeedbackModule } from './feedback/feedback.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { DepartmentsModule } from './department/department.module.js';
import { StaffProfilesModule } from './staff-profile/staff-profile.module.js';
import { TagsModule } from './tag/tag.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
    AuthModule,
    UsersModule,
    ComplaintTagModule,
    ComplaintAttachmentModule,
    AuditModule,
    DepartmentsModule,
    StaffProfilesModule,
    TagsModule,
    ComplaintHistoryModule,
    ComplaintsModule,
    ComplaintAssignmentModule,
    CategoriesModule,
    NotificationsModule,
    FeedbackModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'postgres'>('DB_TYPE'),
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
