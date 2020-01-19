import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { MessageComponent } from '../../common/message/message.component';
import { LoadingComponent } from '../../common/loading/loading.component';

import { AssociatedService } from '../../services/associated.service';
import { Web3Service } from '../../services/web3.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public activeModal: NgbActiveModal,
    public web3Service: Web3Service,
    public loadingService: LoadingService,           
    public associatedService: AssociatedService) { }    
      
  @Input() public nameRef: string;    

  generatedPoints: Number;
  userBalance: Number;
  checked: boolean = false;  
  password: boolean = false;

  userName: string
  secretWord: string

  pack1: number = 0;
  pack2: number = 0;
  pack3: number = 0;

  points: number = 0;

  done: boolean = false;

  ngOnInit() {        
  }

  checkUserName(){
    this.associatedService.getUserBalance(this.userName)
    .then((userBalance) =>{
      this.userBalance = userBalance;         
        this.checked = true;
        if (userBalance > 0){                                   
        }
        else{                    
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
          message.componentInstance.type = 'Info';
          message.componentInstance.body = "";
          message.componentInstance.details = "El usuario no está registrado. Debe de añadir una contraseña para crear un nuevo usuario en el sistema";
          message.result.then(() => {
            this.password = true;
          }); 

        }
      },
      err => {
        console.log(err)      
        const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
        message.componentInstance.type = 'Error';
        message.componentInstance.body = "";
        message.componentInstance.details = JSON.stringify(err);
        message.result.then(() => {}); 
        this.activeModal.close('KO');        
      }
    )
  }  
 
  raisePack1(){
    this.pack1++;
  }

  raisePack2(){
    this.pack2++;
  }

  raisePack3(){
    this.pack3++;
  }

  send(){
    this.loadingService.loading = true;
    this.associatedService.sendItemCollection(this.userName, this.secretWord, this.pack1, this.pack2, this.pack3)
    .then(
      result => {  
        this.loadingService.loading = false;
        if (result > 0){                       
          this.points = result;
          this.associatedService.getUserBalance(this.userName).then((userBalance) =>{            
            this.userBalance = userBalance;            
            this.done = true;
          })          
        }
        else{                    
          const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static', });                          
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = "";
            message.componentInstance.details = result;
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
