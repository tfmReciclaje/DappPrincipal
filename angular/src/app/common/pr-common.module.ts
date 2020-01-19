import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { MessageComponent } from './message/message.component';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
  declarations: [    
    MessageComponent, 
    LoadingComponent  
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [    
    MessageComponent,
    LoadingComponent   
  ],
  entryComponents: [    
    MessageComponent    
  ],
})
export class PrCommonModule { }
