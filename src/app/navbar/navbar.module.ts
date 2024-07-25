import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { NavigationService } from './navbar.service';

@NgModule({
    imports: [
        CommonModule, RouterModule
    ],
    declarations: [NavbarComponent],
    exports: [NavbarComponent],
    providers: [NavigationService]
})
export class NavigationModule {

    
 }