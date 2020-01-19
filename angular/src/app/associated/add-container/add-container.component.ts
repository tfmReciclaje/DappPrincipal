import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';

import { MessageComponent } from '../../common/message/message.component';

import { AssociatedService } from '../../services/associated.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-add-container',
  templateUrl: './add-container.component.html',
  styleUrls: ['./add-container.component.css']
})
export class AddContainerComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public activeModal: NgbActiveModal,    
    public loadingService: LoadingService,    
    public associatedService: AssociatedService) { }    
      
  @Input() public container: any;
  @Input() public mode: string;

  addContainer: FormGroup;

  ngOnInit() {  
    
    this.addContainer = new FormGroup(
      {
        container_address: new FormControl(''),
        ref: new FormControl(''),        
      }
    )
  }
 
  add(){
    this.loadingService.loading = true;
    this.associatedService.AddContainer(this.container.ref, this.container.address)
    .then(            
      result => {                          
        this.loadingService.loading = false;
        if (result == "OK"){                                
          this.activeModal.close('OK');          
        }
        else{

            const message = this.modalService.open(MessageComponent, { size: 'sm', backdrop: 'static'});                          
            message.componentInstance.type = 'Warning';
            message.componentInstance.body = "";
            if (result.toString().includes("Pausable: paused")){
              message.componentInstance.details = "No se ha podido añadir el contenedor. El contrato está en modo Pausa";
            }
            else{
              message.componentInstance.details = "Error: " + JSON.stringify(result);
            } 
            this.activeModal.close('KO');          
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
        this.activeModal.close('KO');        
      }
    )
  }  

  closeModal() {
    this.activeModal.close('KO');
  }   
}
