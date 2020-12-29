import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getModelToken } from '@nestjs/mongoose';

const repositoryMock = {
  find: jest.fn(),
  exec: jest.fn(),
  watch: jest.fn(),
};

const notificationMock = {
  message: 'message mock',
};
const serviceProviderModel = getModelToken('Notifications');
describe('NotificationsService', () => {
  let service: NotificationsService;
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: serviceProviderModel,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    repositoryMock.find.mockReturnValueOnce(repositoryMock);
    repositoryMock.exec.mockResolvedValueOnce(notificationMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return notification', async () => {
    //service.getNotifications = jest.fn().mockResolvedValueOnce(notificationMock)
    service['findActiveNotifications'] = jest
      .fn()
      .mockResolvedValueOnce(notificationMock);
    const expected = notificationMock;

    // action
    const result = await service.getNotifications();

    // expect
    expect(service['findActiveNotifications']).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(expected);
  });
});
