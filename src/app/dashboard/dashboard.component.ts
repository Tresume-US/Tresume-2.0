import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';
import { Chart } from 'chart.js';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, MultiDataSet, SingleDataSet, Color } from 'ng2-charts';
import { zip } from 'rxjs';
import { DashboardService, RequestItem } from './dashboard.service';
import { ResponseDetails, CardType } from './model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ReportsService } from '../reports/reports.service';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';


interface IRange {
  value: Date[];
  label: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DashboardService, ReportsService, MessageService, CookieService]
})
export class DashboardComponent implements OnInit {

  loading: boolean = false;

  public title = 'Tresume-NG';
  public traineeID: number = 5;
  public traineeDetails: any = {};
  public hidePlacementFields: boolean = true;
  public hideBenchFields: boolean = true;
  public hideLegalFields: boolean = true;
  public hideInterviewsFields: boolean = true;
  public hideSubmissionsFields: boolean = true;
  public hideFTCFields: boolean = true;
  public hideJBFields: boolean = true;

  public active_toogle = "dropdown_display";
  public isOpen: boolean = false;
  public doughnutChartData: SingleDataSet = [];
  public doughnutChartLabels: Label[] = [];
  public doughnutChart: any[] = [];

  public jobBoardChartData: SingleDataSet = [];
  public jobBoardChartLabels: Label[] = [];

  public jobBReqChartData: SingleDataSet = [];
  public jobReqChartLabels: Label[] = [];

  public complianceChartData: SingleDataSet = [];
  public complianceChartLabels: Label[] = [];

  public barChartData1: ChartDataSets[] = [];
  public legalChartData: ChartDataSets[] = [];

  public doughnutBenchChartData: SingleDataSet = [];
  public doughnutBenchChartLabels: Label[] = [];

  public doughnutSubChartData: SingleDataSet = [];
  public doughnutSubChartLabels: Label[] = [];

  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  public barChartLabels: Label[] = [''];
  public legalChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartType1: ChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public chartOptions: ChartOptions = {
    responsive: true,
    legend: {
      /* position: 'right', */
      display: this.hide(),
      fullWidth: false,
      position: this.position()
    }
  }
  recruiters = [
    { id: 1, name: 'Mark', count: 12 },
    { id: 2, name: 'Jacob', count: 15 },
    { id: 3, name: 'Larry', count: 20 },
    { id: 4, name: 'Larry', count: 20 },
    { id: 5, name: 'Larry', count: 20 },
    { id: 6, name: 'Larry', count: 20 },
    { id: 7, name: 'Larry', count: 20 },
    { id: 8, name: 'Larry', count: 20 },
    { id: 9, name: 'Larry', count: 20 },
    { id: 10, name: 'Larry', count: 20 },
    { id: 11, name: 'Larry', count: 20 },
    { id: 12, name: 'Larry', count: 20 },
    { id: 13, name: 'Larry', count: 20 },
    { id: 14, name: 'Larry', count: 20 },
    { id: 15, name: 'Larry', count: 20 }
  ];
  AccessOrg: string;
  adminFtcData: any;
  adminDsrData: any;
  adminPlacementData: any;
  PChartLabels: any;
  PChartData: { data: any; backgroundColor: string[]; }[];
  public routeLinks(route: string) {
    this.router.navigate(['reports/' + route])
  }
  public complianceChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      /* position: 'right', */
      display: this.hide(),
      fullWidth: false,
      position: this.position()
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem: any, data: any) => {
          return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
        }
      }
    }
  }

  position() {

    if (window.innerWidth < 1200) {
      return "bottom";
    }
    return "right";
  }
  hide() {

    if (window.innerWidth < 1200) {
      return false;
    }
    return true;
  }

  // Chart type
  chartType: string = 'bar';

  // Chart labels (assuming you have specific labels or you can use indices)
  chartLabels: string[] = [];

  // Chart data (FTC data)
  chartData: ChartDataSets[] = [
    { data: [], label: 'FTC Data' }
  ];
 // DSR Chart
 dsrChartLabels: Label[] = [];
 dsrChartData: ChartDataSets[] = [
   { data: [], label: 'DSR Data' }
 ];
  dsrChartColors: Color[] = [];
  chartColors: any[] = [];

  adminInterviewData: any[] = [];
  InterviewchartData: ChartDataSets[] = [{ data: [], label: 'Interviews' }];
  
  interviewChartLabels: string[] = [];
  interviewChartData: any[] = [];
  doughnutChartType = 'doughnut';
  interviewChartOptions: any = {}; 
  interviewChartColors: any[] = [];
  PlacementChartLabels: string[] = [];
  PlacementChartData: any[] = [];
  PlacementchartData: ChartDataSets[] = [{ data: [], label: 'Placement' }];
  FTCrecord() {
    this.loading = true;
    const req = {
      AccessOrg: this.AccessOrg,
      StartDate: this.defaultStartDate,
      EndDate: this.defaultEndDate
    };

    this.service.getAdminDashboardData(req).subscribe(
      (response: any) => {
        this.loading = false;
        this.hideInterviewsFields = false;
        this.adminFtcData = response.FtcData;
        this.chartLabels = this.adminFtcData.map((item: { Recruiter: any; }) => item.Recruiter);
        this.chartData[0].data = this.adminFtcData.map((item: { RecruiterCount: any; }) => item.RecruiterCount);
        console.log(this.chartData)
         this.chartColors = [{ backgroundColor: [
          '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F', 
          '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0'
        ] }]
        // DSR Data
        this.adminDsrData = response.DsrData;
        this.dsrChartLabels = this.adminDsrData.map((item: { Marketer: any; }) => item.Marketer);
        this.dsrChartData[0].data = this.adminDsrData.map((item: { SubmissionCount: any; }) => item.SubmissionCount);
        this.dsrChartColors =[{
          backgroundColor: [
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
          ]
        }];

         // Interview Data
         this.adminInterviewData = response.Interviewdata;
         this.interviewChartLabels = this.adminInterviewData.map((item: { Recruiter: any; }) => item.Recruiter);
         this.interviewChartData = [{
           data: this.adminInterviewData.map((item: { InterviewCount: any; }) => item.InterviewCount),
           backgroundColor: ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F']
         }];
         console.log(this.interviewChartData);

        // Placement Data
        this.adminPlacementData = response.PlacementData;
        this.PChartLabels = this.adminPlacementData.map((itm: { MarketerName: any; }) => itm.MarketerName);
         this.PChartData = [{
           data: this.adminPlacementData.map((itm: { MarketerCount: any; }) => itm.MarketerCount),
           backgroundColor: ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F']
         }];

        console.log(this.PlacementChartData);
      },
      (error: any) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Failed to Load Data' });
      }
    );
  }
    // Function to generate random colors
    // generateRandomColors(numColors: number): any[] {
    //   let colors = [];
    //   for (let i = 0; i < numColors; i++) {
    //     colors.push({
    //       backgroundColor: this.getRandomColor(),
    //       borderColor: this.getRandomColor(),
    //       hoverBackgroundColor: this.getRandomColor(),
    //       hoverBorderColor: this.getRandomColor()
    //     });
    //   }
    //   return colors;
    // }
  
    // // Function to generate a random hex color
    // getRandomColor(): string {
    //   return '#' + Math.floor(Math.random() * 16777215).toString(16); // Random color code
    // }
   
  

  // public chartColors: any[] = [
  //   { backgroundColor: ["#EA6A47", "#6F295B", "#c874b3", "#ff20c8", "#B9E8E0"] },
  //   { backgroundColor: ["#B9E8E0", "#ff20c8", "#c874b3", "#940571", "#665191"] }
  // ]
    public randomColor(numColors: number){
      const colors: string[] = [];
      for (let i = 0; i < numColors; i++) {
        const hexColor = '#' + Math.floor(Math.random() * 16777215).toString(16); 
        colors.push(hexColor);
      }
    
      return colors;
    }

  public doughnutChartData1: SingleDataSet = [
    [10, 22, 56],
  ];


  public barChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'right',
    },
    scales: {
      yAxes: [{
        stacked: false
      }],
      xAxes: [{
        stacked: false
      }]
    }
  };

  public interviewChartOptions1: ChartOptions = {
    responsive: true,
    legend: {
      position: 'right',
      display: false
    },
    scales: {
      yAxes: [{
        stacked: true
      }],
      xAxes: [{
        stacked: true
      }]
    }
  };
  

  public legalChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
      display: false
    },
    scales: {
      yAxes: [{
        stacked: true
      }],
      xAxes: [{
        stacked: true
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public barChartData: ChartDataSets[] = [
    { data: [65], label: 'H1-B' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Others' }
  ];

  public barchartColors: any[] = [
    { backgroundColor: ["#223175", "#327c2b", "#62b4f7", "#c874b3"] },
    { backgroundColor: ["#327c2b", "#940571", "#940571"] },
    { backgroundColor: ["#62b4f7", "#c874b3", "#c874b3"] },
    { backgroundColor: ["#c874b3", "#c874b3", "#c874b3"] },
    { backgroundColor: ["#44ea51", "#c874b3", "#c874b3"] }
  ]

  public InterviewchartColors: any[] = [
    { backgroundColor: ["#845EC2", "#845EC2", "#845EC2", "#845EC2", "#845EC2", "#845EC2", "#845EC2", "#B2DBBF", "#B2DBBF"] },
    { backgroundColor: ["#D65DB1", "#D65DB1", "#D65DB1", "#D65DB1", "#D65DB1", "#D65DB1", "#D65DB1", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FF9671", "#FF9671", "#FF9671", "#FF9671", "#FF9671", "#FF9671", "#FF9671", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FFC75F", "#FFC75F", "#FFC75F", "#FFC75F", "#FFC75F", "#FFC75F", "#FFC75F", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FFC75F", "#FFC75F", "#FFC75F", "#FFC75F", "#FFC75F", "#FFC75F", "#FFC75F", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#B2DBBF", "#F6D8AE"] },
    { backgroundColor: ["#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#FF6F91", "#B2DBBF", "#F6D8AE"] }

  ]

  public lineChartLabels: Label[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'right',
    }
  };
  public lineChartColors: Color[] = [
    {
      borderColor: '#940571',
      /* backgroundColor: ["#940571"], */
    },
    {
      borderColor: '#665191',
      /* backgroundColor: ["#665191"], */
    },
    {
      borderColor: '#c874b3',
      /* backgroundColor: ["#c874b3"] */
    },
  ];

  public lineChartData: ChartDataSets[] = [];
  public totalFTC: number = 0;
  public totalInterviews: number = 0;
  public totalSubmissions: number = 0;
  public defaultStartDate: string;
  public defaultEndDate: string;
  public currentDate: Date;
  public currentSD: string;
  public currentED: any;
  public lastMonthSD: string;
  public lastMonthED: any;
  public prevMonthED: any;
  public prevMonthSD: any;
  public next30days: any;
  public todayDate: any;
  public compliancePercentage: any;
  public totalCompleteProfiles: any;
  public totalIncompleteProfiles: any;

  public h1bexpcurrentMonth: any[] = [];

  bsConfig?: Partial<BsDatepickerConfig>;

  public ranges: IRange[] = [{
    value: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
    label: 'Last 7 Days'
  }, {
    value: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
    label: 'Last 30 Days'
  }, {
    value: [new Date(new Date().setDate(new Date().getDate() - 90)), new Date()],
    label: 'Last 90 Days'
  }];

  constructor(private route: ActivatedRoute, private service: DashboardService, private router: Router, private reportService: ReportsService, private messageService: MessageService, private cookieService: CookieService) {
    this.traineeID = this.route.snapshot.params["traineeId"];
    this.defaultStartDate = this.dateFormatter(this.ranges[1].value[0]);
    this.defaultEndDate = this.dateFormatter(this.ranges[1].value[1]);
    sessionStorage.setItem("Route", 'Dashboard');
    this.AccessOrg = this.cookieService.get('AccessOrg');


    /* this.currentMonthDates = ((new Date().setDate(new Date().getMonth(), new Date().getFullYear())));
    console.log('this.currentMonthDates', this.currentMonthDates) */

    this.currentDate = new Date(new Date());
    this.currentSD = this.dateFormatter(new Date(this.currentDate.getUTCFullYear(), this.currentDate.getUTCMonth(), 1));
    this.currentED = this.dateFormatter(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0));
    this.currentDate.toLocaleDateString('default', { month: 'long' })
    this.lineChartLabels[2] = new Date(this.currentED).toLocaleDateString('default', { month: 'long' });

    this.next30days = this.newDateFormatter(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0));
    this.prevMonthSD = this.dateFormatter(new Date(this.currentDate.getUTCFullYear(), this.currentDate.getUTCMonth() - 1, 1));
    this.prevMonthED = this.dateFormatter(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0));
    this.lineChartLabels[1] = new Date(this.prevMonthED).toLocaleDateString('default', { month: 'long' });

    this.todayDate = this.newDateFormatter(new Date(this.currentDate.getUTCFullYear(), this.currentDate.getUTCMonth(), 1));

    this.lastMonthSD = this.dateFormatter(new Date(this.currentDate.getUTCFullYear(), this.currentDate.getUTCMonth() - 2, 1));
    this.lastMonthED = this.dateFormatter(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 0));
    this.lineChartLabels[0] = new Date(this.lastMonthED).toLocaleDateString('default', { month: 'long' });

    var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';

  }

  ngOnInit() {
    this.loading = true;

    // this.getTraineeDetails();
    // this.getFTCDetails(this.defaultStartDate, this.defaultEndDate);
    // this.getPlacementDetails(this.defaultStartDate, this.defaultEndDate);
    // this.getBenchDetails(this.defaultStartDate, this.defaultEndDate);
    // this.getInterviewDetails(this.lastMonthSD, this.lastMonthED);
    // this.getSubmissionDetails(this.defaultStartDate, this.defaultEndDate);
    // this.getLegalInfo();
    // this.getH1BExpiry(this.todayDate, this.next30days);
    this.FTCrecord();
    // this.getSiteVistReport();
    // this.getJobBoardDetails();
    this.jobReqChartLabels = ['Rashi', 'Suchita', 'Ram'];
    this.jobBReqChartData = [3, 5, 8];

  }

  public getTraineeDetails() {
    let req = {
      traineeId: this.traineeID
    }
    this.service.getTraineeDetails(req).subscribe(x => {
      let response = x.result;
      if (response) {
        this.traineeDetails = response[0];
        sessionStorage.setItem("FirstName", this.traineeDetails.FirstName);
        sessionStorage.setItem("LastName", this.traineeDetails.LastName);
        sessionStorage.setItem("TraineeID", this.traineeID.toString());
      }
    });
  }

  public getFTCDetails(startDate?: string, endDate?: string) {
    let requestItem: RequestItem = {
      traineeID: this.traineeID,
      startDate: startDate,
      endDate: endDate
    }
    this.service.getFTC(requestItem).subscribe(x => {
      let response = x.result;
      if (response) {
        this.hideFTCFields = false;
        let countArray = response.map((y: any) => y.FTCCount);
        // this.totalFTC = countArray.reduce((sum: any, current: any) => sum + current);
        //Mariya code start
        this.totalFTC = countArray.reduce((sum: any, current: any) => sum + current, 0);
        this.doughnutChartData = response.map((y: any) => y.FTCCount).slice(0, 5);
        this.doughnutChartLabels = response.map((z: any) => z.RecruiterName).slice(0, 5);
      }
    });
  }

  public getPlacementDetails(startDate?: string, endDate?: string) {
    let requestItem: RequestItem = {
      traineeID: this.traineeID,
      startDate: startDate,
      endDate: endDate
    }
    this.service.getPlacements(requestItem).subscribe(x => {
      let response = x.result;
      if (response) {
        this.hidePlacementFields = false;
        let barData = response.map((y: any) => y.PlacemntCount).slice(0, 5);
        let barLabel = response.map((y: any) => y.MarkerterName).slice(0, 5);
        //this.barChartLabels = barLabel;
        this.barChartData1 = [];
        let contArry: any = [];
        for (let i = 0; i < 5; i++) {
          contArry.push({
            data: [barData[i]],
            label: barLabel[i]
          });
        }
        this.barChartData1 = contArry;
        /* requestItem.startDate = this.prevMonthSD;
        requestItem.endDate = this.prevMonthED;
        this.service.getPlacements(requestItem).subscribe(x => {
          let response = x.result;
          if (response) {
            this.hidePlacementFields = false;
            let barData = response.map((y: any) => y.PlacemntCount).slice(0, 5);
            let barLabel = response.map((y: any) => y.MarkerterName).slice(0, 5);
            for (let i = 0; i < 5; i++) {
              this.barChartData1[i].data?.push(barData[i]);
            }
          }
          this.barChartData1 = contArry;
          requestItem.startDate = this.currentSD;
          requestItem.endDate = this.currentED;
          this.service.getPlacements(requestItem).subscribe(x => {
            let response = x.result;
            if (response) {
              this.hidePlacementFields = false;
              let barData = response.map((y: any) => y.PlacemntCount).slice(0, 5);
              let barLabel = response.map((y: any) => y.MarkerterName).slice(0, 5);
              for (let i = 0; i < 5; i++) {
                this.barChartData1[i].data?.push(barData[i]);
              }
            }

          });
        }); */
      }
    });
  }

  public getBenchDetails(startDate?: string, endDate?: string) {
    let requestItem: RequestItem = {
      traineeID: this.traineeID,
      startDate: startDate,
      endDate: endDate
    }
    this.service.getBench(requestItem).subscribe(x => {
      let response = x.result;
      if (response) {
        this.hideBenchFields = false;
        this.doughnutBenchChartData = response.map((y: any) => y.BenchCount).slice(0, 5);
        this.doughnutBenchChartLabels = response.map((z: any) => z.MarketerName).slice(0, 5);
      }
    });
  }

  // public getInterviewDetails(startDate?: string, endDate?: string) {
  //   let requestItem: RequestItem = {
  //     traineeID: this.traineeID,
  //     startDate: startDate,
  //     endDate: endDate
  //   }
  //   this.service.getInterviews(requestItem).subscribe(x => {
  //     let response = x.result;
  //     if (response) {
  //       this.hideInterviewsFields = false;
  //       // let countArray = response.map((y: any) => y.PlacemntCount);
  //       // this.totalInterviews = countArray.reduce((sum: any, current: any) => sum + current);
  //       //Mariya code start
  //       // this.totalInterviews = countArray.reduce((sum: any, current: any) => sum + current, 0);
  //       //Mariya code end
  //       // let lineData = response.map((y: any) => y.PlacemntCount).slice(0, 5);
  //       // let lineLabel = response.map((y: any) => y.MarkerterName.split(" ")[0]).slice(0, 5);
  //       // this.lineChartData = [];
  //       // for (let i = 0; i < 5; i++) {
  //       //   this.lineChartData.push({
  //       //     data: [lineData[i]],
  //       //     label: lineLabel[i]
  //       //   });
  //       // }
  //       // requestItem.startDate = this.prevMonthSD;
  //       // requestItem.endDate = this.prevMonthED;
  //       // this.service.getInterviews(requestItem).subscribe(x => {
  //       //   let response = x.result;
  //       //   if (response) {
  //       //     this.hideInterviewsFields = false;
  //       //     let countArray = response.map((y: any) => y.PlacemntCount);
  //       //     // this.totalInterviews = countArray.reduce((sum: any, current: any) => sum + current);
  //       //     //Mariya code start
  //       //     this.totalInterviews = countArray.reduce((sum: any, current: any) => sum + current, 0);
  //       //     //Mariya code end
  //       //     let lineData = response.map((y: any) => y.PlacemntCount).slice(0, 5);
  //       //     let lineLabel = response.map((y: any) => y.MarkerterName.split(" ")[0]).slice(0, 5);
  //       //     for (let i = 0; i < 5; i++) {
  //       //       let filter = this.lineChartData.filter(x => x.label == lineLabel[i])[0];
  //       //       if (filter) {
  //       //         this.lineChartData[i].data?.push(lineData[i])
  //       //       }
  //       //       else {
  //       //         this.lineChartData.push({
  //       //           data: [lineData[i]],
  //       //           label: lineLabel[i]
  //       //         });
  //       //       }
  //       //     }
  //       //   }
  //       //   requestItem.startDate = this.currentSD;
  //       //   requestItem.endDate = this.currentED;
  //       //   this.service.getInterviews(requestItem).subscribe(x => {
  //       //     let response = x.result;
  //       //     if (response) {
  //       //       this.hideInterviewsFields = false;
  //       //       let countArray = response.map((y: any) => y.PlacemntCount);
  //       //       // this.totalInterviews = countArray.reduce((sum: any, current: any) => sum + current);
  //       //       //Mariya code start
  //       //       this.totalInterviews = countArray.reduce((sum: any, current: any) => sum + current, 0);
  //       //       //Mariya code end
  //       //       let lineData = response.map((y: any) => y.PlacemntCount).slice(0, 5);
  //       //       let lineLabel = response.map((y: any) => y.MarkerterName.split(" ")[0]).slice(0, 5);
  //       //       for (let i = 0; i < 5; i++) {
  //       //         let filter = this.lineChartData.filter(x => x.label == lineLabel[i])[0];
  //       //         if (filter) {
  //       //           this.lineChartData[i].data?.push(lineData[i])
  //       //         }
  //       //         else {
  //       //           this.lineChartData.push({
  //       //             data: [lineData[i]],
  //       //             label: lineLabel[i]
  //       //           });
  //       //         }
  //       //       }
  //       //       console.log('this.lineChartData', this.lineChartData)
  //       //       this.loading = false;

  //       //     }
  //       //   }),
  //       //     (error: any) => {
  //       //       // Error callback
  //       //       console.error('Error occurred:', error);
  //       //       // Handle error here
  //       //       this.loading = false; // Set loading to false on error
  //       //     };
  //       // });
  //     }
  //   });
  // }

  public getSubmissionDetails(startDate?: string, endDate?: string) {
    let requestItem: RequestItem = {
      traineeID: this.traineeID,
      startDate: startDate,
      endDate: endDate
    }
    this.service.getSubmissions(requestItem).subscribe(x => {
      let response = x.result;
      if (response) {
        let countArray = response.map((y: any) => y.BenchCount);
        // this.totalSubmissions = countArray.reduce((sum: any, current: any) => sum + current);
        //Mariya code start
        this.totalSubmissions = countArray.reduce((sum: any, current: any) => sum + current, 0);
        //Mariya code end
        if (this.totalSubmissions > 0) {
          this.hideSubmissionsFields = false;
        }
        this.doughnutSubChartData = response.map((y: any) => y.BenchCount).slice(0, 5);
        this.doughnutSubChartLabels = response.map((z: any) => z.MarketerName).slice(0, 5);
      }
    });
  }

  public getLegalInfo() {
    this.service.getLegalStatus(this.traineeID).subscribe(x => {
      let response = x.result;
      if (response) {
        this.hideLegalFields = false;
        let barData = response.map((y: any) => y.Total);
        let barLabel = response.map((y: any) => y.LegalStatus);
        let H1BStatus = response.filter((y: any) => y.LegalStatusID == 14)[0];
        let GCStatus = response.filter((y: any) => y.LegalStatusID == 3)[0];
        let USCStatus = response.filter((y: any) => y.LegalStatusID == 2)[0];
        let OtherStatus = response.filter((y: any) => y.LegalStatusID != 2 && y.LegalStatusID != 3 && y.LegalStatusID != 14);
        let TotalOtherStatus = 0;
        OtherStatus.forEach((x: any) => {
          TotalOtherStatus += x.Total;
        });
        this.legalChartLabels = ["H1B", "Green Card", "US Citizen", "Others"];
        this.legalChartData = [];
        this.legalChartData = [{
          data: [H1BStatus?.Total, GCStatus?.Total, USCStatus?.Total, TotalOtherStatus],
          label: 'Total'
        }];
      }
    });
  }

  public getJobBoardDetails(startDate?: string, endDate?: string) {
    let requestItem: RequestItem = {
      traineeID: this.traineeID
    }
    this.service.getJobBoardUsage().subscribe(x => {
      let response = x.result;
      console.log('jb', response)
      if (response) {
        this.hideJBFields = false;
        let countArray = response.map((y: any) => y.count);
        // this.totalFTC = countArray.reduce((sum: any, current: any) => sum + current);
        this.totalFTC = countArray.reduce((sum: any, current: any) => sum + current, 0);
        this.jobBoardChartData = response.map((y: any) => y.count).slice(0, 5);
        this.jobBoardChartLabels = response.map((z: any) => z.JobboardSource).slice(0, 5);
      }
    });
  }

  public toggle() {
    this.isOpen = !this.isOpen;
  }


  public onValueChange(value: any, type: CardType) {
    switch (type) {
      case CardType.FTC: {
        let startDate = this.dateFormatter(value[0]);
        let endDate = this.dateFormatter(value[1]);
        this.getFTCDetails(startDate, endDate);
        break;
      }
      case CardType.Placements: {
        let startDate = this.dateFormatter(value[0]);
        let endDate = this.dateFormatter(value[1]);
        this.getPlacementDetails(startDate, endDate);
        break;
      }
      case CardType.Bench: {
        let startDate = this.dateFormatter(value[0]);
        let endDate = this.dateFormatter(value[1]);
        this.getBenchDetails(startDate, endDate);
        break;
      }
      case CardType.Legal: {

        break;
      }
      case CardType.Interviews: {
        let startDate = this.dateFormatter(value[0]);
        let endDate = this.dateFormatter(value[1]);
        // this.getInterviewDetails(startDate, endDate);
        break;
      }
      case CardType.Submissions: {
        let startDate = this.dateFormatter(value[0]);
        let endDate = this.dateFormatter(value[1]);
        this.getSubmissionDetails(startDate, endDate);
        break;
      }
    }
  }

  public dateFormatter(value: any) {
    let formattedDate = formatDate(value, 'yyyy-MM-dd', "en-US");
    return formattedDate;
  }

  public newDateFormatter(value: any) {
    let formattedDate = formatDate(value, 'yyyy/MM/dd', "en-US");
    return formattedDate;
  }

  public getH1BExpiry(startDate?: string, endDate?: string) {
    let requestItem: any = {
      startDate: startDate,
      endDate: endDate,
      traineeId: this.traineeID,
    }
    this.reportService.getH1BExpiryReport(requestItem).subscribe((x: any) => {
      console.log('x', x)
      this.h1bexpcurrentMonth = x.result;
    });
  }

  public getSiteVistReport() {
    let requestItem: any = {
      traineeId: this.traineeID,
    }
    this.compliancePercentage = [];
    let groupArr: any = [];
    this.reportService.getSiteVisitReport(requestItem).subscribe((x: any) => {
      console.log('x', x)
      const nullValues = x.result.filter((value: any) => {
        const nullValues = Object.values(value).filter(value => (value === null || value === ""));
        this.compliancePercentage.push(Number(((12 - nullValues.length) / 12 * 100).toFixed(2)));
      }
      );
      this.compliancePercentage.filter((x: any) => {
        if (x == 100) {
          groupArr.push(x);
        }
      });
      this.totalCompleteProfiles = ((groupArr.length / this.compliancePercentage.length) * 100).toFixed(2);
      this.totalIncompleteProfiles = (((this.compliancePercentage.length - groupArr.length) / this.compliancePercentage.length) * 100).toFixed(2);
      this.complianceChartData = [this.totalCompleteProfiles, this.totalIncompleteProfiles];
      this.complianceChartLabels = ['100% Compliant', 'Non-compliant'];
    });
  }

  public expiryReportMore() {
    this.router.navigate(['/reports/h1bexpiry']);
  }

  public compReportMore() {
    this.router.navigate(['/reports/compliance']);
  }

}
