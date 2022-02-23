import { FormValues, Service } from '../interfaces';

interface UserPreferencesServiceInterface {
  allowFutureIdp: boolean;
  idpList: { [key: string]: boolean };
}

export class UserPreferencesService {
  static encodeFormData({ allowFutureIdp, idpList }: UserPreferencesServiceInterface) {
    const formData = new URLSearchParams();
    Object.entries(idpList)
      .filter(([, value]) => value)
      .forEach(([key]) => {
        formData.append('idpList', key);
      });
    formData.append('allowFutureIdp', allowFutureIdp.toString());
    return formData;
  }

  static parseFormData(services: Service[]): FormValues {
    const idpList = services.reduce((acc, { isChecked, uid }) => {
      const next = { ...acc, [uid]: isChecked };
      return next;
    }, {});
    return { allowFutureIdp: true, idpList };
  }
}
