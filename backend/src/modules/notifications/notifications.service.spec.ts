import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationsService } from './notifications.service';
import { Notification } from './schemas/notification.schema';
import { UsersRepository } from '../users/repositories/users.repository';
import { EmailService } from '../../common/services/email.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  const notificationModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  };
  const usersRepository = { findById: jest.fn() };
  const emailService = { sendNotificationEmail: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getModelToken(Notification.name), useValue: notificationModel },
        { provide: UsersRepository, useValue: usersRepository },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws NotFound when marking a notification the user does not own', async () => {
    notificationModel.findOneAndUpdate.mockResolvedValue(null);
    await expect(
      service.markAsRead(new Types.ObjectId().toString(), new Types.ObjectId().toString()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('emails the user when a notification is created', async () => {
    const userId = new Types.ObjectId().toString();
    notificationModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
    usersRepository.findById.mockResolvedValue({ email: 'donor@example.com', fullName: 'Donor', isActive: true });

    await service.createNotification({
      userId,
      type: 'CONNECTION_REQUEST_RECEIVED',
      title: 'New Connection Request',
      message: 'You have received a blood connection request.',
      actionPath: '/connections?tab=received',
    });
    await new Promise(process.nextTick);

    expect(emailService.sendNotificationEmail).toHaveBeenCalledWith({
      to: 'donor@example.com',
      name: 'Donor',
      title: 'New Connection Request',
      message: 'You have received a blood connection request.',
      actionPath: '/connections?tab=received',
    });
  });
});
