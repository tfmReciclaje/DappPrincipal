import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';

declare let require: any;
const Web3 = require('web3');

declare let window: any;

@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class Web3Service {

  public web3: any;
  public accounts: string[];
  public ready = false;
  public bootstrap = false;

  default_account = {
    amount: 0,    
    balance: 0,
    account: ''
  };
  
  public provider = "Metamask";
  public networkId = "5777";

  public accountsObservable = new Subject<string[]>();

  constructor(        
  ) {
    window.addEventListener('load', (event) => {      
      this.bootstrapWeb3();            
    });
  }

  public bootstrapWeb3() {    
    this.ready = false;  
    this.web3 = null;
    this.accounts = null;

    this.default_account = {
      amount: 0,      
      balance: 0,
      account: ''
    };
    
    try{      
            
      
      if(this.provider == "Metamask"){   
        console.log('Web3 Detected: ' + window.web3.currentProvider)
        //this.web3 = new Web3(window.web3.currentProvider);   

        this.web3 = new Web3(window.ethereum);
        window.ethereum.enable(); // get permission to access accounts

        console.log("isMetaMask: " + this.web3.currentProvider.isMetaMask)
        if (this.web3.currentProvider.isMetaMask){
          if (typeof this.web3.eth.defaultAccount === 'undefined') {
            console.log( "Your browser does not support Ethereum Ðapps");
          }
          else{
            console.log("defaultAccount: " + JSON.stringify(this.web3.eth.defaultAccount))
            console.log("window.web3.eth.defaultAccount: " + JSON.stringify(window.web3.eth.defaultAccount))
          }          
        }                   
        //this.networkId = this.web3.currentProvider.chainId.substring(2);
        console.log("netId: " + this.networkId);     
        console.log(this.web3)             
      }
      else if(this.provider == "Ganache"){        
        Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
        this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));                             
        //this.networkId = "5777";
        console.log(this.web3)      
      }
    }
    catch(err){
      console.log(err)      
      this.web3 = null;
    }
      
    setInterval(() => this.refreshAccounts(), 2000);
  }

  public getContract(contract: any){ 
    
    console.log("contract.networks: " + JSON.stringify(contract.networks))
    if (this.web3){      
      var contract = new this.web3.eth.Contract(contract.abi, contract.networks[this.networkId].address,
        {from: this.default_account.account, gasPrice: '20000000000'}
      );   
      return contract;      
    }
  }

  public async isContract(address: any){
    return this.web3.eth.getCode(address).then((code)=>{
      console.log("code: " + code)
      if(code == '0x'){
        return false;
      }
      else{
        return true;
      }      
    })    
  }
  
  public getContractByAddress(contract: any, address: any){ 

    console.log("contract address: " + JSON.stringify(address))
    if (this.web3){
      var contract = new this.web3.eth.Contract(contract.abi, address,        
        {from: this.default_account.account, gasPrice: '20000000000'}
      );   
      return contract;      
    }
  }

  public async refreshAccounts() {
    if (this.web3){
      return this.web3.eth.getAccounts((err, accs) => {                
        console.log('Refreshing accounts');
        if (err != null) {                    
          console.warn('There was an error fetching your accounts.');          
          return;
        }        

          
        // Get the initial account balance so it can be displayed.
        if (accs.length === 0) {
          console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
          return;
        }
          
        if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
          console.log('Observed new accounts');
  
          this.accountsObservable.next(accs);        
          this.accounts = accs;
          this.default_account.account= this.accounts[0];
          this.updateBalance();
        }  
  
        this.ready = true;
      });
    }
    
  }

  async updateBalance() {
       
    if (this.web3){
      console.log('Sending getBalance transaction... (please wait)');
      try {        
        this.web3.eth.getBalance(this.default_account.account).then((balance) => {
          console.log('Balance en wei: ' + balance);
          this.default_account.balance = this.web3.utils.fromWei(balance, 'ether')
        });       
      } catch (e) {
        console.log(e);      
      }
    }
  }

  public async getBalance(address:string){
    return this.web3.eth.getBalance(address).then((balance) => {
      console.log('Balance: ' + balance);
      return balance;    
    });
  }   
     
}
