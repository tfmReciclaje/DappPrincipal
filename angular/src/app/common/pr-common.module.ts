import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { MessageComponent } from './message/message.component';



@NgModule({
  declarations: [    
    MessageComponent,   
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [    
    MessageComponent    
  ],
  entryComponents: [    
    MessageComponent    
  ],
})
export class PrCommonModule { }
