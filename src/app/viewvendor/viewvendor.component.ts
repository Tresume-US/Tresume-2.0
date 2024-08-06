import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgModule } from '@angular/core';


@Component({
  selector: 'app-viewvendor',
  templateUrl: './viewvendor.component.html',
  styleUrls: ['./viewvendor.component.scss']
})
export class ViewvendorComponent implements OnInit {
  loading:boolean = false;

  content: string = '';
  vendors: any[] = [
    {
      VendorName: 'vendor A',
      EmailID: 'vendora@example.com',
      Designation: 'Director',
      Owner: 'John Doe',
    },
  ];

  sortByColumn: string = '';
  sortDirection: string = 'asc';
  Ownership: any[]=[{name:'Parvathy'}, {name:'abc'}, {name:'DEF'}, {name:'def'}];
  selectedOwnership: any[] = [];
  filteredOwnership: any[] = [];
  vendorLeads: any[] ;
  requiredDocuments: any[] ;
  selectedvendorLeads: any[] = [];
  selectedRequiredDocuments: any[] = [];
  filteredvendorLeads: any[] = [];
  filteredRequiredDocuments: any[] = [];

  onvendorLeadsSearch(event: any) {
    this.filteredvendorLeads = this.vendorLeads.filter(option =>
      option.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  onRequiredDocumentsSearch(event: any) {
    this.filteredRequiredDocuments = this.requiredDocuments.filter(option =>
      option.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  onOwnershipSearch(event: any) {
    this.filteredOwnership = this.Ownership.filter(option =>
      option.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  constructor(private router: Router) {
    this.vendorLeads = [{name:'Lead 1'}, {name:'Lead 2'}, {name:'Lead 3'}, {name:'Lead 4'}];
    this.requiredDocuments = [{name:'Document 1'}, {name:'Document 2'}, {name:'Document 3'}, {name:'Document 4'}];
  }

  ngOnInit(): void {
    this.sortBy('VendorName');
    this.sortBy('EmailID');
    this.sortBy('Designation');
    this.sortBy('Owner');
    this.sortBy('Action');
  }


  sortBy(columnName: string) {
    if (this.sortByColumn === columnName) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortByColumn = columnName;
      this.sortDirection = 'asc';
    }
    this.vendors.sort((a, b) => this.sortDirection === 'asc' ? a[columnName].localeCompare(b[columnName]) : b[columnName].localeCompare(a[columnName]));
  }

  showConfirmationDialog: boolean = false;

  deleteContact(){
    this.showConfirmationDialog = true;
   }
   confirmDelete() {
    const index = 1;
    if (index >= 0 && index < this.vendors.length) {
      this.vendors.splice(index, 1);
    }
    this.showConfirmationDialog = false;
  }
  cancelDelete() {

    this.showConfirmationDialog = false;
  }
}
