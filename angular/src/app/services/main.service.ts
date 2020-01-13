import { Injectable } from '@angular/core';
import { AssociatedService } from './associated.service';
import { Web3Service } from './web3.service';

//import { sha256, sha224 } from 'js-sha256';
//import { preserveWhitespacesDefault } from '@angular/compiler';
//import { stringify } from '@angular/compiler/src/util';

declare let require: any;
const main_truffle_contract = require('../../../../truffle/build/Main.json');
const associated_list = require('../../assets/associatedList.json');

@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class MainService {

  getAssociatedName(hashName: string): string{
    var associatedName="";
    associated_list.forEach(element => {
      if (hashName == this.web3Service.web3.utils.keccak256(element.name)){
        associatedName = element.description;        
      }                                 
    });
    return associatedName;
  }

  public _paused: boolean = false;

  public _admin = false;
    
  public associatedList: Array<any>;
  public associatedTable: Array<any>;
  
  public totalGeneratedPoints: number = 0;
  public totalExchangedPoints: number = 0;
  public totalExchangedItems: number = 0;
  public totalClearedPoints: number = 0;
  public totalPack1: number = 0;
  public totalPack2: number = 0;
  public totalPack3: number = 0;  
  public totalItems: number = 0;

  
  
  contractMain: any;

  constructor(private web3Service: Web3Service, private associatedService: AssociatedService) {        
  }

  public async init(){
            
    if (this.web3Service.ready) {
      console.log("web3Service: ready");
      
      this.contractMain = this.web3Service.getContract(main_truffle_contract);
      console.log("contractMain: " + this.contractMain);      

      return this.paused().then((result)=>{
        return result;
      });     
    }    
  }

  public getContractAddress(){
    if (this.web3Service.provider == "URL"){
      return main_truffle_contract.networks[this.web3Service.networkId].address;
    }
    if (this.web3Service.provider == "Metamask"){
      return main_truffle_contract.networks[this.web3Service.networkId].address;
    }
  } 

  public async getAssociatedList() {

    if (this.contractMain){
      this.associatedList = new Array<any>();
      console.log('Sending getAssociatedList call... (please wait)');
      try {
        return this.associatedList = await this.contractMain.methods.getAssociatedList().call().then(function(receipt){
          console.log("associatedList: " + receipt)          
          return receipt;
        });            

      } catch (e) {
        console.log(e);      
      }
    }    
  }
 

  public async getAssociated(hashName: String) {
        
    let associated:any;
    
      if (this.contractMain){
        try {     
          console.log("getAssociated. hashName: " + hashName)
          console.log('Sending getAssociated call... (please wait)');
          return this.contractMain.methods.getAssociated(hashName).call().then(function(receipt){
            console.log("getAssociated: " + JSON.stringify(receipt)    )
            associated = {};                   
            associated.hashName = hashName;                        
            associated.contract_address = receipt.contract_address;
            associated.enable = receipt.enable;
            return associated;
          });  
        } catch (error) {
          console.log(error);      
        }
      }          
  }
  
  public async getAssociatedTable() {              
    try {        
      console.log("getting Associated Table");      
      this.associatedTable = new Array<any>();        
      this.totalGeneratedPoints = 0;
      this.totalExchangedPoints = 0;
      this.totalClearedPoints = 0;
      this.totalPack1 = 0;
      this.totalPack2 = 0;
      this.totalPack3 = 0;
      this.totalItems = 0;

      this.getAssociatedList().then( () =>{            
        this.associatedList.forEach(hashName => {          
          this.getAssociated(hashName).then((associated) =>{              
            this.associatedService.init(associated.contract_address);                
            if (this.associatedService.contractAssociated){
              this.associatedService.contractAssociated.methods.getAssociatedInfo().call().then((associatedInfo) => {
                console.log("exchangedItems: " + JSON.stringify(associatedInfo._exchangedItems));                 
                console.log("generatedPoints: " + JSON.stringify(associatedInfo._generatedPoints));                 
                console.log("exchangedPoints: " + JSON.stringify(associatedInfo._exchangedPoints));                                 
                console.log("clearedPoints: " + JSON.stringify(associatedInfo._clearedPoints));                 
                console.log("pack1: " + JSON.stringify(associatedInfo._pack1));
                console.log("pack2: " + JSON.stringify(associatedInfo._pack2));
                console.log("pack3: " + JSON.stringify(associatedInfo._pack3));

                associated.name = this.getAssociatedName(hashName);
                associated.exchangedItems = Number.parseInt(associatedInfo._exchangedItems);
                associated.generatedPoints = Number.parseInt(associatedInfo._generatedPoints);
                associated.exchangedPoints = Number.parseInt(associatedInfo._exchangedPoints);
                associated.clearedPoints = Number.parseInt(associatedInfo._clearedPoints);
                associated.pack1 = Number.parseInt(associatedInfo._pack1);
                associated.pack2 = Number.parseInt(associatedInfo._pack2);
                associated.pack3 = Number.parseInt(associatedInfo._pack3);                
                this.associatedTable.push(associated);
                console.log("Asociado: " + JSON.stringify(associated));

                this.totalGeneratedPoints = this.totalGeneratedPoints + associated.generatedPoints;
                this.totalExchangedPoints = this.totalExchangedPoints + associated.exchangedPoints;
                this.totalExchangedItems = this.totalExchangedItems + associated.exchangedItems;
                this.totalClearedPoints = this.totalClearedPoints + associated.clearedPoints;
                this.totalPack1 = this.totalPack1 + associated.pack1;
                this.totalPack2 = this.totalPack2 + associated.pack2;
                this.totalPack3 = this.totalPack3 + associated.pack3;  
                this.totalItems = this.totalPack1  + this.totalPack2 + this.totalPack3;                                                                                
              })                      
            }
          });
        });
      });
      
    } catch (error) {
      console.log(error);
    }    
  }  
  
  public async AddAssociated(name, contract_address) {  
    
    let result:string;
    console.log('sending addAssociated transaction... (please wait)');
    try {                  
      var hashName=this.web3Service.web3.utils.keccak256(name);
      console.log("hashName: " + hashName)            

      return this.contractMain.methods.addAssociated(hashName, contract_address).send(300000000,{from: this.web3Service.default_account.account, gas:'3000000'})
        .then(function(receipt){
          console.log("Transaction complete. Return: " + JSON.stringify(receipt))
          return 'OK';
          })
        .catch(function(error){
          console.log("Transaction failed. Error: " + error)
          return error;
        });

    } catch (error) {
      console.log("AddAssociated failed. Error: " + error);    
      return error;          
    }    
           
  }

  public async enableAssociated(hashName: String) {  
    
    if (this.web3Service.ready){
      console.log('sending enableAssociated transaction... (please wait)');
      try {      

        return this.contractMain.methods.enableAssociated(hashName).send({from: this.web3Service.default_account.account, gas:'1200000', gasPrice: '20000000000' })
          .then(function(receipt){
            console.log("Transaction complete. Return: " + JSON.stringify(receipt))
            return 'OK';
            })
          .catch(function(error){
            console.log("Transaction failed. Error: " + error)
            return error;
            });

      } catch (error) {
        console.log("enableAssociated failed. Error: " + error);    
        return error;            
      }    
    }
           
  }

  public async disableAssociated(hashName: String) {  
    
    if (this.web3Service.ready){
      console.log('sending disableAssociated transaction... (please wait)');
      try {      

        console.log("hashName: " + hashName)
        return this.contractMain.methods.disableAssociated(hashName).send({from: this.web3Service.default_account.account, gas:'1200000', gasPrice: '20000000000' })
          .then(function(receipt){
            console.log("Transaction complete. Return: " + JSON.stringify(receipt))
            return 'OK';
            })
          .catch(function(error){
            console.log("Transaction failed. Error: " + error);                        
            return error;
            });

      } catch (error) {
        console.log("disableAssociated failed. Error: " + error);    
        return error;            
      }    
    }
           
  }

  public async pause() {  
        
    if (this.web3Service.ready){
      console.log('sending pause transaction... (please wait)');
      try {      

        return this.contractMain.methods.pause().send({from: this.web3Service.default_account.account, gas:'1200000', gasPrice: '20000000000' })
          .then(function(receipt){
            console.log("Transaction complete. Return: " + JSON.stringify(receipt))

            return 'OK';
            })
          .catch(function(error){
            console.log("Transaction failed. Error: " + error)
            return error;
            });

      } catch (error) {
        console.log("pause failed. Error: " + error);    
        return error;            
      }    
    }
           
  }

  public async unpause() {  
    
    if (this.web3Service.ready){
      console.log('sending unpause transaction... (please wait)');
      try {      

        return this.contractMain.methods.unpause().send({from: this.web3Service.default_account.account, gas:'1200000', gasPrice: '20000000000' })
          .then(function(receipt){
            console.log("Transaction complete. Return: " + JSON.stringify(receipt))
            return 'OK';
            })
          .catch(function(error){
            console.log("Transaction failed. Error: " + error)
            return error;
            });

      } catch (error) {
        console.log("unpause failed. Error: " + error);    
        return error;            
      }    
    }           
  }

  public async paused() {  
    if (this.web3Service.ready){
      console.log('sending paused call... (please wait)');
      if (this.contractMain){
        try {         
          return this.contractMain.methods.paused().call({from: this.web3Service.default_account.account}).then( (receipt) => {                              
            console.log("paused: " + receipt)
            this._paused = receipt;
            return 'OK';
          });            
        } catch (error) {
          console.log("Error: paused: "  + error);    
          return error;  
        }
      }
      else{
        this.delay(2000).then(()=>{
          this.paused();
        })        
      }
    } 
    else{
      this.delay(2000).then(()=>{
        this.paused();
      })      
    }            
  }  
    

  public async isAdmin() {
    if (this.web3Service.ready){
      console.log('sending isAdmin call... (please wait)');
      if (this.contractMain){
        try {                   
          return this.contractMain.methods.isAdmin().call({from: this.web3Service.default_account.account}).then((receipt)=>{                        
            this._admin = receipt;
            return receipt;
          });            
        } catch (e) {
          console.log("Error: isAdmin: "  + e);      
        }
      }
      else{
        this.delay(2000).then(()=>{
          return this.isAdmin();
        })        
      }
    } 
    else{
      this.delay(2000).then(()=>{
        return this.isAdmin();
      })      
    }            
  }  

  public async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
