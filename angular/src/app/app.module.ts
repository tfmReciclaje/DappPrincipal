import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app/app.component';
import { AddressComponent } from './address/address.component';

import { MainModule } from './main/main.module';
import { AssociatedModule } from './associated/associated.module';
import { PrCommonModule } from './common/pr-common.module';

import { UtilModule } from './services/services.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
    AppComponent,
    AddressComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatSnackBarModule,
    AppRoutingModule,    
    FormsModule,
    MainModule,
    AssociatedModule,
    ReactiveFormsModule,
    UtilModule,
    PrCommonModule    
  ], 
  entryComponents: [    
    AddressComponent    
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
