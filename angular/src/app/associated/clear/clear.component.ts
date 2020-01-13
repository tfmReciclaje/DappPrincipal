import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { MessageComponent } from '../../common/message/message.component';

import { AssociatedService } from '../../services/associated.service';

@Component({
  selector: 'app-clear',
  templateUrl: './clear.component.html',
  styleUrls: ['./clear.component.css']
})
export class ClearComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public activeModal: NgbActiveModal,
    public associatedService: AssociatedService ) { }    
          
  @Input() exchangedPoints: number;
  @Input() clearedPoints: number;
  amount: number;  

  done: boolean = false;

  ngOnInit() {      
  }

  clear(){
    this.associatedService.clearPoints(this.amount)
    .then(
      response => {          
        if (response == "OK"){                       
          this.associatedService.getAssociatedInfo().then((associatedInfo) =>{            
            this.exchangedPoints = associatedInfo.exchangedPoints;
            this.clearedPoints = associatedInfo.clearedPoints;
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
        console.log(err)    
        const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
        message.componentInstance.type = 'Error';
        message.componentInstance.body = "";
        message.componentInstance.details = err.toString();
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
