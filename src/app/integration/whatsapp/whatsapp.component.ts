import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IntegrationService } from '../integration.service';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';
import { error } from 'console';

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  providers: [MessageService],
  styleUrls: ['./whatsapp.component.scss']
})
export class WhatsappComponent implements OnInit {
  loading: boolean = false;
  whatappForm: FormGroup;
  submitted: boolean;
  constructor(   private formBuilder: FormBuilder,
    private integrationService: IntegrationService,
    private messageService: MessageService) { }

  ngOnInit(): void {
   
    this.submitted = false;

    this.whatappForm = this.formBuilder.group({
      businessName: ['', Validators.required],
      accessToken: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    });
  }


  get whatappControl(): any {
    return this.whatappForm.controls;
  }

  onSubmit(): void {
   
    if (this.whatappForm.invalid) {
      this.submitted = true;
      console.log("inside the invalid");
      Swal.fire({
        title: 'Mandatory fields missing !!!',
        text: 'Please fill in all the required fields.',
        icon: 'warning',
      });
      return;
    }
    var req = {
      to: this.whatappForm.value.phoneNumber,
      message: 'Hello',
    };
    this.loading = true;
    this.integrationService.insertWhatsapp(this.whatappForm.value).subscribe(
      
      (res:any)=>{ 
        this.messageService.add({ severity: 'success', summary: 'Data saved Successfully' });
        this.loading = false;
      },
      (error:any) => {
        this.messageService.add({ severity: 'error', summary: error.message  });
        this.loading = false;
      }
    )

    this.integrationService.sendWhatsapp(req).subscribe(
      (response: any) => {
        this.messageService.add({ severity: 'success', summary: 'Message Sent Successfully' });
        window.location.reload();
        this.loading = false;
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Failed to Send Message' });
        this.loading = false;
      }
    );
  }

}
