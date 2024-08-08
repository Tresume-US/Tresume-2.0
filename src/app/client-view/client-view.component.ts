import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClientViewService } from './client-view.service'
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';
import { concatAll } from 'rxjs/operators';

@Component({
  selector: 'app-client-view',
  templateUrl: './client-view.component.html',
  styleUrls: ['./client-view.component.scss'],
  providers: [CookieService, ClientViewService, MessageService, DatePipe],
})
export class ClientViewComponent implements OnInit {
  // ViewChild('exampleModal') exampleModal: ElementRef;
  clients: any[];
  routeType: any[];
  ClientID: any[];
  TraineeID: string = '';
  OrgID: string = '';
  deleteIndex: any;
  IsAdmin: string;
  jobs: any[];
  noResultsFound: boolean = true;
  loading: boolean = false;
  ClientDetails: any[];
  additionalAmount: any = 0
  totalReceivedAmount: any = 0;
  showConfirmationDialog: boolean = false;
  totalPendingAmount: any = 0;
  usertype: string;
  selectedJobTitle: string;
  selectedJobID: string;
  selectedJobDescription: string;
  recipientEmail: any;
  constructor(private router: Router, private route: ActivatedRoute, private cookieService: CookieService, private messageService: MessageService, private service: ClientViewService, private datePipe: DatePipe) {

    this.TraineeID = this.cookieService.get('TraineeID');
    this.OrgID = this.cookieService.get('OrgID');
    this.ClientID = this.route.snapshot.params['ClientID'];
  }


  ngOnInit(): void {
    this.loading = true;
    this.usertype = this.cookieService.get('usertype');
    this.ClientViewDetails();

    this.fetchjobpostinglist();
  }


  fetchjobpostinglist() {
    let Req = {
      OrgID: this.OrgID,
      ClientID:this.ClientID,
      IsAdmin:this.IsAdmin
    };
    this.service.getJobPostingList(Req).subscribe((x: any) => {
      this.jobs = x.result;
      this.noResultsFound = this.jobs.length === 0;
      this.loading = false;

    }),
      (error: any) => {
        // Error callback
        console.error('Error occurred:', error);
        // Handle error here
        this.loading = false; // Set loading to false on error
      };
  }

  ClientViewDetails() {
    let Req = {
      TraineeID: this.TraineeID,
      ClientID: this.ClientID,
      OrgID: this.OrgID,
    };
    this.loading = true;
    this.service.getClientDetailsList(Req).subscribe((x: any) => {
      this.ClientDetails = x.result;
      this.noResultsFound = this.ClientDetails.length === 0;
      this.loading = false;
    }),
      (error: any) => {
        console.error('Error occurred:', error);
        this.loading = false;
      };
  }

  deletejobdata(JobID:any){
    this.deleteIndex = JobID;
    this.showConfirmationDialog = true;

  }
  deleteJobPosting(JobID:any) {
    var req = {
      JobID:this.deleteIndex,
    }
    this.service.deleteJobPost(req).subscribe((x: any) => {
      this.messageService.add({ severity: 'success', summary: 'Removed Job' });
      this.fetchjobpostinglist();
      this.showConfirmationDialog = false;

    }),
    (error: any) => {
      console.error('Error occurred:', error);
      this.loading = false;
    };
  }

 
  private handleSuccess(response: any): void {
    this.messageService.add({ severity: 'success', summary: response.message });
    console.log(response);
    this.loading = false;
  }

  private handleError(error: any): void {
    let errorMessage = 'An error occurred';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    this.messageService.add({ severity: 'error', summary: errorMessage });
    console.error('Error occurred:', error);
    this.loading = false;
  }

  openEmailModal(jobTitle: string, jobID: string,JobDescription: string) {
    this.selectedJobTitle = jobTitle;
    this.selectedJobID = jobID;
    this.selectedJobDescription= JobDescription;
    console.log(jobTitle,jobID,JobDescription)
  }

  
  sendEmail() {
    const req = {
      to: this.recipientEmail,
      subject: `Job Details: ${this.selectedJobTitle} -${this.selectedJobID}`,
      content: `Job Description: ${this.selectedJobDescription}`
    };
  console.log(req)
    this.loading = true;

    this.service.JdEmailSent(req).subscribe(
      (response: any) => {
        this.loading = false;
        if(response.flag === 1) {
          this.messageService.add({ severity: 'success', summary: 'Mail Sent Successfully' });
      this.loading = false;
        } else {
          alert('Failed to send email');
        }
      },
      (error: any) => {
        this.loading = false;
        console.error('Error occurred:', error);
      }
    );
  }
 }
