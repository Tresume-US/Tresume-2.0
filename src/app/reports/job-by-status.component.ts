import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { formatDate } from '@angular/common';
import Chart, {  } from 'chart.js';
import { GridOptions, ColDef, GridApi } from 'ag-grid-community';
import * as XLSX from 'xlsx';
import { ReportsService, ResponseDetails } from './reports.service';

interface IRange {
    value: Date[];
    label: string;
  }
@Component({
    selector: 'app-reports',
    templateUrl: './job-by-status.component.html',
    providers: [ReportsService,CookieService]
})
export class jobByStatusComponent implements OnInit {
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
        recruiter: new FormControl('', Validators.required),
        candidateStatus: new FormControl('')
      });
      public showAdditionalFilters = false;
      public selectedCondition: string; // To store selected condition from dropdown
      public filterValue: string; // To store value from text input
  traineeId: string | null;
  selectedDateRange: any;
chartClicked($event: any) {
throw new Error('Method not implemented.');
}
chartOptions: any;
chartData: any;
public showFilterPopup = false;
pieChartType = 'pie';
ChartLabels = ['Active', 'In-Active'];
ChartData = [0, 0]; 
ChartColors = [
  {
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56','#FF6384', '#36A2EB', '#FFCE56',
      '#FF6384', '#36A2EB', '#FFCE56','#FF6384', '#36A2EB', '#FFCE56',],
  },
];

    ngOnInit(): void {
        this.filterForm.patchValue({
            dates: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
            condition: '',
            values: ['']
          });
    this.filterForm.valueChanges.subscribe(values => {
        console.log('Form values changed:', values);
      });
      let payload = {
        traineeId: this.traineeId,

      };
      this.service.getjobreportbystatus(payload).subscribe((response: ResponseDetails[]) => {
        console.log('Received response:', response);
        if (response && response.length > 0) {
          const activeJobs = response[0].ActiveJobs;
          const inactiveJobs = response[0].InactiveJobs;
  
          // Update chart data
          this.ChartData = [activeJobs, inactiveJobs];
        } else {
          // Handle empty response
          console.warn('No data received');
          this.ChartData = [0, 0]; // Default or empty values
        }
      });
    }

    ranges = [
      {
        value: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
        label: 'Last 7 Days'
      },
      {
        value: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
        label: 'Last 30 Days'
      },
      {
        value: [new Date(new Date().setDate(new Date().getDate() - 90)), new Date()],
        label: 'Last 90 Days'
      }
    ];
  

    public condition: any[] = [
        { value: 'is-one-of', name: 'Is One Of' },
        { value: 'is-not-one-of', name: 'Is Not One Of' },
      ];
    
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
      
      onValueChange(event: Date[]): void {
        if (event && event.length === 2) {
          // Extract date portion from ISO 8601 string
          this.startDate = event[0].toISOString().split('T')[0];
          this.endDate = event[1].toISOString().split('T')[0];
      
          console.log('Start Date:', this.startDate);
          console.log('End Date:', this.endDate);
        }
      }
      
      sortDate(): void {
        console.log('Applying filter with dates:', this.startDate, this.endDate);
        let data = {
          traineeId: this.traineeId,
          startDate: this.startDate,  
          endDate: this.endDate
        };
      
        console.log('Payload:', data);
      
        this.service.getjobreportbydate(data).subscribe((response: ResponseDetails[]) => {
          console.log('Received response:', response);
        });
      }
      

      public onExportPivotCSV() {
        const originalCsvData: string | undefined = this.gridApi.getDataAsCsv();
    
        if (!originalCsvData) {
            console.error('Failed to export original CSV data');
            return;
        }
    
        const originalRows = originalCsvData.split('\n');
        const rowCount = originalRows.length - 1;
    
        // Adding extra rows for spacing
        for (let i = 0; i < 3; i++) {
            originalRows.push('');
        }
    
        this.pivotData = this.generatePivotTableData(this.rowData);
    
        this.pivotColumnDefs = [
            { field: 'Active', headerName: 'Active' },
            { field: 'Inactive', headerName: 'Inactive' },
            { field: 'Counts', headerName: 'Counts' },
        ];
    
        const pivotCsvData = this.convertPivotDataToCSV(this.pivotData, this.pivotColumnDefs);
    
        const pivotRows = pivotCsvData.split('\n').filter(row => row.trim() !== '');
    
        // Combining original CSV data and pivot CSV data
        const combinedCsvData = pivotRows.join('\n') + '\n\n\n' + originalRows.join('\n');
    
        // Creating a blob and downloading the file
        const blob = new Blob([combinedCsvData], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'exported_data.csv'; // Set the filename here
        link.click();
    }
    
    public onExportChartCSV() {
      // Prepare CSV content
      const header = 'Label,Value\n';
      const rows = this.ChartLabels
        .map((label, index) => `${label},${this.ChartData[index]}`)
        .join('\n');
      const csvContent = header + rows;
    
      // Convert to Blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'chart-data.csv'; // Set the filename here
      link.click();
    }
    
    private generatePivotTableData(data: any[]): any[] {
        const pivotedData: any[] = [];
        const activeMap = new Map<string, any>();
        const inactiveMap = new Map<string, any>();

        for (const row of data) {
            const status = row['Status'];
            const key = status === 'Active' ? 'Active' : 'Inactive';

            if (key === 'Active') {
                if (activeMap.has(key)) {
                    activeMap.get(key).Counts += 1;
                } else {
                    activeMap.set(key, {
                        'Active': key,
                        'Inactive': '',
                        'Counts': 1
                    });
                }
            } else {
                if (inactiveMap.has(key)) {
                    inactiveMap.get(key).Counts += 1;
                } else {
                    inactiveMap.set(key, {
                        'Active': '',
                        'Inactive': key,
                        'Counts': 1
                    });
                }
            }
        }

        activeMap.forEach((value) => {
            pivotedData.push(value);
        });
        
        inactiveMap.forEach((value) => {
            pivotedData.push(value);
        });

        return pivotedData;
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