import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { formatDate } from '@angular/common';
import Chart from 'chart.js';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import * as XLSX from 'xlsx';
import { ReportsService,  } from './reports.service';



interface Job {
    client: string;
    total: number;
    active: number;
  }
  interface IRange {
    value: Date[];
    label: string;
  }
  interface ResponseDetails {
    ClientName: any;
    RecruitmentmanagerID: number;
    ActiveJobs: number;
    InactiveJobs: number;
  }
  
@Component({
    selector: 'app-reports',
    templateUrl: './job-by-client.component.html',
    providers: [ReportsService,CookieService]


})

export class jobByClientComponent implements OnInit {

    jobs: any;
    rowData: any;
    chartElement: any;
    startDate: string;
    endDate: string;
    public pivotData: any[] = [];
    public pivotColumnDefs: ColDef[] = [];
    public gridOptions: GridOptions = {};
    public gridApi: GridApi;
    filterForm = new FormGroup({
        dates: new FormControl('', Validators.required),
      });
      public showAdditionalFilters = false;
      public selectedCondition: string; 
      public filterValue: string; 
      chartOptions: any;
      chartData: any;
      public showFilterPopup = false;

      dataSource: Job[] = [];
      columnDefs = [
        { field: 'client', headerName: 'Client Name', sortable: true, filter: true, resizable: true },
        { field: 'total', headerName: 'Total', sortable: true, filter: true, resizable: true },
        { field: 'active', headerName: 'Active', sortable: true, filter: true, resizable: true },
        { field: 'inactive', headerName: 'In-Active', sortable: true, filter: true, resizable: true },
    ];
       traineeId: any;
      displayedColumns: any;
    ngOnInit(): void {
      this.gridOptions = {
        rowData: this.rowData,
        columnDefs: this.columnDefs,
        pagination: true
    }
      let payload = {
        traineeId: this.traineeId,

      };

      this.service.getjobreportbyclient(payload).subscribe((response: ResponseDetails[]) => {
        console.log('Received response:', response);
        if (response && response.length > 0) {
          this.dataSource = response.map(item => ({
            client: item.ClientName,
            total: item.ActiveJobs + item.InactiveJobs,
            active: item.ActiveJobs,
            inactive: item.InactiveJobs
          }));
          this.rowData = this.dataSource
        } else {
          console.warn('No data received');
        }
      });
    }

    get totalJobs(): number {
        return this.dataSource.reduce((acc, job) => acc + job.total, 0);
      }
    
      get activeJobs(): number {
        return this.dataSource.reduce((acc, job) => acc + job.active, 0);
      }
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
    
    public condition: any[] = [
        { value: 'is-one-of', name: 'Is One Of' },
        { value: 'is-not-one-of', name: 'Is Not One Of' },
      ];
    
      public onExport() {
        if (this.gridApi) {
            this.gridApi.exportDataAsCsv();
        } else {
            console.error('Grid API not available');
        }
    }

    public onExportPivotCSV(){
      this.gridApi.exportDataAsCsv();
    }

    onGridReady(params: any) {
      console.log(params.api)
      this.gridApi = params.api;
    }

      options = [
        { value: 'accounting', name: 'Accounting / Audit / Tax Services' },
        { value: 'advertising', name: 'Advertising / Public Relations' },
        { value: 'architecture', name: 'Architecture / Building' },
        { value: 'athletics', name: 'Athletics / Sports' },
        { value: 'charity', name: 'Charity / Social Services / Nonprofit' },
        { value: 'chemical', name: 'Chemical / Plastic / Paper' },
        { value: 'civil', name: 'Civil Services (Government / PSU)' },
        { value: 'clothing', name: 'Clothing / Garment / Textile' },
        { value: 'education', name: 'Education' },
        { value: 'electronics', name: 'Electronics / Electric' },
        { value: 'energy', name: 'Energy / Power / Water' },
        { value: 'engineering-building', name: 'Engineering - Building' },
        { value: 'engineering-electric', name: 'Engineering - Electric' },
        // Add more options as needed
        { value: 'entertainment', name: 'Entertainment / Recreation' }, // Added from image
        { value: 'financial', name: 'Financial Services' }, // Added from image
        { value: 'food-beverage', name: 'Food and Beverage / Catering' }, // Added from image
        { value: 'freight', name: 'Freight Forwarding / Delivery Services' }, // Added from image
        { value: 'general', name: 'General Business Services' },
        { value: 'health', name: 'Health & Beauty Care' },
        { value: 'hospitality', name: 'Hospitality / Catering' }, // Added from image (duplicate, can be removed)
        { value: 'human-resources', name: 'Human Resources Management' },
        { value: 'industrial', name: 'Industrial Machinery/Equipment' }, // Added from image
        { value: 'information-technology', name: 'Information Technology' },
        { value: 'insurance', name: 'Insurance / Pension Funds' },
        { value: 'interior-design', name: 'Interior Design / Graphic Design' }, // Added from image
        { value: 'legal', name: 'Legal Services' }, // Added from image
        { value: 'manufacturing', name: 'Manufacturing' }, // Added from image
        { value: 'marketing', name: 'Marketing' }, // Added from image
        { value: 'medical', name: 'Medical / Pharmaceutical' }, // Added from image
        { value: 'real-estate', name: 'Real Estate' }, // Added from image
        { value: 'retail', name: 'Retail Trade' }, // Added from image
        { value: 'security', name: 'Security Services' }, // Added from image
        { value: 'staffing', name: 'Staffing / Recruitment' }, // Added from image
        { value: 'telecommunication', name: 'Telecommunication' }, // Added from image
        { value: 'transportation', name: 'Transportation / Logistics' }, // Added from image
        { value: 'travel', name: 'Travel / Tourism' }, // Added from image
        { value: 'waste-management', name: 'Waste Management' },
        { value: 'management-consultancy', name: 'Management Consultancy' }, // New filter
        { value: 'media-publishing', name: 'Media / Publishing' },
      ];
      constructor(private fb: FormBuilder,private service:ReportsService) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        this.filterForm = this.fb.group({
          dates: [null],
          condition: [null],
          values: [null]
          
        });
      }
    
      public getActivePercentage() {
        const activeJobs = this.jobs.filter((job: { status: string; }) => job.status === 'active');
        return activeJobs.length / this.jobs.length * 100;
      }

      public ngAfterViewInit() {
        const ctx = this.chartElement.nativeElement.getContext('2d');
        new Chart(ctx, {
          type: 'doughnut', // Change type to 'doughnut' for circle graph
          data: this.chartData,
          options: this.chartOptions,
        });
    }
    public onValueChange(value: any) {
        this.startDate = this.dateFormatter(value[0]);
        this.endDate = this.dateFormatter(value[1]);
      }
      public dateFormatter(value: any) {
        let formattedDate = formatDate(value, 'yyyy-MM-dd', "en-US");
        return formattedDate;
    }
    public onFilterClick() {
        this.showFilterPopup = !this.showFilterPopup;
      }
    
      public onAddFilterClick() {
        this.showAdditionalFilters = !this.showAdditionalFilters;
      }
    
      public onApplyClick() {
        // Handle filter application based on selected date range and potentially additional filters
        if (this.selectedCondition && this.filterValue) {
          // Implement logic to filter jobs based on selected condition and value
          console.log("Filtering jobs based on condition:", this.selectedCondition, "and value:", this.filterValue);
        } else {
          // Handle case where no additional filters are selected
          console.log("Applying filter based on date range only");
        }
      }

    private convertPivotDataToCSV(data: any[], columnDefs: any[]): string {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const headerRow = columnDefs.map(colDef => colDef.headerName || colDef.field);
        XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: 'A1' });

        const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ c: C, r: 0 });
            if (!worksheet[address]) continue;
            worksheet[address].s = {
                fill: { fgColor: { rgb: "FFFFE0" } },
                font: { bold: true }
            };
        }

        const columnWidths = data.reduce((widths, row) => {
            columnDefs.forEach((colDef, index) => {
                const value = row[colDef.field] ? row[colDef.field].toString() : '';
                widths[index] = Math.max(widths[index], value.length);
            });
            return widths;
        }, columnDefs.map(colDef => colDef.headerName.length));

        worksheet['!cols'] = columnWidths.map((w: number) => ({ wch: w + 2 }));

        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        return csvContent;
    }
    }
