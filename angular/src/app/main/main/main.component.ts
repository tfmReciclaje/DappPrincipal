import { Component, OnInit, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router'

import { AddAssociatedComponent } from '../add-associated/add-associated.component';
import { MessageComponent } from '../../common/message/message.component';

import { MainService } from '../../services/main.service';
import { AssociatedService } from '../../services/associated.service';
import { Web3Service } from '../../services/web3.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
    
  selectedRow: number;
  associated_selected: any;

  constructor(public mainService: MainService,     
    public associatedService: AssociatedService,     
    public web3Service: Web3Service,       
    public modalService: NgbModal,
    public router: Router,     
    private matSnackBar: MatSnackBar) { }    

  ngOnInit() {           
    this.updateWeb3();      
  }  

  async updateWeb3(){  
         
    if (!this.web3Service.ready){
      const delay = new Promise(resolve => setTimeout(resolve, 500));
      await delay;
      this.ngOnInit();
    }
    else{ 
      console.log("updateWeb3:  web3Service.ready")     
      this.mainService.init();                  
      this.mainService.getAssociatedTable();        
    }
  }

  public enableLabel(enable){
    if (enable) 
      return "Disabled";
    else
      return "Enabled";    
  }
  
  enable(hashName, enable){
    if (enable){
      this.mainService.disableAssociated(hashName)
      .then(
        result => {                          
          if (result == "OK"){   
            //this.setStatus("Se ha desactivado con Exito el contrato del Asociado");  
            //this.toastService.show('I am a success toast', { classname: 'bg-success text-light', delay: 10000 });
            this.web3Service.updateBalance();
            this.mainService.getAssociatedTable();            
          }
          else{            
            const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = "";   
            console.log("typeof: " + typeof(result))
            console.log(result.revert)
            if (result.toString().includes("Pausable: paused")){
              message.componentInstance.details = "No se puede modificar el estado de un asociado. El contrato está en modo Pausa";  
            }
            else{
              message.componentInstance.details = "No tiene permisos para deshabilitar el contrato del Asociado. Solo la cuenta propietaria del contrato principal puede cambiar el estado del contrato del asociado";            
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

    if (!enable){
      this.mainService.enableAssociated(hashName)
      .then(
        result => {                          
          if (result == "OK"){ 
            //this.setStatus("Se ha activado con Exito el contrato del Asociado"); 
            this.web3Service.updateBalance();
            this.mainService.getAssociatedTable();
          }
          else{
            const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = ""; 
            console.log(result)           
            if (result.toString().includes("Pausable: paused")){
              message.componentInstance.details = "No se puede modificar el estado de un asociado. El contrato está en modo Pausa";  
            }
            else{
              message.componentInstance.details = "No tiene permisos para habilitar el contrato del Asociado. Solo la cuenta propietaria del contrato principal puede cambiar el estado del contrato del asociado";            
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

  public addAssociated(){                  
    const modalRef = this.modalService.open(AddAssociatedComponent,{ size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.mode = "add";    
    modalRef.componentInstance.associated = {};    
    modalRef.result.then((result) => {       
      if (result == 'OK'){           
        this.mainService.getAssociatedTable();        
        this.selectedRow = -1;   
      }
    }).catch((error) =>{      
    });     
  }

  public openAsociated(associated){

    if (associated.enable){

      this.associatedService.init(associated.contract_address);
      this.associatedService.isAdmin().then((result) =>{
        if (result){        
          this.router.navigate(['associated']);
        }
        else{
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
          message.componentInstance.type = 'Warning';
          message.componentInstance.body = "";
          message.componentInstance.details = "No tiene permisos para abrir el Asociado con la cuenta seleccionada";
          message.result.then(() => {}); 
        }
      });
    }
    else{
      const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
      message.componentInstance.type = 'Warning';
      message.componentInstance.body = "";
      message.componentInstance.details = "No se puede acceder. El contrato del asociado está desactivado";
      message.result.then(() => {}); 
    }
  }

  public updateAccountBalance(){    
    if (this.web3Service.ready){
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
    
  }

  
  select(index, associated) {                
    if (this.selectedRow == index){
      this.selectedRow = -1;      
    }
    else{
      this.selectedRow = index;
      this.associated_selected = associated;
    }    
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, 
      {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition:'right'
      }
    );
  }
}