import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MainComponent } from './main/main.component';
import { AddAssociatedComponent } from './add-associated/add-associated.component';
import { PrCommonModule } from '../common/pr-common.module';


@NgModule({
  declarations: [
    MainComponent,    
    AddAssociatedComponent    
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,    
    NgbModule,
    PrCommonModule  
  ],  
  entryComponents: [    
    AddAssociatedComponent    
  ],
  exports: [
    MainComponent
  ]  
})
export class MainModule { }
