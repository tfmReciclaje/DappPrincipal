import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddContainerComponent } from '../add-container/add-container.component';
import { ContainerComponent } from '../container/container.component';
import { DiscountComponent } from '../discount/discount.component';
import { ClearComponent } from '../clear/clear.component';

import { MessageComponent } from '../../common/message/message.component';

import { AssociatedService } from '../../services/associated.service';
import { MainService } from '../../services/main.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-associated',
  templateUrl: './associated.component.html',
  styleUrls: ['./associated.component.css']
})
export class AssociatedComponent implements OnInit {
    
  selectedRow: number;
  container_selected: any;

  //@Input() associatedName:string;

  constructor(public associatedService: AssociatedService,     
    public mainService: MainService,   
    public web3Service: Web3Service,       
    public modalService: NgbModal,
    public router: Router) { }    

  ngOnInit() {    
      this.updateWeb3();      
  }  

  async updateWeb3(){    
    if (!this.web3Service.ready){
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      this.ngOnInit();
    }
    else{      
      if (this.associatedService.associated_contract_address){
        //this.associatedService.getHashAssociatedName();
        this.associatedService.getAssociatedInfo();
        this.associatedService.getContainerTable();  
      }      
    }
  }

  public enableLabel(enable){
    if (enable) 
      return "Disable";
    else
      return "Enable";    
  }
  
  enable(container_address, isEnable){
    if (isEnable){
      this.associatedService.disableContainer(container_address)
      .then(
        result => {                          
          if (result == "OK"){               
            this.associatedService.getContainerTable();            
          }
          else{
            const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = "";
            message.componentInstance.details = "No tiene permisos para deshabilitar el contenedor seleccionado. Solo la cuenta del asociado puede modificar el estado de los contenedore";
            message.result.then(() => {}); 
          }
        },
        err => {
          console.log(err);
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
          message.componentInstance.type = 'Error';
          message.componentInstance.body = "";
          message.componentInstance.details = err.toString();
          message.result.then(() => {});         
        }

      )
    }

    if (!isEnable){
      this.associatedService.enableContainer(container_address)
      .then(
        result => {                          
          if (result == "OK"){             
            this.associatedService.getContainerTable();   
          }
          else{
            const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = "";
            message.componentInstance.details = "No tiene permisos para habilitar el contenedor seleccionado. Solo la cuenta del asociado puede modificar el estado de los contenedore";
            message.result.then(() => {}); 
          }
        },
        err => {
          console.log(err);
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
          message.componentInstance.type = 'Error';
          message.componentInstance.body = "";
          message.componentInstance.details = err.toString();
          message.result.then(() => {});
        }

      )
    }

  }

  public addContainer(){                  
    const modalRef = this.modalService.open(AddContainerComponent,{ size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.mode = "add";    
    modalRef.componentInstance.container = {};    
    modalRef.result.then((result) => {       
      if (result == 'OK'){           
        this.associatedService.getAssociatedInfo();
        this.associatedService.getContainerTable();        
        this.selectedRow = -1;   
      }
    }).catch((error) =>{      
    });     
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

  open(index, container) {
    const modalRef = this.modalService.open(ContainerComponent,{ size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.nameRef = container.nameRef;
    modalRef.result.then((result) => {       
      if (result == 'OK'){           
        this.associatedService.getAssociatedInfo();
        this.associatedService.getContainerTable();        
        this.selectedRow = -1;   
      }
    }).catch((error) =>{      
    });      
  }

  exchangeDicount(){
    const modalRef = this.modalService.open(DiscountComponent,{ size: 'sm', backdrop: 'static'});    
    modalRef.result.then((result) => {       
      if (result == 'OK'){           
        this.associatedService.getAssociatedInfo();
        this.associatedService.getContainerTable();        
        this.selectedRow = -1;   
      }
    }).catch((error) =>{      
    });
  }

  clearPoints(){
    const modalRef = this.modalService.open(ClearComponent,{ size: 'sm', backdrop: 'static'});  
    modalRef.componentInstance.exchangedPoints = this.associatedService.associatedInfo._exchangedPoints;      
    modalRef.componentInstance.clearedPoints = this.associatedService.associatedInfo._clearedPoints;      
    modalRef.result.then((result) => {       
      if (result == 'OK'){           
        this.associatedService.getAssociatedInfo();
        this.associatedService.getContainerTable();        
        this.selectedRow = -1;   
      }
    }).catch((error) =>{      
    });
  }

  main(){
    this.router.navigate(['main']);
  }

  select(index, container) {                
    if (this.selectedRow == index){
      this.selectedRow = -1;      
    }
    else{
      this.selectedRow = index;
      this.container_selected = container;
    }    
  }
}