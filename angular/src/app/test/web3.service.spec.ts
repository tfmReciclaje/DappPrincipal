import { TestBed } from '@angular/core/testing';

import { Web3Service } from '../services/web3.service';

describe('Web3Service', () => {

  let web3Service: Web3Service;

  beforeEach(() =>{    
    TestBed.configureTestingModule({})

    web3Service = new Web3Service()
    web3Service.bootstrapWeb3();
  });

  it('WEB3 - bootstrapWeb3 function launched', (done) => {    
    web3Service.bootstrapWeb3();
    expect(web3Service.web3).toBeTruthy();
    done();
  });

  it('ACCOUNTS - refreshAccounts(). Get accounts from current Provider and get the Default Account', (done) => {    
    web3Service.refreshAccounts().then(()=>{
      expect(web3Service.default_account.account != "").toBeTruthy('Error refreshing accounts from current Provider');
      expect(web3Service.accounts.length > 0).toBeTruthy('Error refreshing accounts from current Provider. No accounts available');
      done();
    });    
  });
    
});
