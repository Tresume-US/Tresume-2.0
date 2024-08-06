import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IntegrationService } from '../integration.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  providers: [MessageService,CookieService,OnboardingService],
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {

  emailForm:FormGroup;
  loading:boolean = false;
  submitted: boolean;
  orgID:any;
  constructor(
    private formbuilder:FormBuilder,
    private integrationService:IntegrationService,
    private onboardingService:OnboardingService,
    private messageService:MessageService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.orgID = this.cookieService.get('OrgID')
    this.submitted = false;

    this.emailForm = this.formbuilder.group({
      user:[''],
      password:[''],
      smtphost:['',Validators.required],
      smtpport:['',Validators.required],
      orgid:[this.orgID]
    })

  }

  onSubmit(): void { 
    if(this.emailForm.invalid) {
      this.submitted = true;
      Swal.fire({
        title: 'Mandatory fields missing !!!',
        text: 'Please fill in all the required fields.',
        icon: 'warning',
      });
      return;
    }
    this.loading = true;
    this.integrationService.insertEmail(this.emailForm.value).subscribe(
      (res:any)=>{ 
        this.messageService.add({ severity: 'success', summary: 'Data saved Successfully' });
        this.loading = false;
      },
      (error:any) => {
        this.messageService.add({ severity: 'error', summary: error.message  });
        this.loading = false;
      }
    )

    // const emailTemplate = `
    // <!DOCTYPE html>
    // <html>
    // <head>
    //     <title>Offer Letter</title>
    // </head>
    // <body>
    //     <h1>Hello, </h1>
    //     <p>Welcome to our service! We are glad to have you</p>
    // </body>
    // </html>
    // `;

    const req = {
      // to: 'recipient@example.com',
      subject: ' Test Email',
      // template: emailTemplate,
      // data: {
      //     name: 'John Doe',
      //     position: 'Software Engineer',
      //     startDate: '2024-08-01'
      // }
    };

    this.integrationService.sendEmail(this.emailForm.value).subscribe(
      (response: any) => {
        this.messageService.add({ severity: 'success', summary: 'Email Sent Successfully' });
        window.location.reload();
        this.loading = false;
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Failed to Send mail' });
        this.loading = false;
      }
    );
  }

}
