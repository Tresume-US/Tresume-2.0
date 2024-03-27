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
import { Directive, HostListener } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';


@Component({
  selector: 'app-create-all-time-list',
  templateUrl: './create-all-time-list.component.html',
  providers: [CookieService, CreateAllTimeListService, MessageService],
  styleUrls: ['./create-all-time-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class CreateAllTimeListComponent implements OnInit {
  OrgID: string;
  rows: any[] = [];
  minDate: string;
  maxDate: string;
  maxSelectableDays = 7;
  selectedDateRange: Date[] = [];
  maxAllowedDays: number = 7;
  selectedSunday: string = '';
  isSundaySelected: boolean = false;
  CAselectedFile: File | null = null;
  [key: string]: any;
  file1: File | null = null;
  endDateFormatted: string = '12';
  startDateFormatted: string = '12';
  username: any = '';
  traineeID: any = '';
  candidateid: any = '';
  timesheetRows: any[] = [];
  totalAmountForAllRows: number = 0;
  totalAmount: number = 0;
  loading: boolean = false;
  isBillable: boolean;
  autofillData: any;
  timesheet_role:any;


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

  // onDateRangeChange(dates: Date[]): void {
  //   if (dates.length === 2) {
  //     const startDate = new Date(dates[0]);
  //     const endDate = new Date(dates[1]);
  //     const startDayOfWeek = startDate.getDay();
  //     const endDayOfWeek = endDate.getDay();  
  //     if (startDayOfWeek !== 1 || endDayOfWeek !== 0) {
  //       this.selectedDateRange = [];
  //       console.log('Please select a date range of 7 days that begins on a Monday!');
  //       this.showMessage('Please select a date range of 7 days that begins on a Monday!');
  //     } else {
  //       this.selectedDateRange = [startDate, endDate];
  //     }
  //   }
  // }
  // showMessage(message: string): void {
  //   alert(message);
  // }

  addRow() {
    this.timesheetRows.push({
      selectedOption: null,
      detailsDropdown: null,
      dropdownId: 1,
      description: '',
      hourlyRate: 0,
      billable: false,
      file1: null,
      mon: '',
      tues: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      sun: '',
      totalHours: '',
      totalAmount: '',
      startDate: '',
      endDate: '',
    });
  }
  // removeRow(index: number) {
  //   this.timesheetRows.splice(index, 1);
  // }

  onFileChange(event: any, fieldName: string, row: any) {
    this.loading = true;
    const fileList: FileList | null = event.target.files;
    if (fileList && fileList.length > 0) {
      row[fieldName] = fileList[0];
      this.updateFileName(fileList[0], fieldName);
    }
  }

  updateFileName(file: File, fieldName: string) {
    if (fieldName === 'file1') {
      this.file1 = file;
      this.loading = false;
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


  // calculateTotalHours(row: any): number | string {
  //   const mon = row.mon || 0;
  //   const tues = row.tues || 0;
  //   const wed = row.wed || 0;
  //   const thu = row.thu || 0;
  //   const fri = row.fri || 0;
  //   const sat = row.sat || 0;
  //   const sun = row.sun || 0;
  //   const totalHours = +mon + +tues + +wed + +thu + +fri + +sat + +sun;

  //   row.totalHours = totalHours;

  //   return isNaN(totalHours) ? 'N/A' : totalHours;

  // }

  formatTotalHours(totalHours: number): string {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours} hr ${minutes} mins`;
  }

  // calculateTotalHours(row: any): number {
  //   const mon = row.mon || 0;
  //   const tues = row.tues || 0;
  //   const wed = row.wed || 0;
  //   const thu = row.thu || 0;
  //   const fri = row.fri || 0;
  //   const sat = row.sat || 0;
  //   const sun = row.sun || 0;
  //   const totalHours = mon + tues + wed + thu + fri + sat + sun;
  //   return totalHours;
  // }

  calculateTotalHours(row: any): number {
    const mon = parseFloat(row.mon) || 0;
    const tues = parseFloat(row.tues) || 0;
    const wed = parseFloat(row.wed) || 0;
    const thu = parseFloat(row.thu) || 0;
    const fri = parseFloat(row.fri) || 0;
    const sat = parseFloat(row.sat) || 0;
    const sun = parseFloat(row.sun) || 0;
    const totalHours = mon + tues + wed + thu + fri + sat + sun;
    return totalHours;
  }


  addDefaultRows() {
    this.timesheetRows.push({
      projectName: '',
      payItem: '',
      service: '',
      location: '',
      description: '',
      hourlyRate: '',
      billable: false,
      clientAproved: null,
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


  constructor(private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router,
    private Service: CreateAllTimeListService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private fm: FormsModule,
    private datePipe: DatePipe,
    private http: HttpClient) {
    this.OrgID = this.cookieService.get('OrgID');
    this.traineeID = this.cookieService.get('TraineeID');
    this.username = this.cookieService.get('userName1');
     this.timesheet_role = this.cookieService.get('timesheet_role'); 
    this.candidateid = this.traineeID;
  }


  ngOnInit(): void {
    this.loading = true;
    // this.OrgID = this.cookieService.get('OrgID');
    // this.traineeID = this.cookieService.get('TraineeID');
    // this.username = this.cookieService.get('userName1');

    this.addDefaultRows();
    this.addDefaultRows();
    this.getProjectName();
    this.getCandidateList();
    // this.getLocation();
    this.getLocation('');
    this.getpayItem();
    this.getTimesheetRole();

    


    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    this.selectedWeek = `${this.formatDate(currentWeekStart)} to ${this.formatDate(currentWeekEnd)}`;

    this.dynamicDays = this.generateWeeks();
    if(this.timesheet_role === '3'){
      this.autofillDetails();
    }
  }

  timesheetrole: number[] = []
  getTimesheetRole() {
    let Req = {
      traineeID: this.traineeID
    };

    this.Service.gettimesheetrole(Req).subscribe((x: any) => {
      this.timesheetrole = x.result;
    });
  }

  getCurrentWeekDates(): { start: Date; end: Date } {
    let currentDate = new Date();
    let currentDay = currentDate.getDay();
    let diffToMonday = currentDay - 1;
    if (currentDay === 0) {
      diffToMonday = 6;
    }
    let monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - diffToMonday);
    let sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: monday,
      end: sunday,
    };
  }

  formatDate(date: Date): string {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //   formatDate(date: Date): string {
  //     const options: Intl.DateTimeFormatOptions = { 
  //         month: 'numeric', 
  //         day: 'numeric', 
  //         year: 'numeric',
  //         timeZone: 'UTC' 
  //     };
  //     return date.toLocaleDateString('en-US', options);
  // }

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
  getCandidateName() {
    let Req = {
      username: this.username
    };

    this.Service.getTimesheetCandidatetList(Req).subscribe((x: any) => {
      this.dropdownOptions = x.result;
    });
  }

  getCandidateList() {
    let Req = {
      username: this.username
    };
    this.Service.getTimesheetCandidatetList(Req).subscribe((x: any) => {
      this.dropdownOptions = x.result;
    });
  }

  // getDropdownOption1() { 
  //   return this.dropdownOptions;
  // }

  getDropdownOption1() {
    if (!this.selectedItem) {
      return this.dropdownOptions;
    }
    return this.dropdownOptions.filter(option =>
      (`${option.FirstName} ${option.LastName}`).toLowerCase().includes(this.selectedItem.toLowerCase())
    );
  }

  onChangesDropdown(selectedOption: any, row: any) {
    this.selectedItem = `${selectedOption.FirstName} ${selectedOption.LastName}`;
    this.candidateid = `${selectedOption.TraineeID}`;
    this.autofillDetails();
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
    row.projectName = selectedOption.projectname;
    row.projectid = selectedOption.projectid;
  }


  // selectedItem4: string;
  // dropdownOptions4: string[] = [];
  selectedItem4: string;
  dropdownOptions4: any[] = []; // Update type according to your data structure
  state: any[] = [];


  selectOption4(option: string): void {
    this.selectedItem4 = option;
  }

  // getLocation() {
  //   let Req = {
  //     OrgID: this.OrgID
  //   };
  //   this.Service.getLocationList(Req).subscribe((x: any) => {
  //     this.state = x.result;
  //     this.loading = false;
  //   }),
  //   (error: any) => {
  //     console.error('Error occurred:', error);
  //     this.loading = false;
  //   };
  // }
  // getDropdownOption() {
  //   return this.state;
  // }
  // onDropdownChanges(selectedOption: any, row: any) {
  //   row.location = selectedOption.state;
  //   row.locationid = selectedOption.zipcode;
  // }
  getLocation(searchTerm: string) {
    let Req = {
      OrgID: this.OrgID
    };
    this.Service.getLocationList(Req).subscribe(
      (x: any) => {
        this.state = x.result;
        this.filteredOptions = this.getDropdownOption(searchTerm);
        this.loading = false;
      },
      (error: any) => {
        console.error('Error occurred:', error);
        this.loading = false;
      }
    );
  }

  getDropdownOption(searchTerm: string) {
    return this.state.filter(option =>
      option.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  onDropdownChanges(selectedOption: any, row: any) {
    row.location = selectedOption.state;
    row.locationid = selectedOption.zipcode;
  }

  onLocationInputChange(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.filteredOptions = this.getDropdownOption(searchTerm);
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
    const selectedWeek = this.selectedWeek.split(' to ');
    console.log(selectedWeek);
    const startDateSelectedWeek = new Date(selectedWeek[0]);
    const endDateSelectedWeek = new Date(selectedWeek[1]);

    const startDateFormatted = startDateSelectedWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const endDateFormatted = endDateSelectedWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    console.log(startDateFormatted);
    this.loading = true;

    this.timesheetRows.forEach((row, index) => {
      if (row.projectName != '') {
        const formData = new FormData();

        if (row.billable && !row.file1) {
          alert('Please Upload Client Approved File.');
        }

        if (row.file1) {
          formData.append('file1', row.file1);
        } else {
          formData.append('file1', '');
        }


        const totalHours = this.calculateTotalHours(row).toFixed(2);

        // console.log('Total Hours:', totalHours); 
        if(row.id){
          formData.append('id', row.id);
        }

        formData.append('traineeid', this.candidateid);
        formData.append('projectid', row.projectid);
        formData.append('totalhrs', totalHours);
        formData.append('details', row.description);
        formData.append('fromdate', selectedWeek[0]);
        formData.append('todate', selectedWeek[1]);
        if (row.billable==true) {
          formData.append('isBillable', '1');
        } else {
          formData.append('isBillable', '0');
        }
        formData.append('payterm', '1');
        formData.append('service', '1');
        formData.append('location', row.location);
        formData.append('billableamt', parseFloat(row.hourlyRate).toFixed(2));
        formData.append('day1', row.mon);
        formData.append('day2', row.tues);
        formData.append('day3', row.wed);
        formData.append('day4', row.thu);
        formData.append('day5', row.fri);
        formData.append('day6', row.sat);
        formData.append('day7', row.sun);
        formData.append('totalamt', parseFloat(row.totalAmount).toFixed(2));
        formData.append('admin', this.traineeID);
        formData.append('orgid', this.OrgID);
        formData.append('create_by', this.username);
        const status = row.status ? row.status : '1';
        formData.append('status', status);

        this.Service.createTimesheet(formData).subscribe(
          (x: any) => {
            this.handleSuccess(x);
            this.loading = false;
          },
          (error: any) => {
            this.handleError(error);
            this.loading = false;
          }
        );
      }
    });
  }


  // SaveRow() {
  //   const selectedWeek = this.selectedWeek.split(' to ');
  //   const startDateSelectedWeek = new Date(selectedWeek[0]);
  //   const endDateSelectedWeek = new Date(selectedWeek[1]);

  //   const startDateFormatted = startDateSelectedWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  //   const endDateFormatted = endDateSelectedWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

  //   this.timesheetRows.forEach((row, index) => {
  //     if (row.projectName != '') {
  //       const formData = new FormData();

  //       if (row.billable && !row.file1) {
  //         alert('Please Upload Client Approved File.');
  //       }

  //       if (row.file1) {
  //         formData.append('file1', row.file1);
  //       } else {
  //         formData.append('file1', ''); 
  //       }
  //       const totalHours = this.calculateTotalHours(row).toFixed(2);
  //       // console.log('Total Hours:', totalHours); 
  //       formData.append('traineeid', this.candidateid);
  //       formData.append('projectid', row.projectid);
  //       formData.append('totalhrs', totalHours);
  //       formData.append('details', row.description);
  //       formData.append('fromdate', startDateFormatted);
  //       // formData.append('fromdate', this.datePipe.transform(this.startDateFormatted));
  //       formData.append('todate', endDateFormatted);
  //       // formData.append('todate', this.datePipe.transform(this.endDateFormatted));
  //       if (row.billable) {
  //         formData.append('isBillable', '1');
  //       } else {
  //         formData.append('isBillable', '0');
  //       }
  //       formData.append('payterm', '1');
  //       formData.append('service', '1');
  //       formData.append('location', row.locationid);
  //       formData.append('billableamt', parseFloat(row.hourlyRate).toFixed(2));
  //       formData.append('day1', row.mon);
  //       formData.append('day2', row.tues);
  //       formData.append('day3', row.wed);
  //       formData.append('day4', row.thu);
  //       formData.append('day5', row.fri);
  //       formData.append('day6', row.sat);
  //       formData.append('day7', row.sun);
  //       formData.append('totalamt', parseFloat(row.totalAmount).toFixed(2));
  //       formData.append('admin', this.traineeID);
  //       formData.append('orgid', this.OrgID);
  //       formData.append('create_by', this.username);

  //       this.Service.createTimesheet(formData).subscribe(
  //         (x: any) => {
  //           this.handleSuccess(x);
  //           this.loading = false;
  //         },
  //         (error: any) => {
  //           this.handleError(error);
  //           this.loading = false;
  //         }
  //       );
  //     }       
  //   });
  // }   

  private handleSuccess(response: any): void {
    this.messageService.add({ severity: 'success', summary: response.message });
    console.log(response);
    this.loading = false;
    // this.fetchinterviewlist();
  }

  private handleError(response: any): void {
    this.messageService.add({ severity: 'error', summary: response.message });
    this.loading = false;
  }
  selectedWeek: string = '';
  // selectedWeekStartDate: Date;
  // selectedWeekEndDate: Date;

  onWeekSelect(week: string): void {
    this.selectedWeek = week;
    this.autofillDetails();
  }
  // onWeekSelect(selectedWeek: string): void {
  //   const [startDateString, endDateString] = selectedWeek.split(' to ');
  //   const startDate = new Date(startDateString);
  //   const endDate = new Date(endDateString);
  //   console.log('Start Date:', startDate);
  //   console.log('End Date:', endDate);
  // }

  //My code
  //   generateWeeks(): string[] {
  //     const today = new Date();
  //     const currentYear = today.getFullYear();
  //     const startDate = new Date(today);
  //     startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Start from the beginning of the current week

  //     const weeks: string[] = [];

  //     for (let i = -52; i <= 52; i++) { // Display 52 weeks before and after the current week
  //         const startWeek = new Date(startDate);
  //         startWeek.setDate(startWeek.getDate() + i * 7); // Move to the next or previous week

  //         const endDate = new Date(startWeek);
  //         endDate.setDate(endDate.getDate() + 6);

  //         const weekString = `${this.formatDate(startWeek)} to ${this.formatDate(endDate)}`;
  //         weeks.push(weekString);
  //     }

  //     return weeks;
  // }


  //Wilson Bro code
  // generateWeeks(): string[] {
  //   const weeks: string[] = [];
  //   const today = new Date();
  //   const currentYear = today.getFullYear();
  //   const startDate = new Date(today);
  //   startDate.setDate(startDate.getDate() - startDate.getDay() + 1); 

  //   const startWeek = new Date(startDate);
  //   startWeek.setDate(startWeek.getDate() - 52 * 7); 

  //   const endWeek = new Date(startDate);
  //   endWeek.setDate(endWeek.getDate() + 52 * 7); 

  //   let currentDate = new Date(startWeek);

  //   while (currentDate <= endWeek) {
  //     const endDate = new Date(currentDate);
  //     endDate.setDate(endDate.getDate() + 6);
  //     const weekString = `${this.formatDate(currentDate)} to ${this.formatDate(endDate)}`;
  //     weeks.push(weekString);
  //     currentDate.setDate(currentDate.getDate() + 7); 
  //   }

  //   return weeks;
  // }

  generateWeeks(currentWeekIndex: number = 0): string[] {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

    const weeks: string[] = [];
    const startIndex = currentWeekIndex - 15;
    const endIndex = currentWeekIndex + 15;

    for (let i = startIndex; i <= endIndex; i++) {
      const startWeek = new Date(currentWeekStart);
      startWeek.setDate(startWeek.getDate() + i * 7);

      const endDate = new Date(startWeek);
      endDate.setDate(endDate.getDate() + 6);

      const weekString = `${this.formatDate(startWeek)} to ${this.formatDate(endDate)}`;
      weeks.push(weekString);
    }

    return weeks;
  }


  getFirstMonday(date: Date): Date {
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1);
    }
    return date;
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

  removeRow(index: number) {
    const row = this.timesheetRows[index];

    if (this.rowHasData(row)) {

      this.clearRow(row);
    } else {

      this.timesheetRows.splice(index, 1);
    }
  }

  rowHasData(row: any): boolean {
    return Object.values(row).some(value => !!value);
  }

  clearRow(row: any) {
    Object.keys(row).forEach(key => {
      row[key] = '';
    });
  }



  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const targetElement = event.target as HTMLElement;

    const allowedInputIds = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'];
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
  getDefaultWeekDays(selectedWeek?: string): { label: string, date: string }[] {
    let startDate: Date;
    if (selectedWeek) {
      startDate = new Date(selectedWeek.split(' to ')[0]);
    } else {
      const today = new Date();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay() + 1); // Adjust to Monday
    }

    const defaultWeekDays = [];

    let currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (1 - startDate.getDay())); // Adjust to Monday

    for (let i = 0; i < 7; i++) {
      const label = currentDate.toLocaleDateString('en-US', { weekday: 'short' });

      const date = currentDate.getDate();

      defaultWeekDays.push({ label, date: `${label} ${date}` });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return defaultWeekDays;
  }



  candidateId: number;
  fromDate: Date;
  toDate: Date;


  autofillDetails(): void {
    this.loading = true;
    const selectedWeek = this.selectedWeek.split(' to ');
    console.log(selectedWeek);
    let Req = {
      fromdate: selectedWeek[0],
      traineeID: this.candidateid
    };

    this.Service.autofillDetails(Req).subscribe((x: any) => {
      this.loading = false;
      var data = x.result;
      this.timesheetRows = [];
      if (data.length > 0) {
        
        data.forEach((itm: any) => {
          console.log(itm)
          var row = {
            projectName: itm.projectname,
            payItem: 'Hourly',
            service: 'Service',
            location: itm.location,
            description: itm.details,
            hourlyRate: itm.billableamt,
            billable: itm.isBillable,
            clientAproved: '',
            mon: itm.day1,
            tues: itm.day2,
            wed: itm.day3,
            thu: itm.day4,
            fri: itm.day5,
            sat: itm.day6,
            sun: itm.day7,
            totalHours: itm.totalhrs,
            totalAmount: itm.totalamt,
            file1: { name: itm.clientapproved },
            id: itm.id,
            status: itm.status,
            projectid:itm.projectid
          };

          this.timesheetRows.push(row);

        });
      }else{
        this.addRow();
      }

    },
    (error: any) => {
      console.error('Error occurred:', error);
      this.loading = false;
    });
  }

  isStatus3(): boolean {
    return this.timesheetRows.some(row => row.status === 3);
  }

 

}

