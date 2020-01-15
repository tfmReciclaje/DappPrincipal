import { TestBed } from '@angular/core/testing';

import { Web3Service } from '../services/web3.service';
import { MainService } from '../services/main.service';
import { AssociatedService } from '../services/associated.service';


describe('MainService. Adding Associated', () => {

  let web3Service: Web3Service;
  let mainService: MainService;
  let associatedService: AssociatedService;    

  let associatedHashName: string
  let account_admin = "0xb253e4fCe8122904072a7EcB464030A0C141D064";
  let account_not_admin = "0xCEE6C68A9770F7800477B916F2dB7ED6FC32dd14";
  let associated_address = "0x5a005c886AAe73f5521C52bdFE153e2a0DAA8Ed5";  
  let associatedName = "testAssociated";
  let container_ref = "testContainer";
  let container_address = "0x35F965bc844e269e119C652AdFCa2f2988460B91";  
  let userName = "pepe";
  let secretWord = "pepe";
  
  beforeEach((done) => {

    TestBed.configureTestingModule({})

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

            web3Service.default_account.account = account_admin;
            mainService.AddAssociated(associatedName,associated_address).then(
              result => {
                  console.log("beforeEach: AddAssociated: result: " + JSON.stringify(result));
                  expect(result == "OK").toBeTruthy('beforeEach. Error creating associated.');

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
                          associatedService.sendItemCollection(userName, secretWord, 2, 2, 2).then(      
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
            done();
          }
        });        
      });                      
    });
        
    
  });
    
  it('NOT ADMIN - Not allowed adding a new Associated using an account not Admin.', (done) => {
        
    web3Service.default_account.account = account_not_admin;
    let associatedName = "associated" + (Math.floor(Math.random() * 1000) + 1).toString();    
    mainService.AddAssociated(associatedName, associated_address).then(
      result => {
          console.log("NOT ADMIN: AddAssociated. result: " + JSON.stringify(result));             
          expect(result != "OK").toBeTruthy('Error. Not allowed adding a new Associated using an account not Admin.');               
          done();
      },
      err => {
        expect(err).toHaveBeenCalled();
        done();
      }
    );    
  });

  
  it('PAUSE - Not allowed adding a new Associated in pause.', (done) => {

    let associatedName = "associated" + (Math.floor(Math.random() * 1000) + 1).toString();    
    web3Service.default_account.account = account_admin;      
    mainService.pause().then( (result) => {
      if (result == "OK"){
        mainService.AddAssociated(associatedName,associated_address).then(
          result => {
            console.log("PAUSE. AddAssociated. result: " + JSON.stringify(result));
            expect(result != "OK").toBeTruthy('Error. Not allowed adding a new Associated in pause.');
            
            mainService.unpause().then((result) =>{
              expect(result == "OK").toBeTruthy('Error. changing Unpaused mode');
              done();
            });                
          },
          err => {
            expect(err).toHaveBeenCalled();
            done();
          }
        );    
      }            
    });     
  });
  

  it('EXISTING ASSOCIATED NAME - Not allowed Adding a new Associated with a existing Associated Name.', (done) => {
        
    web3Service.default_account.account = account_admin;    
    mainService.AddAssociated(associatedName,associated_address).then(
      result => {
          console.log("result: " + JSON.stringify(result));
          expect(result != "OK").toBeTruthy('Error. Not allowed Adding a new Associated with a existing Associated Name.');      
          done();
      }
    );         
                      
  })       
    
  it('ENABLE/DISABLE - Disable an associated using an account Not Admin.', (done) => {
    
    mainService.getAssociatedList().then((result)=>{                    
      associatedHashName = result[0];  

      console.log("associatedHashName: " + associatedHashName)
      web3Service.default_account.account = account_not_admin;
      mainService.disableAssociated(associatedHashName).then(
        result => {
            console.log("result: " + JSON.stringify(result));
            expect(result != "OK").toBeTruthy('Error. Disable an associated using an account Not Admin');  
            done();                   
        }
      );    
    });          
  });
   
});