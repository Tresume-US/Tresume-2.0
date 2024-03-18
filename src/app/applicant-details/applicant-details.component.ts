import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ApplicantDetailsService } from './applicant-details.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-applicant-details',
  templateUrl: './applicant-details.component.html',
  providers: [CookieService, ApplicantDetailsService, MessageService],
  styleUrls: ['./applicant-details.component.scss']
})
export class ApplicantDetailsComponent{
  
  loading: boolean = false;
  applicants: any[] = [];
  displayedApplications: number = this.applicants.length;
  totalApplications: number = this.applicants.length;
  noResultsFound: boolean = false;
  TraineeID: string = '';
  authType: any;
  OrgID:string = '';
  JobID:any;
  isAdmin: string;
  JobApplicationID:string;
  Status: string;
  currentResumeID: any;
  resumeHTMLContent: any;
  visibleSidebar2: boolean;

  constructor(
    private cookieService: CookieService,
    private service: ApplicantDetailsService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.JobID = this.route.snapshot.params["jobID"];
  }

  ngOnInit(): void {
    this.loading = true;
    this.TraineeID = this.cookieService.get('TraineeID');
    this.OrgID = this.cookieService.get('OrgID');
    this.isAdmin = this.cookieService.get('IsAdmin');
    this.fetchjobapplicants();
  }

  performSearch(searchTerm: string) {
    this.applicants = this.applicants.filter(applicant =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.displayedApplications = this.applicants.length;
  }

  fetchjobapplicants() {
    let Req = {
      TraineeID: this.TraineeID,
      OrgID:this.OrgID,
      JobID:this.JobID,
      isAdmin:this.isAdmin,   
    };
    this.service.getjobapplicants(Req).subscribe((x: any) => {
      this.loading = false;
      this.applicants = x.result;
      console.log(this.applicants);
      // this.noResultsFound = this.applicants.length === 0;
    });
  }
 
  acceptApplication(TraineeID: number) {
    let Req = {
      TraineeID: TraineeID,
      OrgID: this.OrgID,
      JobID: this.JobID,
    };
  
    this.service.acceptApplication(Req).subscribe((x: any) => {
      this.Status = x.result;
      console.log(this.Status);
      this.fetchjobapplicants();
    });    
  }
  
  rejectApplication(TraineeID: number) {
    let Req = {
      TraineeID: TraineeID,
      OrgID: this.OrgID,
      JobID: this.JobID,
    };
    this.service.rejectApplication(Req).subscribe((x: any) => {
      this.Status = x.result;
      console.log(this.Status);
      this.fetchjobapplicants();
    });
    
  }
  
  downloadDocument(documentUrl: string) {
    window.open(documentUrl, '_blank');
  }

  public downloadAsPdf() {
    let req = {
        userName: this.currentResumeID
    }
    this.service.getResumePath(req).subscribe((x: any) => {
        console.log('x', x)
        FileSaver.saveAs("https://tresume.us/" + x[0].ResumePath, x[0].ResumeName);
    });
}

private download(TraineeID: any) {
  console.log('TraineeID', TraineeID)
  if (TraineeID) {
      let req = {
          traineeID: TraineeID
      }
      this.currentResumeID = TraineeID.UserName;
      this.service.getResumeDetails(req).subscribe((x: any) => {
          if (x[0].HtmlResume) {
              this.resumeHTMLContent = x[0].HtmlResume;
          }
          else {
              this.resumeHTMLContent = "No Resume found"
          }
          //this.modalRef = this.modalService.show();
          //this.lgModal?.show()
          this.visibleSidebar2 = true;
      });
  }
}

}
