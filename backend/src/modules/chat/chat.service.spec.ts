import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ChatService } from './chat.service';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersRepository } from '../users/repositories/users.repository';

describe('ChatService', () => {
  let service: ChatService;
  const conversationModel = { findById: jest.fn(), findOne: jest.fn(), find: jest.fn() };
  const messageModel = { create: jest.fn(), find: jest.fn() };
  const notificationsService = { hasUnread: jest.fn(), createNotification: jest.fn() };
  const usersRepository = { findById: jest.fn() };

  const senderId = new Types.ObjectId();
  const receiverId = new Types.ObjectId();
  const conversationId = new Types.ObjectId();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(Conversation.name), useValue: conversationModel },
        { provide: getModelToken(Message.name), useValue: messageModel },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: UsersRepository, useValue: usersRepository },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects non-participants', async () => {
    conversationModel.findById.mockResolvedValue({ participantIds: [senderId, receiverId] });
    await expect(
      service.getConversationForParticipant(conversationId.toString(), new Types.ObjectId().toString()),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects empty messages', async () => {
    await expect(
      service.saveMessage(conversationId.toString(), senderId.toString(), '   '),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('derives the receiver from the conversation participants', async () => {
    const conversation = {
      _id: conversationId,
      participantIds: [senderId, receiverId],
      save: jest.fn(),
    };
    conversationModel.findById.mockResolvedValue(conversation);
    messageModel.create.mockImplementation(async (doc) => ({ _id: new Types.ObjectId(), ...doc }));

    const message = await service.saveMessage(conversationId.toString(), senderId.toString(), 'hello');

    expect(message.receiverId).toBe(receiverId);
    expect(conversation.save).toHaveBeenCalled();
  });

  it('notifies the receiver of a new message', async () => {
    conversationModel.findById.mockResolvedValue({
      _id: conversationId,
      participantIds: [senderId, receiverId],
      save: jest.fn(),
    });
    messageModel.create.mockImplementation(async (doc) => ({ _id: new Types.ObjectId(), ...doc }));
    notificationsService.hasUnread.mockResolvedValue(false);
    usersRepository.findById.mockResolvedValue({ fullName: 'Asha' });

    await service.saveMessage(conversationId.toString(), senderId.toString(), 'hello');
    await new Promise(process.nextTick);

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: receiverId.toString(),
        type: 'NEW_MESSAGE',
        referenceId: conversationId.toString(),
        actionPath: `/messages?c=${conversationId.toString()}`,
      }),
    );
  });

  it('skips notifying while an unread message notification exists', async () => {
    conversationModel.findById.mockResolvedValue({
      _id: conversationId,
      participantIds: [senderId, receiverId],
      save: jest.fn(),
    });
    messageModel.create.mockImplementation(async (doc) => ({ _id: new Types.ObjectId(), ...doc }));
    notificationsService.hasUnread.mockResolvedValue(true);

    await service.saveMessage(conversationId.toString(), senderId.toString(), 'hello again');
    await new Promise(process.nextTick);

    expect(notificationsService.createNotification).not.toHaveBeenCalled();
  });
});
