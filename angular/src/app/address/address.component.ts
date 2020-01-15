import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';

import { MainService } from '../services/main.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent implements OnInit {

  constructor(public modalService: NgbModal, 
    public activeModal: NgbActiveModal,
    public mainService: MainService) { }    
        
  addressForm: FormGroup;

  contract_address: any

  ngOnInit() {  
      
    this.addressForm = new FormGroup(
      {
        address: new FormControl(this.mainService.getContractAddress())}
    )
  }
 
  update(){
    this.mainService.updateContractAddress(this.addressForm.get("address").value);    
    this.closeModal();
  }  

  closeModal() {
    this.activeModal.close('KO');
  }   
}
