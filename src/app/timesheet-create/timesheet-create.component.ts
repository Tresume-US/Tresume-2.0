import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TimesheetCreateService } from './timesheet-create.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-timesheet-create',
  templateUrl: './timesheet-create.component.html',
  providers: [CookieService,TimesheetCreateService,MessageService],
  styleUrls: ['./timesheet-create.component.scss']
})
export class TimesheetCreateComponent implements OnInit {



  timesheetData: any[];
  minDate: string;
  maxDate: string;
  selectedSunday: string = '';
  isSundaySelected: boolean = false;
  CAselectedFile: File | null = null;
  SRselectedFile: File | null = null;


  constructor(private fb: FormBuilder,private router: Router, private Service: TimesheetCreateService) {
    // this.addRow();
  }

  ngOnInit(): void {
  
  }

  selectSunday(selectedDate: string) {
    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.getDay();
    if (dayOfWeek === 0) {
      this.selectedSunday = selectedDate;
      this.isSundaySelected = true;
    } else {
      const previousSunday = new Date(selectedDateObj);
      previousSunday.setDate(selectedDateObj.getDate() - dayOfWeek);
      const formattedDate = previousSunday.toISOString().split('T')[0];
      this.selectedSunday = formattedDate;
      this.isSundaySelected = true;
    }
  }

  // addRow() {
  //   const row = this.formBuilder.group({
  //     project: ['', Validators.required],
  //     sunHours: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  //     monHours: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  //     tueHours: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  //     wedHours: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  //     thuHours: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  //     friHours: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  //     satHours: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  //     comments: [''],
  //     totalHours: ['']
  //   });

  //   this.timesheetData.push(row);
  // }

  // removeRow(index: number) {
  //   if (index >= 0 && index < this.timesheetData.length) {
  //     this.timesheetData.splice(index, 1);
  //   }
  // }

  async saveTimesheet() {
    const formData = new FormData();
    if (this.CAselectedFile) {
      formData.append('CAfile', this.CAselectedFile, this.CAselectedFile.name);
    }
    if (this.SRselectedFile) {
      formData.append('SRfile', this.SRselectedFile, this.SRselectedFile.name);
    }
    formData.append('timesheetData', JSON.stringify(this.timesheetData));
  
    try {
      const response = await this.Service.createTimesheet(formData).toPromise();
      console.log(response);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  // cancel() {
  //   this.timesheetData = [];
  //   this.CAselectedFile = null;
  //   this.SRselectedFile = null;
  //   this.addRow();
  //   this.selectedSunday = '';
  //   this.isSundaySelected = false;
  //   this.router.navigate(['/all-time-list']).catch((error) => {
  //     console.error('Navigation error:', error);
  //   });
  // }

  // onFileSelected(event: Event, Type: string) {
  //   const inputElement = event.target as HTMLInputElement;
  //   if (Type === "1") {
  //     if (inputElement.files) {
  //       this.CAselectedFile = inputElement.files[0];
  //     }
  //   } else {
  //     if (inputElement.files) {
  //       this.SRselectedFile = inputElement.files[0];
  //     }
  //   }
  // }
}
