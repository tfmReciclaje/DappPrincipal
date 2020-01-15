import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';

import { sha256, sha224 } from 'js-sha256';
import { Container } from '@angular/compiler/src/i18n/i18n_ast';

declare let require: any;

const associated_truffle_contract = require('../../../../truffle/build//Associated_FC.json');

@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class AssociatedService {

  public _pause: boolean = false;

  public _admin = false;
    
  public containerList: Array<any>;
  public containerTable: Array<any>;
  
  public generatedPoints: Number;
  public exchangedPoints: Number;

  public associatedInfo: any;
  public hashAssociatedName: string;
  public associatedName: string;

  associated_contract_address: any;
  contractAssociated: any;

  eventGenerate: any;


  constructor(private web3Service: Web3Service) {        
  }

  public init(associated_contract_address: any){
        
    console.log("this.web3Service.ready: " + this.web3Service.ready)
    if (this.web3Service.ready) {
      console.log("web3Service: ready");
      
      console.log("associated_contract_address: " + associated_contract_address)
      this.contractAssociated = this.web3Service.getContractByAddress(associated_truffle_contract, associated_contract_address);
      console.log("this.contractAssociated: OK")
      this.associated_contract_address = associated_contract_address;      
      console.log("contractAssociated: " + this.contractAssociated);      
      
    }    
  }

  public async getAssociatedInfo(){
    if (this.contractAssociated){      
      console.log('Sending getAssociatedInfo call... (please wait)');
      try {
        return this.contractAssociated.methods.getAssociatedInfo().call().then((associatedInfo) => {          
          this.associatedInfo = associatedInfo;        
          console.log("associatedInfo: " + JSON.stringify(associatedInfo));
          return associatedInfo;
        });            

      } catch (e) {
        console.log(e);      
      }
    }    
  }

  public getContractAddress(){
    if (this.web3Service.provider == "URL"){
      return associated_truffle_contract.networks[this.web3Service.networkId].address;
    }
    if (this.web3Service.provider == "Metamask"){
      return associated_truffle_contract.networks[this.web3Service.networkId].address;
    }
  } 

  
  public async getContainerList() {

    if (this.contractAssociated){
      this.containerList = new Array<any>();
      console.log('Sending getContainerList call... (please wait)');
      try {
        this.containerList = await this.contractAssociated.methods.getContainerList().call().then(function(receipt){
          console.log("containerList: " + receipt)          
          return receipt;
        });            

      } catch (e) {
        console.log(e);      
      }
    }    
  }
  
 
  public async getContainerTable() {              
    try {      
      console.log("getting Container Table");      
      this.containerTable = new Array<any>();  

      console.log("------getContainerTable. contractAssociated:  " + this.contractAssociated._address)          
      this.getContainerList().then( () =>{            
        this.containerList.forEach(container_address => {          
          console.log("container_address: " + container_address)
          this.contractAssociated.methods.listContainers(container_address).call().then((container) => {
            console.log("Container: " + JSON.stringify(container));            
            container.container_address = container_address;  
            container.startDate = new Date(container.startDate * 1000);
            container.stateDate = new Date(container.stateDate * 1000);
            this.containerTable.push(container);
          })
        })
      });
      
    } catch (e) {
      console.log(e);      
    }    
  }  
  
  
  public async AddContainer(ref, container_address) {  
    
    let result:string;
    console.log('sending AddContainer transaction... (please wait)');
    try {      

      //var hashName = "0x" + sha256(name);
      //var nameRef=this.web3Service.web3.utils.keccak256(ref);
      //var nameRef=this.web3Service.web3.web3StringToBytes32(ref);
      var nameRef=this.web3Service.web3.utils.fromAscii(ref);      
      console.log("nameRef: " + nameRef)            
      
      return this.contractAssociated.methods.addContainer(nameRef, container_address).send({from: this.web3Service.default_account.account, gas:'3000000'})
        .then(function(receipt){
          console.log("Transaction complete. Return: " + JSON.stringify(receipt))
          return 'OK';
          })
        .catch(function(error){
          console.log("Transaction failed. Error: " + error)
          return error;
        });

    } catch (error) {
      console.log("Transaction failed. Error: " + error)
          return error;    
      
    }    
           
  }

  public async enableContainer(container_address: any) {  
    
    if (this.web3Service.ready){
      console.log('sending enableContainer transaction... (please wait)');
      try {      

        return this.contractAssociated.methods.enableContainer(container_address).send({from: this.web3Service.default_account.account, gas:'1200000', gasPrice: '20000000000' })
          .then(function(receipt){
            console.log("Transaction complete. Return: " + JSON.stringify(receipt))
            return 'OK';
            })
          .catch(function(error){
            console.log("Transaction failed. Error: " + error)
            return 'KO';
            });

      } catch (e) {
        console.log(e);    
        return 'KO';            
      }    
    }
           
  }

  public async disableContainer(container_address: any) {  
    
    if (this.web3Service.ready){
      console.log('sending disableContainer transaction... (please wait)');
      try {      
        
        console.log("container_address: " + container_address)
        return this.contractAssociated.methods.disableContainer(container_address).send({from: this.web3Service.default_account.account, gas:'1200000', gasPrice: '20000000000' })
          .then(function(receipt){
            console.log("Transaction complete. Return: " + JSON.stringify(receipt))
            return 'OK';
            })
          .catch(function(error){
            console.log("Transaction failed. Error: " + error)
            return 'KO';
            });

      } catch (e) {
        console.log(e);    
        return 'KO';    
        
      }    
    }
           
  }
  
  public async sendItemCollection(userName: string, secretWord: string, pack1: number,  pack2: number, pack3: number) {      
        
    console.log('sending packagingCollection transaction... (please wait)');
    try {      
          
      console.log("userName: " + userName)
      console.log("secretWord: " + secretWord)
      console.log("pack1: " + pack1)
      console.log("pack2: " + pack2)
      console.log("pack3: " + pack3)
      

      var hashUserName=this.web3Service.web3.utils.keccak256(userName);
      console.log("hashUserName: " + hashUserName)            

      var hashSecret = "";
      if (secretWord){
        hashSecret=this.web3Service.web3.utils.keccak256(secretWord);
        console.log("hashSecret: " + hashSecret)            
      }else{
        hashSecret= this.web3Service.web3.utils.fromAscii("")
      }
            
      return this.contractAssociated.methods.packagingCollection(hashUserName, hashSecret, pack1, pack2 , pack3).send({from: this.web3Service.default_account.account, gas:'3000000'})
        .then(function(receipt){
          console.log("Transaction complete. Return: " + JSON.stringify(receipt))          
          return receipt.events.Generate.returnValues.points;
        })
        .catch(function(error){          
          console.log("Transaction failed. Error: " + error)         
          return error;          
        });

    } catch (e) {
      console.log(e);    
      return e;    
      
    }    
           
  }

  public async exchangePoints(userName: string, secretWord: string, amount: number) {
        
    console.log('sending exchangePoints transaction... (please wait)');
    try {      
          
      console.log("userName: " + userName)
      console.log("secretWord: " + secretWord)
      console.log("amount: " + amount)      
      

      var hashUserName=this.web3Service.web3.utils.keccak256(userName);
      console.log("hashUserName: " + hashUserName)            

      var hashSecret = "";
      if (secretWord){
        hashSecret=this.web3Service.web3.utils.keccak256(secretWord);
        console.log("hashSecret: " + hashSecret)            
      }      
            
      return this.contractAssociated.methods.exchangePoints(hashUserName, hashSecret, amount).send({from: this.web3Service.default_account.account, gas:'3000000'})
        .then(function(receipt){
          console.log("Transaction complete. Return: " + JSON.stringify(receipt))          
          //return receipt;
          return "OK";
          })
        .catch(function(error){          
          console.log("Transaction failed. Error: " + error)         
          return error;          
        });

    } catch (e) {
      console.log(e);    
      return e;    
      
    }    
           
  }

  public async clearPoints(amount: number) {
        
    console.log('sending clearPoints transaction... (please wait)');
    try {                
      console.log("amount: " + amount)      
                   
      return this.contractAssociated.methods.clearPoints(amount).send({from: this.web3Service.default_account.account, gas:'3000000'})
        .then(function(receipt){
          console.log("Transaction complete. Return: " + JSON.stringify(receipt))                    
          return "OK";
          })
        .catch(function(error){          
          console.log("Transaction failed. Error: " + error)         
          return error;          
        });

    } catch (e) {
      console.log(e);    
      return e;    
      
    }    
           
  }

  public async getUserBalance(userName) {              
    try {      
      console.log("getting User Balance");
      
      var hashUserName=this.web3Service.web3.utils.keccak256(userName);
      console.log("hashUserName: " + hashUserName)            


      return this.contractAssociated.methods.getUserBalance(hashUserName).call().then( (userBalance) => {                    
        console.log("User Points: " + JSON.stringify(userBalance));
        return userBalance;
      })
          
    } catch (e) {
      console.log(e);      
    }    
  } 


  public async pause() {  
        
    if (this.web3Service.ready){
      console.log('sending pause transaction... (please wait)');
      try {      

        return this.contractAssociated.methods.pause().send({from: this.web3Service.default_account.account, gas:'1200000', gasPrice: '20000000000' })
          .then(function(receipt){
            console.log("Transaction complete. Return: " + JSON.stringify(receipt))

            return 'OK';
            })
          .catch(function(error){
            console.log("Transaction failed. Error: " + error)
            return 'KO';
            });

      } catch (e) {
        console.log(e);    
        return 'KO';    
        
      }    
    }
           
  }

  public async unpause() {  
    
    if (this.web3Service.ready){
      console.log('sending unpause transaction... (please wait)');
      try {      

        return this.contractAssociated.methods.unpause().send({from: this.web3Service.default_account.account, gas:'1200000', gasPrice: '20000000000' })
          .then(function(receipt){
            console.log("Transaction complete. Return: " + JSON.stringify(receipt))
            return 'OK';
            })
          .catch(function(error){
            console.log("Transaction failed. Error: " + error)
            return 'KO';
            });

      } catch (e) {
        console.log(e);    
        return 'KO';    
        
      }    
    }           
  }

  public async paused() {  
    if (this.web3Service.ready){
      console.log('sending paused call... (please wait)');
      if (this.contractAssociated){
        try {         
          this._pause = this.contractAssociated.methods.paused().call({from: this.web3Service.default_account.account}).then(function(receipt){                              
            console.log("paused: " + receipt)
            return receipt;            
          });            
        } catch (e) {
          console.log("Error: paused: "  + e);      
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
      if (this.contractAssociated){
        try {                   
          return this.contractAssociated.methods.isAdmin(this.web3Service.default_account.account).call({from: this.web3Service.default_account.account}).then((receipt)=>{                        
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
