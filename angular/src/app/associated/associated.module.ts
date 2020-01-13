import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AssociatedComponent } from './associated/associated.component';
import { AddContainerComponent } from './add-container/add-container.component';
import { ContainerComponent } from './container/container.component';
import { DiscountComponent } from './discount/discount.component';
import { ClearComponent } from './clear/clear.component';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule,
  MatSnackBarModule
} from '@angular/material';

@NgModule({
  declarations: [
    AssociatedComponent,    
    AddContainerComponent,
    ContainerComponent,
    DiscountComponent,
    ClearComponent  
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,    
    NgbModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatSnackBarModule,
  ],  
  entryComponents: [    
    AddContainerComponent,
    ContainerComponent,
    DiscountComponent,
    ClearComponent   
  ],
  exports: [
    AssociatedComponent
  ]  
})
export class AssociatedModule { }
