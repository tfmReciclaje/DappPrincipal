import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar';

import { Web3Service } from '../services/web3.service';
import { MainService } from '../services/main.service';
import { AssociatedService } from '../services/associated.service';
import { MessageComponent } from '../common/message/message.component';
import { AddressComponent } from '../address/address.component';

import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  constructor(public web3Service: Web3Service, 
    public mainService: MainService, 
    public associatedService: AssociatedService, 
    public modalService: NgbModal,
    public router: Router, 
    public matSnackBar: MatSnackBar) { }    

       
   
  ngOnInit() {      
    this.updateProvider("");  
  }

  async updateProvider(address: any){  
    
    this.web3Service.bootstrapWeb3();         
    this.web3Service.refreshAccounts().then(()=>{            
      if (this.web3Service.ready){   
        this.mainService.init(address).then((result) =>{
          console.log("init: " + result)
          if (result){          
            this.mainService.paused().then((result)=>{
                this.mainService.isAdmin();
                this.mainService.getAssociatedTable();  
            });     
          }
        })            
      }
    })    
    
  }  
  
  balance(){
    return this.web3Service.default_account.balance + " ETH"
  }

  async updateAccount(){
           
      this.web3Service.getBalance(this.web3Service.default_account.account)
      .then(                
        result => { 
          this.web3Service.default_account.balance = result;          
        },
        err => {
          console.log(err)      
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
          message.componentInstance.type = 'Error';
          message.componentInstance.body = "";
          message.componentInstance.details = err.toString();
          message.result.then(() => {});          
        }
      )             
  }

  textPause(){    
    if (this.mainService._paused) return "Paused"
    else return "Unpaused"
  }

  updatePaused(){          
    console.log("updatePaused()");
    if (this.mainService){
      this.mainService.paused().then(()=>{        
        const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
        message.componentInstance.type = 'Warning';
        message.componentInstance.body = "";
        if (this.mainService._paused){
          message.componentInstance.details = "Se ha pausado el contrato principal. No se podrán realizar ninguna operación hasta volver a activarlo";
        } 
        else{
          message.componentInstance.details = "Se ha vuelto a activar el contrato principal.";
        }               
        message.result.then(() => {}); 
      });      
    }    
  }

  changeAccount(){
    this.web3Service.updateBalance().then(()=>{      
    });
    
  }

  pause(){
    if (this.mainService._paused){      
      this.mainService.unpause()
      .then(
        result => {                          
          if (result == "OK"){  
            this.updatePaused(); 
          }
          else{
            const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'}); 
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = "";
            if (result.toString().includes("caller does not have the Admin role")){
              message.componentInstance.details = "La cuenta utilizada no tiene permisos para modificar el estado del contrato principal";
            } 
            else{
              message.componentInstance.details = result.toString();;
            }  
            message.result.then(() => {});                                                                
          }
        },
        err => {
          console.log(err)      
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
          message.componentInstance.type = 'Error';
          message.componentInstance.body = "";
          message.componentInstance.details = err.toString();
          message.result.then(() => {});          
        }

      )
    }
    if (!this.mainService._paused){
      this.mainService.pause()
      .then(
        result => {                          
          if (result == "OK"){        
            this.updatePaused();                                                      
          }
          else{
            const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'}); 
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = "";
            if (result.toString().includes("caller does not have the Admin role")){
              message.componentInstance.details = "La cuenta utilizada no tiene permisos para modificar el estado del contrato principal";
            } 
            else{
              message.componentInstance.details = result.toString();;
            }  
            message.result.then(() => {}); 
          }
        },
        err => {
          console.log(err)      
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
          message.componentInstance.type = 'Error';
          message.componentInstance.body = "";
          message.componentInstance.details = err.toString();
          message.result.then(() => {});          
        }

      )
    }
  }

  address(){    
    const modalRef = this.modalService.open(AddressComponent,{ size: 'lg', backdrop: 'static'});
    modalRef.result.then((address) => { 
      if (address != 'KO'){          
        this.updateProvider(address);        
      }
    }).catch((error) =>{      
    }); 
  }  

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

 
}
