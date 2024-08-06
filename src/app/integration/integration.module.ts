import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailComponent } from './email/email.component';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { OnboardingService } from '../onboarding/onboarding.service';



@NgModule({
  declarations: [
    WhatsappComponent,
    EmailComponent,
    // ReactiveFormsModule
  ],
  imports: [
    CommonModule
  ],
  providers: [MessageService,OnboardingService],
})
export class IntegrationModule { }
