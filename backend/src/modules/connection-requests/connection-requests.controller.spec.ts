import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionRequestsController } from './connection-requests.controller';
import { ConnectionRequestsService } from './connection-requests.service';

describe('ConnectionRequestsController', () => {
  let controller: ConnectionRequestsController;
  const service = { createRequest: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionRequestsController],
      providers: [{ provide: ConnectionRequestsService, useValue: service }],
    }).compile();

    controller = module.get<ConnectionRequestsController>(ConnectionRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a request as the authenticated user', async () => {
    await controller.create('user-1', { donorId: 'donor-1', message: 'hi' });
    expect(service.createRequest).toHaveBeenCalledWith('user-1', 'donor-1', 'hi');
  });
});
