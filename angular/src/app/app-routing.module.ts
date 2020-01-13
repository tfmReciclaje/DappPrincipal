import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main/main/main.component';
import { AssociatedComponent } from './associated/associated/associated.component';


const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'associated', component: AssociatedComponent },
  { path: '', redirectTo: 'main', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
