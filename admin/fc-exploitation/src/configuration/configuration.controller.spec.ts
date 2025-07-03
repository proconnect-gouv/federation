import * as moment from 'moment-timezone';
import * as classTransformer from 'class-transformer';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { updateData } from './fixture/configuration.fixtures';

describe('Configuration Controller', () => {
  let configurationController: ConfigurationController;

  const configurationService = {
    getLastConfigIndisponibilityData: jest.fn(),
    updateConfigWithNewMessage: jest.fn(),
  };

  const indisponibilite = {
    message: 'Foundation is the futur',
    dateDebut: '23/09/2019',
    heureDebut: '09:00',
    dateFin: '23/09/2019',
    heureFin: '10:00',
    activateMessage: true,
  };

  const req = {
    flash: jest.fn(),
    user: {
      username: 'Harry Seldon',
    },
    csrfToken: function csrfToken() {
      return 'foundationCsrfToken';
    },
  };

  const res = {
    redirect: jest.fn(),
    locals: {
      APP_ROOT: '/trantro/foundation',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationController],
      providers: [ConfigurationService],
    })
      .overrideProvider(ConfigurationService)
      .useValue(configurationService)
      .compile();

    configurationController = module.get<ConfigurationController>(
      ConfigurationController,
    );

    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(configurationController).toBeDefined();
  });

  describe('get indisponibilite page', () => {
    it('should call configuration service to set data value', async () => {
      // setup
      const data = {
        message: 'Foundation is the futur',
        dateDebut: '23/09/2019',
        heureDebut: '09:00',
        dateFin: '23/09/2019',
        heureFin: '10:00',
        activateMessage: true,
      };
      configurationService.getLastConfigIndisponibilityData.mockResolvedValue(
        data,
      );
      // action
      const result = await configurationController.indisponibilite(req);

      // assertion
      expect(
        configurationService.getLastConfigIndisponibilityData,
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        csrfToken: 'foundationCsrfToken',
        data,
        moment,
      });
    });

    it('should send back the data the user sent it he typed a wrong totp', async () => {
      // setup
      const reqMock = {
        ...req,
        session: {
          flash: {
            values: [
              {
                message: 'Foundation is the futur',
                dateDebut: '23/09/2019',
                heureDebut: '09:00',
                dateFin: '23/09/2019',
                heureFin: '10:00',
                activateMessage: 'true',
              },
            ],
          },
        },
      };

      const resultMock = {
        message: 'Foundation is the futur',
        dateDebut: '23/09/2019',
        heureDebut: '09:00',
        dateFin: '23/09/2019',
        heureFin: '10:00',
        activateMessage: true,
      };
      jest
        .spyOn(classTransformer, 'plainToClass')
        .mockReturnValueOnce(resultMock);
      // action
      const result = await configurationController.indisponibilite(reqMock);

      // assertion
      expect(
        configurationService.getLastConfigIndisponibilityData,
      ).toHaveBeenCalledTimes(0);
      expect(result).toEqual({
        csrfToken: 'foundationCsrfToken',
        data: resultMock,
        moment,
      });
    });
  });

  describe('setIndisponibilite method', () => {
    it('update the "indisponibilite" configuration part', async () => {
      // action
      configurationService.updateConfigWithNewMessage.mockResolvedValueOnce(
        updateData,
      );

      await configurationController.setIndisponibilite(
        indisponibilite,
        req,
        res,
      );

      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'success',
        "La modification du message d'indisponibilité a été réalisée avec succès !",
      );
    });

    it('return an error message if update is impossible', async () => {
      // action
      configurationService.updateConfigWithNewMessage.mockRejectedValueOnce(
        new Error('Something occured...'),
      );

      await configurationController.setIndisponibilite(
        indisponibilite,
        req,
        res,
      );

      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith(
        'globalError',
        "Suite à une erreur la modification du message d'indisponibilité n'a pas été réalisée !",
      );
    });
  });
});
