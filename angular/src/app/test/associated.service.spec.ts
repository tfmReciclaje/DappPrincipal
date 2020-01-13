import { TestBed } from '@angular/core/testing';

import { Web3Service } from '../services/web3.service';
import { MainService } from '../services/main.service';
import { AssociatedService } from '../services/associated.service';



describe('AssociatedService', () => {

  let web3Service: Web3Service;
  let mainService: MainService;
  let associatedService: AssociatedService; 
  let associatedHashName: string;

  let account_admin = "0xb253e4fCe8122904072a7EcB464030A0C141D064";  
  let associatedName = "testAssociated";
  let associated_address = "0x5a005c886AAe73f5521C52bdFE153e2a0DAA8Ed5";  
  let not_associated_address = "0xD8780C4dDfb25dFA9CBa11Ee2C000B1c4Ea04D90"; 
  let container_ref = "testContainer";
  let container_address = "0x35F965bc844e269e119C652AdFCa2f2988460B91";  
  let container_address2 = "0xE21cd9F76312De42167A9ed43E55E98018C4AD79";  
  let userName = "pepe";
  let secretWord = "pepe";
  
  
  beforeEach((done) => {

    web3Service = new Web3Service()
    web3Service.bootstrapWeb3();
    
    associatedService = new AssociatedService(web3Service)
    mainService = new MainService(web3Service, associatedService)     

    web3Service.refreshAccounts().then(()=>{      
      expect(web3Service.default_account.account != "").toBeTruthy();
      expect(web3Service.accounts.length > 0).toBeTruthy();

      mainService.init().then(()=>{                
                     
          mainService.getAssociatedList().then((result) => {
          if (result.length == 0){

            console.log("beforeEach._________________________________getAssociatedList: " + result.length)
            
            web3Service.default_account.account = account_admin;
            mainService.AddAssociated(associatedName,associated_address).then(
              result => {
                  console.log("beforeEach. AddAssociated. result: " + JSON.stringify(result));
                  expect(result == "OK").toBeTruthy('beforeEach. Error creating Associated');

                  mainService.getAssociatedList().then((result)=>{                    
                    associatedHashName = result[0];  
                    
                    web3Service.default_account.account = account_admin;
                    mainService.getAssociated(associatedHashName).then((associated) =>{
                      associatedService.init(associated.contract_address);    
                      web3Service.default_account.account = associated_address;
                                               
                      associatedService.AddContainer(container_ref, container_address).then(
                        result => {
                          console.log("beforeEach. AddContainer. result: " + JSON.stringify(result));
                          expect(result == "OK").toBeTruthy('beforeEach. Error adding a new Container');    

                          web3Service.default_account.account = container_address;    
                          associatedService.sendItemCollection(userName, secretWord, 1, 1, 1).then(      
                            result => {
                              console.log("beforeEach. sendItemCollection. result: " + JSON.stringify(result));
                              expect(result > 0).toBeTruthy('beforeEach. Error sending items to Container');
                              done();
                            }
                          );                                
                        }
                      );                                         
                    })                    
                  })                        
              },
              err => {
                expect(err).toHaveBeenCalled();
                done();
              }
            ); 
          }
          else{
            mainService.getAssociatedList().then((result)=>{                    
              associatedHashName = result[0];
              web3Service.default_account.account = account_admin;
              mainService.getAssociated(associatedHashName).then((associated) =>{
                associatedService.init(associated.contract_address);                    
                done();
              });
            });
          }
        });                
      })      
                    
    });
        
    TestBed.configureTestingModule({})
  });
    
  
  it('NOT ADMIN - Not allowed adding a new Container using an account not Admin.', (done) => {
    
    let ref = "ref_container_" + (Math.floor(Math.random() * 1000) + 1).toString();    
    web3Service.default_account.account = not_associated_address;
    associatedService.AddContainer(ref, container_address2).then(
      result => {
          console.log("NOT ADMIN. result: " + JSON.stringify(result));
          expect(result != "OK").toBeTruthy('Error. Not allowed adding a new Container using an account not Admin.');          
          done();
      },
      err => {
        expect(err).toHaveBeenCalled();
        done();
      }
    );
  });

  
  it('PAUSE - Not allowed adding a new Container witdh Associated in Pause.', (done) => {
    
    let ref = "ref_container_" + (Math.floor(Math.random() * 1000) + 1).toString();
    web3Service.default_account.account = account_admin;
    mainService.disableAssociated(associatedHashName).then(
      result => {
          console.log("result: " + JSON.stringify(result));
          expect(result == "OK").toBeTruthy('PAUSE. Error. pausing associated');
          
          web3Service.default_account.account = associated_address;
          associatedService.AddContainer(ref, container_address2).then(
            result => {
                console.log("result: " + JSON.stringify(result));
                expect(result != "OK").toBeTruthy('Error. Not allowed adding a new Container witdh Associated in Pause');     

                web3Service.default_account.account = account_admin;
                mainService.enableAssociated(associatedHashName).then(
                  result => {
                    console.log("result: " + JSON.stringify(result));
                    expect(result == "OK").toBeTruthy('PAUSE. Error. unpausing associated');
                    done();
                  }
                )                
            },
            err => {
              expect(err).toHaveBeenCalled();
              done();
            }
          );
                                
      },
      err => {
        expect(err).toHaveBeenCalled();
        done();
      }
    ); 
    
  });

 
  it('EXISTING REF - Not allowed Adding a new Container with an existing ref.', (done) => {
      
    web3Service.default_account.account = associated_address;                
    associatedService.AddContainer(container_ref, container_address).then(
      result => {
          console.log("result: " + JSON.stringify(result));
          expect(result != "OK").toBeTruthy('EXISTING REF - Error. Not allowed Adding a new Container with an existing ref.');                                       
          done();
      },
      err => {
        expect(err).toHaveBeenCalled();
        done();
      }
    );        
                          
  }) 

  
  it('EXISTING ADDRESS - Not allowed Adding a new Container with an existing address.', (done) => {
    
    let ref = "ref_container_" + (Math.floor(Math.random() * 1000) + 1).toString();
    web3Service.default_account.account = associated_address;                
    associatedService.AddContainer(ref, container_address).then(
      result => {
          console.log("EXISTING ADDRESS. AddContainer. result: " + JSON.stringify(result));
          expect(result != "OK").toBeTruthy('Error. Not allowed Adding a new Container with an existing address.');              
          done();
      },
      err => {
        expect(err).toHaveBeenCalled();
        done();
      }
    );
        
                          
  }) 
         
  it('WRONG SECRET WORD - Not allowed exchange points with a wrong secret word.', (done) => {
        
    web3Service.default_account.account = associated_address;                
    associatedService.exchangePoints(userName, "wrongPassword", 2).then(
      result => {
          console.log("WRONG SECRET WORD. result: " + JSON.stringify(result));
          expect(result != "OK").toBeTruthy('Error. Not allowed exchange point with a wrong secret word.');
          done();
      },
      err => {
        expect(err).toHaveBeenCalled();
        done();
      }
    );                                  
  }) 

  it('EXCHANGE NOT ADMIN - Not allowed exchange points using an account not Admin.', (done) => {
        
    web3Service.default_account.account = not_associated_address;                
    associatedService.exchangePoints(userName, secretWord, 2).then(
      result => {
          console.log("EXCHANGE NOT ADMIN. result: " + JSON.stringify(result));
          expect(result != "OK").toBeTruthy('Error. Not allowed exchange points using an account not Admin.');
          done();
      },
      err => {
        expect(err).toHaveBeenCalled();
        done();
      }
    );                                  
  }) 

  
  it('CLEAR NOT MANAGER - Not allowed exchange points using an Associated Account not Manager.', (done) => {
        
    web3Service.default_account.account = container_address;    
    associatedService.sendItemCollection(userName, secretWord, 3, 3, 3).then(      
      result => {
        console.log("CLEAR NOT MANAGER. sendItemCollection. result: " + JSON.stringify(result));
        expect(result > 0).toBeTruthy('CLEAR NOT MANAGER . Error sending items to Container');
               
        web3Service.default_account.account = associated_address;  
        associatedService.exchangePoints(userName, secretWord, 9).then(
          result => {        
            console.log("CLEAR NOT MANAGER. exchangePoints. result: " + JSON.stringify(result));
            expect(result == "OK").toBeTruthy('CLEAR NOT MANAGER . Error exchangePoints ');

            web3Service.default_account.account = associated_address;  
            associatedService.clearPoints(9).then(
              result => {
                  console.log("CLEAR NOT MANAGER. clearPoints. result: " + JSON.stringify(result));
                  expect(result != "OK").toBeTruthy('Error. Not allowed exchange points using an Associated Account not Manager.');
                  done();
              },
              err => {
                expect(err).toHaveBeenCalled();
                done();
              }
            );
          }
        );
      }
    );
  }) 
  
  

});




