import { Component, OnInit } from '@angular/core';
import { IntegrationService } from '../integration.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bee-lines',
  templateUrl: './bee-lines.component.html',
  styleUrls: ['./bee-lines.component.scss']
})
export class BeeLinesComponent implements OnInit {

  beelineForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private Service:IntegrationService
  ) {
    this.beelineForm = this.fb.group({
      apiKey: ['', [Validators.required]],
      secretKey: ['', [Validators.required]]
    });
  }
  ngOnInit(): void {
  }

  onSubmit() {
    if (this.beelineForm.valid) {
      // const { apiKey, secretKey } = this.mailChimpForm.value;
      // console.log('API Key:', apiKey);
      // console.log('Secret Key:', secretKey);
      this.Service.addMailChimp(this.beelineForm.value).subscribe((x: any) => {
        console.log(x)
        // this.city = x.result;
        // console.log(this.selectedstate);
      });
      // const { apiKey, secretKey } = this.mailChimpForm.value;
      // this.http.post('http://localhost:3000/api/mailchimp', { apiKey, secretKey })
      //   .subscribe(response => {
      //     console.log('Response:', response);
      //     // Add your logic to handle the response
      //   }, error => {
      //     console.error('Error:', error);
      //     // Add your logic to handle the error
      //   });
    }
      // Add your logic to handle the API key and Secret key
    }
  }