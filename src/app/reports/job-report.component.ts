import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DashboardService, RequestItem } from '../dashboard/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { formatDate } from '@angular/common';


interface IRange {
    value: Date[];
    label: string;
  }
@Component({
    selector: 'app-reports',
    templateUrl: './job-report.component.html',
    providers: [DashboardService,CookieService]

})

export class jobReportComponent implements OnInit {
    OrgID: any;
    public startDate: any;
    public endDate: any;
    public traineeId: any;
    recruiter: any[] = []; 
    rowData: any;
    submissionlist: any;
    placementlist: any;
    interviewlist: any;
  loading: boolean;
  name = new FormControl('');
  filterForm = new FormGroup({
    dates: new FormControl('', Validators.required),
    recruiter: new FormControl('', Validators.required),
    candidateStatus: new FormControl('')
  });
  router: any;

    ngOnInit(): void {
      this.filterForm.controls['dates'].setValue([this.ranges[1].value[0], this.ranges[1].value[1]])
      this.filterForm.controls['recruiter'].setValue('All')
      this.filterForm.controls['candidateStatus'].setValue('8')
      this.getjobreport(this.startDate, this.endDate);
      this.getAllRecruiters();
      this.filterForm = this.fb.group({
        dates: [''],
        recruiter: ['']
      });
        
    }
    form: FormGroup;
    public ranges: IRange[] = [{
        value: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
        label: 'Last 7 Days'
      }, {
        value: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
        label: 'Last 30 Days'
      }, {
        value: [new Date(new Date().setDate(new Date().getDate() - 90)), new Date()],
        label: 'Last 90 Days'
      }
    ];
    constructor(private fb: FormBuilder, private service: DashboardService) {
        this.form = this.fb.group({
            dates: [''] // formControlName should match here
        });
        this.traineeId = sessionStorage.getItem("TraineeID");
    this.startDate = this.dateFormatter(this.ranges[1].value[0]);
    this.endDate = this.dateFormatter(this.ranges[1].value[1]);
    }

    // Example method to subtract days from a date
    private subtractDay(date: Date, daysToSubtract: number = 1): Date {
        const result = new Date(date);
        result.setDate(result.getDate() - daysToSubtract);
        return result;
    }

  
    public getjobreport(startDate?: string, endDate?: string) {
        let recruiterId = this.filterForm.get('recruiter')?.value
        let requestItem: any = {
          fromDate: startDate,
          toDate: endDate,
          recruiterId: recruiterId,
          orgID:this.OrgID
        }
        this.service.getjobreport(requestItem).subscribe((x: any) => {
            let response = x;
            
            if (response) {
              this.rowData = response;
              this.submissionlist = response.submissionlist
              this.placementlist = response.placementlist
              this.interviewlist = response.interviewlist
              console.log(this.submissionlist);
              this.sizeToFit();
            }
          });
}
    sizeToFit() {
        throw new Error('Method not implemented.');
    }
    
  public onFilter() {
    this.getjobreport(this.startDate, this.endDate);
  }


  
  public getAllRecruiters() {
    this.service.getAllRecruiters(this.traineeId).subscribe(x => {
      let response = x.result;
      if (response) {
        this.recruiter = response;
        console.log(response);
      }
    this.loading = false;

    });
  }
  public onSubmit() {
    console.warn(this.filterForm.value);
  }

  public onValueChange(value: any) {
    this.startDate = this.dateFormatter(value[0]);
    this.endDate = this.dateFormatter(value[1]);
  }
  public dateFormatter(value: any) {
    let formattedDate = formatDate(value, 'yyyy-MM-dd', "en-US");
    return formattedDate;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}