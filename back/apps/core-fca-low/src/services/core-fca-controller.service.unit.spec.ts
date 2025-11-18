import { CoreFcaControllerService } from './core-fca-controller.service';

describe('CoreFcaControllerService', () => {
  let service: CoreFcaControllerService;

  it('should build authorize URL params', () => {
    const subject = new CoreFcaControllerService(null,null,null,null,null,null,null,null);
    const params = subject.authorizationParameters('anyState','anyNonce','any scope','any hint','any sp ID','any name', false, null, '', '', '1');
    expect(params).toMatchObject(
        {
            state:'anyState',
            nonce:'anyNonce',
            scope:'any scope',
            acr_values: 'eidas1',
            claims: {
                id_token: {
                    amr: null,
                    acr: null,
                },
            },
            login_hint: 'any hint',
            sp_id: 'any sp ID',
            sp_name: 'any name',
            remember_me: false,
        }
    );
  });

});