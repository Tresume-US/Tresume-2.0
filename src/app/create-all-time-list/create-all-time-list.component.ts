import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateAllTimeListService } from './create-all-time-list.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgZone } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-create-all-time-list',
  templateUrl: './create-all-time-list.component.html',
  providers: [DatePipe, CookieService, CreateAllTimeListService, MessageService],
  styleUrls: ['./create-all-time-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class CreateAllTimeListComponent implements OnInit {
  OrgID: string;
  rows: any[] = [];
  // minDate: string;
  // maxDate: string;
  // maxSelectableDays = 7;
  // maxAllowedDays: number = 7;
  // selectedSunday: string = '';
  // isSundaySelected: boolean = false;
  CAselectedFile: File | null = null;
  SRselectedFile: File | null = null;
  [key: string]: any;
  file1: File | null = null;
  file2: File | null = null;

  
  timesheetRows: any[] = [];
  totalAmountForAllRows: number = 0;
  totalAmount: number = 0;
  updateTotalAmount() {
    setTimeout(() => {
      let totalAmount = 0;
      this.timesheetRows.forEach(row => {
        if (row.billable) {
          totalAmount += +row.totalAmount;
        }
      });
      this.totalAmountForAllRows = totalAmount;
      this.cdr.markForCheck();
    }, 0);
  }


  getDatesWithDaysArray(start: Date, end: Date): { date: Date; day: string }[] {
    const datesWithDaysArray: { date: Date; day: string }[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      datesWithDaysArray.push({
        date: new Date(currentDate),
        day: currentDate.toLocaleDateString('en-US', { weekday: 'short' })
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return datesWithDaysArray;
  }

  onDateRangeChange(dates: Date[]) {
    if (dates.length === 2) {
      const startDate = new Date(dates[0]);
      const endDate = new Date(dates[1]);

      const dayDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

      if (dayDifference >= this.maxSelectableDays) {
        this.selectedDateRange = [];
        console.log('Please select a date range within 7 days.');
      } else {
        this.selectedDateRange = [startDate, endDate];
      }
    }
  }

  addRow() {
    this.timesheetRows.push({
      selectedOption: null,
      detailsDropdown: null,
      dropdownId: 1,
      description: '',
      hourlyRate: 0,
      billable: false,
      file1: null,
      file2: null,
      mon: '',
      tues: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      sun: '',
      totalHours: '',
      totalAmount: '',
    });
  }
  removeRow(index: number) {
    this.timesheetRows.splice(index, 1);
  }

  onFileChange(event: any, fieldName: string, row: any) {
    const fileList: FileList | null = event.target.files;
    if (fileList && fileList.length > 0) {
      row[fieldName] = fileList[0];
    }
  }


  calculateTotalAmount(row: any): number | string {
    const mon = row.mon || 0;
    const tues = row.tues || 0;
    const wed = row.wed || 0;
    const thu = row.thu || 0;
    const fri = row.fri || 0;
    const sat = row.sat || 0;
    const sun = row.sun || 0;
    const totalHours = +mon + +tues + +wed + +thu + +fri + +sat + +sun;

    const hourlyRate = row.billable ? +row.hourlyRate : 0;
    const totalAmount = totalHours * hourlyRate;

    row.totalAmount = isNaN(totalAmount) ? 'N/A' : totalAmount;

    this.updateTotalAmount();
    return row.totalAmount;

  }


  calculateTotalHours(row: any): number | string {
    const mon = row.mon || 0;
    const tues = row.tues || 0;
    const wed = row.wed || 0;
    const thu = row.thu || 0;
    const fri = row.fri || 0;
    const sat = row.sat || 0;
    const sun = row.sun || 0;
    const totalHours = +mon + +tues + +wed + +thu + +fri + +sat + +sun;
   
    row.totalHours = totalHours;
   
    return isNaN(totalHours) ? 'N/A' : totalHours;
    
  }

  addDefaultRows() {
    this.timesheetRows.push({
      projectName:'',
      payItem: '',
      service:'',
      location:'',
      description: '',
      hourlyRate: '',
      billable: false,
      clientAproved: null,
      statusReport: null,
      mon: '',
      tues: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      sun: '',
      totalHours: 0,
      totalAmount: '',
    });
  }


  onFileSelected(event: any, fileIdentifier: string): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this[fileIdentifier] = fileList[0];
    }
  }


  constructor(private zone: NgZone, private cdr: ChangeDetectorRef, private fb: FormBuilder, private router: Router, private Service: CreateAllTimeListService, private messageService: MessageService, private cookieService: CookieService, private fm: FormsModule) {
    this.OrgID = this.cookieService.get('OrgID');

  }

  ngOnInit(): void {
    this.OrgID = this.cookieService.get('OrgID');

    this.addDefaultRows();
    this.getProjectName();
    this.getCandidateList();
    this.getLocation();
    this.getpayItem();

    this.selectedWeek = '2024-02-05 to 2024-02-11';
    this.updateDynamicDays(this.selectedWeek);
    }

  updateDynamicDays(selectedWeek: string): void {
    this.dynamicDays = this.getWeekData(selectedWeek).days;
  }


  // deleteAllRows(): void {
  //   this.rows = this.rows.slice(0, 3);
  //   this.updateSerialNumbers();
  // }

selectedItem: string;
dropdownOptions: any[] = [];

selectOption(option: string): void {
  this.selectedItem = option;
}

getCandidateList() {
  let Req = {
    OrgID: this.OrgID
  };
  this.Service.getTimesheetCandidatetList(Req).subscribe((x: any) => { 
    this.dropdownOptions = x.result;
  });
}

getDropdownOption1() { 
  return this.dropdownOptions;
}

onChangesDropdown(selectedOption: any, row: any) {
  this.selectedItem = `${selectedOption.FirstName} ${selectedOption.LastName}`;
}
 
  selectedItem1: string;
  dropdownOptions1: string[] = [];

  selectOption1(option: string): void {
    this.selectedItem1 = option;
  }
  getProjectName() {
    let Req = {
      OrgID: this.OrgID
    };
    this.Service.getCreateProjectList(Req).subscribe((x: any) => {
      this.ProjectName = x.result;
    });
  }
  getDropdownOptions() {
    return this.ProjectName;
  }
  onDropdownChange(selectedOption: any, row: any) {
    row.projectName = selectedOption.ProjectName;

  }


  selectedItem4: string;
  dropdownOptions4: string[] = [];

  selectOption4(option: string): void {
    this.selectedItem4 = option;
  }

  getLocation() {
    let Req = {
      OrgID: this.OrgID
    };
    this.Service.getLocationList(Req).subscribe((x: any) => {
      this.city = x.result;
    });
  }
  getDropdownOption() {
    return this.city;
  }
  onDropdownChanges(selectedOption: any, row: any) {
    row.location = selectedOption.city;
  }


  // option1 = ['Regular Type']
  // onDropdownItemClick(selectedOption: string, row: any): void {
  //   row.payItem = selectedOption;
  // }

  selectedItem2: string;
  dropdownOptions2: string[] = [];

  selectOption3(option: string): void {
    this.selectedItem2 = option;
  }

  getpayItem() {
    let Req = {
      OrgID: this.OrgID
    };
    this.Service.getPayItemList(Req).subscribe((x: any) => {
      this.Text = x.result;
    });
  }
  getDropdownOptionn() {
    return this.Text;
  }
  onDropdownChangess(selectedOption: any, row: any) {
    row.payItem = selectedOption.Text;
  }




  option2 = ['Service']
  onDropdownItemClicks(selectedOption: string, row: any): void {
    row.service = selectedOption;
  }

  SaveRow() {
    let Req = {
      data: this.timesheetRows,
    };
    console.log(Req);
    // this.Service.createTimesheet(Req).subscribe(
    //   (x: any) => {
    //         this.handleSuccess(x);
    //       },
    //       (error: any) => {
    //         this.handleError(error);
    //       }
    // );
  }

  selectedWeek: string = '';


  onWeekSelect(week: string): void {
    this.selectedWeek = week;
  }

  generateWeeks(): string[] {
    const today = new Date();
    const currentYear = today.getFullYear();
    const weeks: string[] = [];

    this.zone.runOutsideAngular(() => {
      for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
        const targetMonth = (today.getMonth() + monthOffset) % 12;
        const targetYear = currentYear + Math.floor((today.getMonth() + monthOffset) / 12);

        const startDate = this.getFirstMonday(new Date(targetYear, targetMonth, 1));

        for (let i = 0; i < 5; i++) {
          const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
          const weekString = `${this.formatDate(startDate)} to ${this.formatDate(endDate)}`;
          weeks.push(weekString);
          startDate.setDate(startDate.getDate() + 7);
        }
      }
    });
    return weeks;
  }

  getFirstMonday(date: Date): Date {
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }

  formatDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }


  dynamicDays: string[] = [];

  getWeekDates(selectedWeek: string): Date[] {
    const [start, end] = selectedWeek.split(' to ').map(dateString => new Date(dateString));
    const dates: Date[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}

// calculateTotalAmount(row: any): number | string {
//   const mon = row.mon || 0;
//   const tues = row.tues || 0;
//   const wed = row.wed || 0;
//   const thu = row.thu || 0;
//   const fri = row.fri || 0;
//   const sat = row.sat || 0;
//   const sun = row.sun || 0;
//   const totalHours = +mon + +tues + +wed + +thu + +fri + +sat + +sun;

//   const hourlyRate = row.checkbox ? +row.input : 0;

//   const totalAmount = totalHours * hourlyRate;

//   return isNaN(totalAmount) ? 'N/A' : totalAmount;
// }


// Add the second default row
// this.timesheetRows.push({
//   selectedOption2: null,
//   detailsDropdown2: null,
//   dropdownId2: 2,
//   textarea2: '',
//   checkbox2: false,
//   file2_1: null,
//   file2_2: null,
//   mon2: 0,
//   tues2: 0,
//   wed2: 0,
//   thu2: 0,
//   fri2: 0,
//   sat2: 0,
//   sun2: 0
// });


// selectSunday(selectedDate: string) {
//   const selectedDateObj = new Date(selectedDate);
//   const dayOfWeek = selectedDateObj.getDay();
//   if (dayOfWeek === 0) {
//     this.selectedSunday = selectedDate;
//     this.isSundaySelected = true;
//   } else {
//     const previousSunday = new Date(selectedDateObj);
//     previousSunday.setDate(selectedDateObj.getDate() - dayOfWeek);
//     const formattedDate = previousSunday.toISOString().split('T')[0];
//     this.selectedSunday = formattedDate;
//     this.isSundaySelected = true;
//   }
// }


// Its Important for showing the weeks, only current month
// --------------------------------------------------
// generateWeeks(): string[] {
//   const today = new Date();
//   const currentDay = today.getDay();
//   const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Start from the beginning of the current or next week

//   const weeks: string[] = [];

//   for (let i = 0; i < 5; i++) { // Display 5 weeks ahead
//     const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
//     const weekString = `${this.formatDate(startDate)} to ${this.formatDate(endDate)}`;
//     weeks.push(weekString);
//     startDate.setDate(startDate.getDate() + 7); // Move to the next week
//   }

//   return weeks;
// }

