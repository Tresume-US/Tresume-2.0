import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ViewDetailsService } from './view-details.service';
import { MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';
import { Directive, HostListener } from '@angular/core';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss'],
  providers: [CookieService, ViewDetailsService, MessageService],
})

// @Directive({
//   selector: '[appHourInput]'
// })
export class ViewDetailsComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  loading: boolean = false;
  isAdmin: boolean = true;
  OrgID: string = '';
  TraineeID: string = '';
  timesheetrole: any;
  rowdata: any[] = [];
  noResultsFound: boolean = false;
  comments: any;
  idFromUrl: any;
  idFromCookie: any;
  document: any;
  row: any;
  commentContainer: any;
  username: any = '';

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const targetElement = event.target as HTMLElement;

    // Check if the target element is an input with type "number"
    const allowedInputIds = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7']; // Specify the IDs you want to allow
    if (
      targetElement.tagName === 'INPUT' &&
      (targetElement as HTMLInputElement).type === 'text' &&
      allowedInputIds.includes(targetElement.id)
    ) {
      if (
        [46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
        (event.keyCode === 65 && (event.ctrlKey || event.metaKey)) ||
        (event.keyCode >= 35 && event.keyCode <= 40)
      ) {
        return;
      }

      if (
        (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) &&
        (event.keyCode < 96 || event.keyCode > 105)
      ) {
        event.preventDefault();
      }

      const input = (event.target as HTMLInputElement).value + event.key;
      if (parseInt(input, 10) > 24) {
        event.preventDefault();
      }
    }
  }



  constructor(private cdr: ChangeDetectorRef, private router: Router, private cookieService: CookieService, private service: ViewDetailsService, private messageService: MessageService, private route: ActivatedRoute, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');

    this.username = this.cookieService.get('userName1'); 





    this.route.paramMap.subscribe(params => {
      this.idFromUrl = params.get('id');
    });

    this.fetchResult();
  }

  fetchResult() {

    let Req = {
      traineeID: this.TraineeID,
      timesheetrole: this.timesheetrole,
      tid: this.idFromUrl
    };
    this.service.Candidateviewdetails(Req).subscribe((x: any) => {
      this.rowdata = x.result;
      this.document = this.rowdata[0].clientapproved;
      this.rowdata[0].username = this.username;
      // this.noResultsFound = this.rowdata.length === 0;
    });
    this.loading = false;
  }


  reject() {
    if (!this.comments) {
      alert('Please fill in comments before Rejecting.');
      return;
    }

    let Req = {
      traineeID: this.TraineeID,
      id: this.idFromUrl,
      comments: this.comments,
    };
    this.service.UpdateRejectStatus(Req).subscribe((x: any) => {
      this.rowdata = x.result;

      this.messageService.add({ severity: 'success', summary: 'Rejected' });

      setTimeout(() => {
        this.router.navigate(['/alltimelist']);
      }, 3000);
    }, error => {

    });
  }

  Accept() {
    if (!this.comments) {
      alert('Please fill in comments before Approving.');
      return;
    }

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
  // Accept() {

  //   // this.rowdata.forEach(row => {
  //   //   if (row.admincomment === undefined) {
  //   //     row.admincomment = ''; 
  //   //   }
  //   // });

  //   let requests = this.rowdata.map(row => ({
  //     traineeID: row.TraineeID, 
  //     comments: row.admincomment, 
  //     id: this.idFromUrl, 
  //   }));

  //   this.service.UpdateAcceptStatus(requests).subscribe((x: any) => {
  //     this.rowdata = x.result; 
  //     this.messageService.add({ severity: 'success', summary: 'Approved' });

  //     setTimeout(() => {
  //       this.router.navigate(['/alltimelist']);
  //     }, 3000);
  //   }, error => {

  //   });
  // }


  uploadFile() {
    this.renderer.selectRootElement('#fileInput').click();
  }

  handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
  }


  editableRowIndex: number | null = null;


  startEditingRow(index: number) {
    // this.editableRowIndex = index;

    const row = this.rowdata[index];
    if (row.status === 1) {
      this.editableRowIndex = index;
    }
  }

  // saveChanges() {
  //  console.log('Values Updated')
  //   this.editableRowIndex = null; 
  // }


  cancelEditing() {
    this.editableRowIndex = null;

  }


  isRowEditable(index: number): boolean {
    return this.editableRowIndex === index;
  }

  areButtonsDisabled(): boolean {
    return this.editableRowIndex !== null;
  }

  saveChanges() {

    this.rowdata.forEach(row => {
      const dayValues = [
        parseFloat(row.day1) || 0,
        parseFloat(row.day2) || 0,
        parseFloat(row.day3) || 0,
        parseFloat(row.day4) || 0,
        parseFloat(row.day5) || 0,
        parseFloat(row.day6) || 0,
        parseFloat(row.day7) || 0
      ];

      // Calculate total hours and minutes
      let totalHours = 0;
      let totalMinutes = 0;
      dayValues.forEach(value => {
        const roundedValue = parseFloat(value.toFixed(2)); // Round the value to two decimal places
        totalHours += Math.floor(roundedValue);
        totalMinutes += Math.round((roundedValue % 1) * 60);
      });

      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes %= 60;

      row.totalhrs = totalHours + (totalMinutes / 100);

      if (!isNaN(row.totalhrs) && !isNaN(row.billableamt)) {
        row.totalamt = row.billableamt * row.totalhrs;
      } else {
        row.totalamt = 0;
      }

      console.log(`Row ID: ${row.id}, Total Hours: ${row.totalhrs.toFixed(2)}, Total Amount: ${row.totalamt.toFixed(2)}`);
    });

    let Req = {
      traineeID: this.TraineeID,
      comments: this.comments,
      id: this.idFromUrl,
      username: this.username,
      rowdata: this.rowdata  


    };

    this.service.updatetimesheet(Req).subscribe((response: any) => {
      console.log('Values Updated:', response);
      this.messageService.add({ severity: 'success', summary: 'Updated' });
      this.editableRowIndex = null;
    }, error => {
      console.error('Error updating values:', error);

    });

    this.editableRowIndex = null;

    console.log(this.rowdata);
  }

}







