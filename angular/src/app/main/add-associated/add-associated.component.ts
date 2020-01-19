import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';

import { MessageComponent } from '../../common/message/message.component';
import { MainService } from '../../services/main.service';
import { LoadingService } from '../../services/loading.service';

declare let require: any;
const associatedList = require('../../../assets/associatedList.json');

@Component({
  selector: 'app-add-associated',
  templateUrl: './add-associated.component.html',
  styleUrls: ['./add-associated.component.css']
})
export class AddAssociatedComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public activeModal: NgbActiveModal,
    public loadingService: LoadingService,           
    public mainService: MainService) { }    
      
  @Input() public associated: any;
  @Input() public mode: string;

  associated_list = associatedList;

  addAssociated: FormGroup;

  ngOnInit() {  
    this.addAssociated = new FormGroup(
      {
        contract_address: new FormControl(''),
        name: new FormControl(''),        
      }
    )
  }
 
  add(){
    this.loadingService.loading = true;
    this.mainService.AddAssociated(this.associated.name, this.associated.address)
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
            console.log("typeof: " + typeof(result))
            console.log(result.revert)
            if (result.toString().includes("Pausable: paused")){
              message.componentInstance.details = "No se puede añadir un nuevo asociado. El contrato está en modo Pausa";  
            }
            else{
              message.componentInstance.details = JSON.stringify(result);
            }   
            message.result.then(() => {});          
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
