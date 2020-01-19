import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { MessageComponent } from '../../common/message/message.component';
import { LoadingComponent } from '../../common/loading/loading.component';

import { AssociatedService } from '../../services/associated.service';
import { LoadingService } from '../../services/loading.service';


@Component({
  selector: 'app-clear',
  templateUrl: './clear.component.html',
  styleUrls: ['./clear.component.css']
})
export class ClearComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public activeModal: NgbActiveModal,
    public loadingService: LoadingService,           
    public associatedService: AssociatedService ) { }    
          
  @Input() exchangedPoints: number;
  @Input() clearedPoints: number;
  amount: number;  

  done: boolean = false;

  ngOnInit() {      
  }

  clear(){
    this.loadingService.loading = true;
    this.associatedService.clearPoints(this.amount)
    .then(
      response => {          
        this.loadingService.loading = false;
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
