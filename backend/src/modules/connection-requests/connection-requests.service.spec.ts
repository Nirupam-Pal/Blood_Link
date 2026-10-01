import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ConnectionRequestsService } from './connection-requests.service';
import { ConnectionRequestRepository } from './repositories/connection-request.repository';
import { ConnectionRepository } from './repositories/connection.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatService } from '../chat/chat.service';

describe('ConnectionRequestsService', () => {
  let service: ConnectionRequestsService;
  const connectionRequestRepository = { findOne: jest.fn(), create: jest.fn(), findById: jest.fn(), findOneAndUpdate: jest.fn() };
  const connectionRepository = { findOne: jest.fn(), create: jest.fn() };
  const usersRepository = { findById: jest.fn() };
  const notificationsService = { createNotification: jest.fn() };

  const senderId = new Types.ObjectId().toString();
  const donorId = new Types.ObjectId().toString();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionRequestsService,
        { provide: ConnectionRequestRepository, useValue: connectionRequestRepository },
        { provide: ConnectionRepository, useValue: connectionRepository },
        { provide: UsersRepository, useValue: usersRepository },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: ChatService, useValue: { getOrCreateConversation: jest.fn() } },
        { provide: getConnectionToken(), useValue: { startSession: jest.fn() } },
      ],
    }).compile();

    service = module.get<ConnectionRequestsService>(ConnectionRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects requests to accounts that are not donors', async () => {
    usersRepository.findById.mockResolvedValue({ donor: false, isActive: true });
    await expect(service.createRequest(senderId, donorId)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a pending request and notifies the donor', async () => {
    usersRepository.findById.mockResolvedValue({ donor: true, isActive: true });
    connectionRepository.findOne.mockResolvedValue(null);
    connectionRequestRepository.findOne.mockResolvedValue(null);
    connectionRequestRepository.create.mockResolvedValue({ _id: new Types.ObjectId() });

    await service.createRequest(senderId, donorId, 'please help');

    expect(connectionRequestRepository.create).toHaveBeenCalled();
    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: donorId, type: 'CONNECTION_REQUEST_RECEIVED' }),
    );
  });

  it('rejects when a connection already exists in either direction', async () => {
    usersRepository.findById.mockResolvedValue({ donor: true, isActive: true });
    connectionRepository.findOne.mockResolvedValue({ _id: new Types.ObjectId() });
    await expect(service.createRequest(senderId, donorId)).rejects.toBeInstanceOf(BadRequestException);
    expect(connectionRequestRepository.create).not.toHaveBeenCalled();
  });

  it('does not overwrite a request that is no longer pending when cancelling', async () => {
    connectionRequestRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(),
      senderId: new Types.ObjectId(senderId),
    });
    connectionRequestRepository.findOneAndUpdate.mockResolvedValue(null);
    await expect(service.cancelRequest(new Types.ObjectId().toString(), senderId)).rejects.toBeInstanceOf(BadRequestException);
  });
});
