import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ViewDetailsService } from './view-details.service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss'],
  providers: [CookieService,ViewDetailsService,MessageService],
})
export class ViewDetailsComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  loading:boolean = false;
  isAdmin: boolean = true;
  OrgID:string = '';
  TraineeID:string = '';
  timesheetrole: any;
  rowdata: any [] = [];
  noResultsFound: boolean = false;
  comments: any;
  idFromUrl: any;
  idFromCookie: any;
  document: any;
  row: any;
  commentContainer: any;
  // isValidComment(): boolean {
  //   // Check if any row's comment is invalid
  //   for (let row of this.rowdata) {
  //     if (!row.admincomment) {
  //       return false; // Return false if any comment is empty
  //     }
  //   }
  //   return true; // Return true if all comments are valid
  // }

  // approves() {
  //   if (!this.isValidComment()) {
  //     this.showAlert('Please fill the comment field');
  //   } else {
  //     // Your approve logic here
  //   }
  // }

  // rejects() {
  //   if (!this.isValidComment()) {
  //     this.showAlert('Please fill the comment field');
  //   } else {
  //     // Your reject logic here
  //   }
  // }

  // showAlert(message: string) {
  //   alert(message);
    
  //   // Scroll to the comment container to bring it into view
  //   this.commentContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
  // }
  constructor(private router: Router,private cookieService: CookieService,private service: ViewDetailsService,private messageService: MessageService, private route: ActivatedRoute,private renderer: Renderer2) { }

  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');

    this.route.paramMap.subscribe(params => {
      this.idFromUrl = params.get('id');
    });

    this.fetchResult();
  }

  fetchResult(){
    let Req = {
      traineeID: this.TraineeID,
      timesheetrole:this.timesheetrole,
      tid : this.idFromUrl
    };
    this.service.Candidateviewdetails(Req).subscribe((x: any) => {
      this.rowdata = x.result;
      this.document = this.rowdata[0].clientapproved;
      // this.noResultsFound = this.rowdata.length === 0;
    });
    this.loading = false;
  }

  
  reject(){
    let Req = {
      traineeID: this.TraineeID,
      id:this.idFromUrl,
    };
    this.service.UpdateRejectStatus(Req).subscribe((x: any) => {
      this.rowdata = x.result;

    this.messageService.add({ severity: 'success', summary: 'Rejected'});

    setTimeout(() => {
      this.router.navigate(['/alltimelist']);
    }, 3000); 
  }, error => {

  });
  }

  Accept() {
    let Req = {
      traineeID: this.TraineeID,
      comments: this.comments,
      id: this.idFromUrl,
    };
    this.service.UpdateAcceptStatus(Req).subscribe((x: any) => {
      this.rowdata = x.result;
      this.messageService.add({ severity: 'success', summary: 'Approved' });
  
      setTimeout(() => {
        this.router.navigate(['/alltimelist']);
      }, 3000); 
    }, error => {
    });
  }

  uploadFile() {
    this.renderer.selectRootElement('#fileInput').click();
  }

  handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
  }
}







