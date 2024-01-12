import { Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-all-invoice',
  templateUrl: './all-invoice.component.html',
  styleUrls: ['./all-invoice.component.scss']
})
export class AllInvoiceComponent implements OnInit {
feedbackWithIcon() {
throw new Error('Method not implemented.');
}

provideFeedback: any;
closeModal() {
throw new Error('Method not implemented.');
}
  selectedType: string;

  showTable: boolean = false;

  viewRecurringTemplates() {
    this.showTable = true;
    // You may also perform other actions related to displaying the table here
  }   
  constructor(private dialog: MatDialog) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  // openPopup() {
  //   this.openModal();
  // }

  // private openModal() {
  //   const dialogRef = this.dialog.open(AllInvoiceComponent, {
  //     width: '400px', // Adjust the width as needed
  //     data: { /* Pass any data needed by the modal component */ }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     // Handle any result or perform actions after the modal is closed
  //   });
  // }

  activeTab: string = 'allinvoices';
  showCustomDateModel: boolean = false;
  startDate: string = '';
  endDate: string = '';

  toggleCustomDateModel() {
    this.showCustomDateModel = !this.showCustomDateModel;
  }

  resetDates() {  
    this.startDate = '';  
    this.endDate = '';
  }

  applyDates() {
    // Implement logic to handle applying custom dates
    console.log('Start Date:', this.startDate);
    console.log('End Date:', this.endDate);

    // You can add further logic here, such as fetching data based on the selected date range
  }

 
  }






