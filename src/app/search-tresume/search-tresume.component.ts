import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-create-new-jobs',
  templateUrl: './search-tresume.component.html',
  styleUrls: ['./search-tresume.component.scss']
})
export class SearchTresumeComponent{
  loading:boolean = false;
  @ViewChild('myTabs') myTabs: TabsetComponent;
  basicactive:string='active';
  reqactive:string = '';
  orginfoactive = '';
  previewinfo = '';
  address:string='';
  selectedLegalstatus:string = '';
  companyname:string='';
  jobtitle:string='';
  zipcode:string='';
  citycode:string='';
  billrate:string='';
  payrate:string='';

  nextTab(tab:number) {
    if(tab == 1){
      this.basicactive = 'active';
      this.reqactive = '';
      this.orginfoactive = '';
      this.previewinfo = '';
    } else if(tab == 2){
      this.basicactive = '';
      this.reqactive = 'active';
      this.orginfoactive = '';
      this.previewinfo = '';
    }else if(tab == 3){
      this.basicactive = '';
      this.reqactive = '';
      this.orginfoactive = 'active';
      this.previewinfo = '';
    }else if(tab == 4){
      this.basicactive = '';
      this.reqactive = '';
      this.orginfoactive = '';
      this.previewinfo = 'active';
    }
  console.log(this.selectedLegalstatus);
  }




  filteredOwnership: any[] = [];
  selectedStatus: any[] = [];
  statusOptions: any[]=[{name:'Eligible to work in the US'},{name:'US Citizen'}, {name:'GC'}, {name:'F1'}, {name:'F1-CPT'},{name:'F1-OPT EAD'},{name:'GC-EAD'},{name:'H4-EAD'},{name:'L2-EAD'},{name:'Other EAD'},{name:'L1-Visa'},];
  onLegalstatusSearch(event: any) {
    this.filteredOwnership = this.statusOptions.filter(option =>
      option.toLowerCase().includes(event.query.toLowerCase())
    );
  }



  selectedCountry: string = 'United States';
  countries: string[] = ['United States'];

  selectedState: string = 'Georgia';
  states: string[] = ['Georgia', 'District of Columbia', 'Florida', 'Hawaii', 'Idaho', 'Other'];

  selectedCity: string = 'New York';
  cities: string[] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Other'];


selectedCurrency: string = 'USD';
  currencies: string[] = ['USD', 'EUR', 'INR', 'Other'];

  selectedPayType: string = 'hour';
  payTypes: string[] = ['hour', 'day', 'week', 'bi-week', 'month', 'year'];


  selectedTaxTerms: string = '';
  taxTerms: any[] = [
    { value: '', label: 'Select' },
    { value: '1', label: '1099' },
    { value: '2', label: 'C2C' },
    { value: '3', label: 'C2H' },
    { value: '4', label: 'Full Time' },
    { value: '5', label: 'Intern' },
    { value: '6', label: 'Other' },
    { value: '7', label: 'Part Time' },
    { value: '8', label: 'Seasonal' },
    { value: '9', label: 'W-2' },
  ];

  selectedRespondBy: string = '1';
  respondByOptions: any[] = [
    { value: '1', label: 'Open until filled' },
    { value: '2', label: 'Specific Date' }
  ];


  selectedJobType: string = '';
  jobTypeOptions: any[] = [
    { value: '', label: 'Select' },
    { value: '1', label: 'Full Time' },
    { value: '2', label: 'Contract' },
    { value: '3', label: 'Part Time' }
  ];

  selectedPriority: string = '';
  priorityOptions: any[] = [
    { value: '', label: 'Select' },
    { value: '1', label: 'Critical' },
    { value: '2', label: 'High' },
    { value: '3', label: 'Low' },
    { value: '4', label: 'Medium' }
  ];

  selectedJobStatus: string = '';
  jobStatusOptions: any[] = [
    { value: '0', label: 'Select' },
    { value: '1', label: 'Open' },
    { value: '2', label: 'Cancelled' },
    { value: '3', label: 'Closed' },
    { value: '4', label: 'Filled' },
    { value: '5', label: 'On Hold by Client' },
    { value: '6', label: 'On Hold by Lead' }
  ];


  selectedClient: string = '';
  clientOptions: any[] = [
    { value: '', label: 'Select' },
    { value: '1', label: 'FX Pro' },
    { value: '2', label: 'ds' },
    { value: '3', label: 'Google edit' },
    { value: '4', label: 'Mozila' }
  ];

  selectedInterviewMode: string = '';
  interviewModeOptions: any[] = [
    { value: '', label: 'Select' },
    { value: '1', label: 'Face to Face' },
    { value: '2', label: 'Phone' },
    { value: '3', label: 'Zoom' },
    { value: '4', label: 'Hangouts' },
    { value: '5', label: 'WebEx' }
  ];



  selectedExperience: string = '';
  experienceOptions: string[] = [
    '1 year',
    '2 years',
    '3 years',
    '4 years',
    '5 years',
    '6 years',
    '7 years',
    '8 years',
    '9 years'
  ];


  public content:any;
  taxTermsOptions = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' }
  ];
  selectedTaxTerm: any;

  departmentOptions = [
    { id: 1, name: 'Department A' },
    { id: 2, name: 'Department B' },
    { id: 3, name: 'Department C' }
  ];
  selectedDepartment: any;

  recruitManager = [
    { id: 1, name: 'Department A' },
    { id: 2, name: 'Department B' },
    { id: 3, name: 'Department C' }
  ];
  selectedrecmanger: any;

  salesManager = [
    { id: 1, name: 'Department A' },
    { id: 2, name: 'Department B' },
    { id: 3, name: 'Department C' }
  ];
  selectedsalesManager: any;

  accountManager = [
    { id: 1, name: 'Department A' },
    { id: 2, name: 'Department B' },
    { id: 3, name: 'Department C' }
  ];
  selectedaccountManager: any;

  checkboxes = [
    { label: 'ZipRecruiter', checked: false },
    { label: 'Dice', checked: false }
  ];

  selectedPrimaryRecruiter: string = '';
 RecruiterStatusOptionsons: any[] = [
    { value: '', label: 'Select' },
    { value: '1', label: 'PORKODI BASKARAN' },
    { value: '2', label: 'PORKODI B' },
    { value: '3', label: 'RENUKA Aed' },
    { value: '4', label: 'WILSON AM' },
    { value: '5', label: 'TEST1' },
    { value: '6', label: 'TEST V2' }
  ];





}
