import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { MessageComponent } from '../../common/message/message.component';

import { AssociatedService } from '../../services/associated.service';
import { LoadingService } from '../../services/loading.service';
import { LoadingComponent } from '../../common/loading/loading.component';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.css']
})
export class DiscountComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public activeModal: NgbActiveModal,    
    public loadingService: LoadingService,           
    public associatedService: AssociatedService ) { }    
          
  userBalance: Number;
  checked: boolean = false;
  done: boolean = false;

  userName: string;
  secretWord: string;

  amount: number;

  ngOnInit() {      
  }

  checkUserName(){
    this.associatedService.getUserBalance(this.userName)
    .then((userBalance) =>{
      this.userBalance = userBalance;         
        if (userBalance > 0){                       
            this.checked = true;
        }
        else{                    
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
          message.componentInstance.type = 'Warning';
          message.componentInstance.body = "";
          message.componentInstance.details = "El usuario no está registrado";
          message.result.then(() => {
            this.checked = false;
          }); 

        }
      },
      err => {
        const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
        message.componentInstance.type = 'Error';
        message.componentInstance.body = "";
        message.componentInstance.details = JSON.stringify(err);
        message.result.then(() => {});
        this.activeModal.close('KO');      
      }
    )
  }  
 
  discount(){
    this.loadingService.loading = true;
    this.associatedService.exchangePoints(this.userName, this.secretWord, this.amount)
    .then(
      response => {         
        this.loadingService.loading = false; 
        if (response == "OK"){                       
          this.associatedService.getUserBalance(this.userName).then((userBalance) =>{            
            this.userBalance = userBalance;
            this.done = true;
          })          
        }
        else{                    
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = "";
            message.componentInstance.details = response;
            message.result.then(() => {            
          });                    
        }
      },
      err => {
        this.loadingService.loading = false; 
        console.log(err)    
        const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
        message.componentInstance.type = 'Error';
        message.componentInstance.body = "";
        message.componentInstance.details = JSON.stringify(err);
        message.result.then(() => {});                    
      }
    )
  }  

  closeModal() {
    this.activeModal.close('OK');
  } 

  close() {
    this.activeModal.close('OK');
  } 

}
