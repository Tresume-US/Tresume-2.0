import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, MultiDataSet, SingleDataSet, Color } from 'ng2-charts';
import { DashboardService, RequestItem } from './dashboard.service';
import { ReportsService } from '../reports/reports.service';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { Console } from 'console';

interface IRange {
  value: Date[];
  label: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DashboardService, ReportsService, MessageService, CookieService,DatePipe]
})
export class DashboardComponent implements OnInit {

  loading: boolean = false;

  public title = 'Tresume-NG';
  public traineeID: number = 5;
  public hideInterviewsFields: boolean = true;
  public jobBReqChartData: SingleDataSet = [];
  public jobReqChartLabels: Label[] = [];

  public CBChartData: SingleDataSet = [];
  public CBChartLabels: Label[] = [];

  public MonsterChartData: SingleDataSet = [];
  public MonsterChartLabels: Label[] = [];
  public chartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: this.hide(),
      fullWidth: false,
      position: this.position()
    }
  }
  AccessOrg: string;
  adminFtcData: any;
  adminDsrData: any;
  adminPlacementData: any;
  UserFtcData: any;
  UserDsrData: any;
  UserPlacementData: any;
  PChartLabels: any;
  PChartData: any;
  userName: any;
  IsAdmin: any;
  UserRole: any;
  UserDSRData: any;
  UserInterviewData: any;
  UserPlacementsData: any;
  FullAccess: string;
  ViewOnly: string;
  public routeLinks(route: string) {
    this.router.navigate(['reports/' + route])
  }
  public complianceChartOptions: ChartOptions = {
    responsive: true,
    legend: {
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

  chartType: string = 'bar';
  chartLabels: string[] = [];
  chartData: ChartDataSets[] = [
    { data: [], label: 'FTC Data' }
  ];
  dsrChartLabels: Label[] = [];
  dsrChartData: ChartDataSets[] = [
    { data: [], label: 'DSR Data' }
  ];
  dsrChartColors: Color[] = [];
  chartColors: any[] = [];

  adminInterviewData: any[] = [];
  Dicedata: any[] = [];
  Monsterdata: any[] = [];
  CBdata: any[] = [];
  InterviewchartData: ChartDataSets[] = [{ data: [], label: 'Interviews' }];

  interviewChartLabels: string[] = [];
  interviewChartData: any[] = [];
  doughnutChartType = 'doughnut';
  pieChartType = 'pie';
  interviewChartOptions: any = {};
  interviewChartColors: any[] = [];
  PlacementChartLabels: string[] = [];
  PlacementChartData: any[] = [];
  PlacementchartData: ChartDataSets[] = [{ data: [], label: 'Placement' }];

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

  Adminrecord() {
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
        this.chartColors = [{
          backgroundColor: [
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
          ]
        }]
        // DSR Data
        this.adminDsrData = response.DsrData;
        this.dsrChartLabels = this.adminDsrData.map((item: { Marketer: any; }) => item.Marketer);
        this.dsrChartData[0].data = this.adminDsrData.map((item: { SubmissionCount: any; }) => item.SubmissionCount);
        this.dsrChartColors = [{
          backgroundColor: [
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
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
        this.hideInterviewsFields = false;

        this.PChartLabels = this.adminPlacementData.map((item: { MarketerName: any; }) => item.MarketerName);
        this.PChartData = [{
          data: this.adminPlacementData.map((item: { MarketerCount: any; }) => item.MarketerCount),
          backgroundColor: ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F']
        }];
        console.log('Placement Data:',this.PChartData );

        this.Dicedata = response.JobboardData;
        this.jobBReqChartData = this.Dicedata.map((item: { diceused: any; }) => item.diceused);
        this.jobReqChartLabels = this.Dicedata.map((item: { FirstName: any; LastName: any; }) => `${item.FirstName} ${item.LastName}`);

        this.CBdata = response.JobboardData;
        this.CBChartData = this.CBdata.map((item: { cbused: any; }) => item.cbused);
        this.CBChartLabels = this.CBdata.map((item: { FirstName: any; LastName: any; }) => `${item.FirstName} ${item.LastName}`);

        this.Monsterdata = response.JobboardData;
        this.MonsterChartData = this.Monsterdata.map((item: { monsterused: any; }) => item.monsterused);
        this.MonsterChartLabels = this.Monsterdata.map((item: { FirstName: any; LastName: any; }) => `${item.FirstName} ${item.LastName}`);

        console.log(this.PlacementChartData);
      },
      (error: any) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Failed to Load Data' });
      }
    );
  }

  public randomColor(numColors: number) {
    const colors: string[] = [];
    for (let i = 0; i < numColors; i++) {
      const hexColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      colors.push(hexColor);
    }

    return colors;
  }

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

  constructor(private route: ActivatedRoute, private service: DashboardService, private router: Router, private reportService: ReportsService, private messageService: MessageService, private cookieService: CookieService,private datePipe: DatePipe) {
    this.traineeID = this.route.snapshot.params["traineeId"];
    this.defaultStartDate = this.dateFormatter(this.ranges[1].value[0]);
    this.defaultEndDate = this.dateFormatter(this.ranges[1].value[1]);
    sessionStorage.setItem("Route", 'Dashboard');
    this.AccessOrg = this.cookieService.get('AccessOrg');
    this.userName = this.route.snapshot.params["userName1"];
    this.IsAdmin = this.cookieService.get('IsAdmin');
    this.UserRole = this.cookieService.get('UserRole');
    this.FullAccess = this.cookieService.get('FullAccess');
    this.ViewOnly = this.cookieService.get('ViewOnly');

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
    if(this.UserRole == 1){
      this.Adminrecord();
    }else if(this.UserRole ==2){
      this.Userrecord();
    }else{
      this.SuperAdminrecord();
    }
  }

  checkFullAccess(numberToCheck: any): boolean {
    return this.FullAccess.includes(numberToCheck) || this.ViewOnly.includes(numberToCheck);
  }

  public dateFormatter(value: any) {
    let formattedDate = formatDate(value, 'yyyy-MM-dd', "en-US");
    return formattedDate;
  }

  public newDateFormatter(value: any) {
    let formattedDate = formatDate(value, 'yyyy/MM/dd', "en-US");
    return formattedDate;
  }
  // For User 
  public lineChartType: ChartType = 'line';
  public FTCchartData: any[] = [{ data: [], label: 'FTC Records' }];
  public FTCchartLabels: string[] = [];


  public DSRchartDatas: ChartDataSets[] = [{ data: [], label: 'DSR Data' }];
  public DSRchartLabelss: Label[] = [];

  public InterviewschartData: ChartDataSets[] = [{ data: [], label: 'Interview Data' }];
  public InterviewchartLabels: Label[] = [];

  public PlacementschartData: ChartDataSets[] = [{ data: [], label: 'Placement Data' }];
  public PlacementchartLabels: Label[] = [];

  Userrecord() {
    this.loading = true;
    const req = {
      traineeId: this.traineeID,
      StartDate: this.defaultStartDate,
      EndDate: this.defaultEndDate,
      username:this.userName
    };

    this.service.getUserDashboardData(req).subscribe(
      (response: any) => {
        this.loading = false;
        this.hideInterviewsFields = false;
        //FTC
        this.UserFtcData = response.FtcData;
        this.FTCchartLabels = this.UserFtcData.map((item: { Date: any; }) =>
          this.datePipe.transform(item.Date, 'MM-dd-yy') as string
        );
        this.FTCchartData[0].data = this.UserFtcData.map((item: { SubmissionCount: any; }) => item.SubmissionCount);
        console.log('FTC Chart : '+ this.UserFtcData)
        //DSR
        this.UserDSRData = response.DsrData; // Ensure this is the correct response property
        this.DSRchartLabelss = this.UserDSRData.map((item: { Date: any; }) =>
          this.datePipe.transform(item.Date, 'MM-dd-yy') as string
        );
        this.DSRchartDatas[0].data = this.UserDSRData.map((item: { SubmissionCount: any; }) => item.SubmissionCount);
        console.log('DSR Chart Data:', this.DSRchartDatas);
        //Interview

        if (response.Interviewdata) {
          this.UserInterviewData = response.Interviewdata;
          if (this.UserInterviewData.length) {
            this.InterviewchartLabels = this.UserInterviewData.map((item: { Date: any; }) =>
              this.datePipe.transform(item.Date, 'MM-dd-yy') as string
            );
            this.InterviewchartData[0].data = this.UserInterviewData.map((item: { InterviewCount: any; }) => item.InterviewCount);
          } else {
            this.InterviewchartLabels = [];
            this.InterviewchartData[0].data = [];
          }
        } else {
          this.UserInterviewData = [];
          this.InterviewchartLabels = [];
          this.InterviewchartData[0].data = [];
        }
  
        // Log Interview chart data
        console.log('Interview Chart Data:', this.InterviewchartData);
        console.log('Interview Chart Labels:', this.InterviewchartLabels);
  
        // Similar processing for other data sets...
  
        //Placements
        this.UserPlacementsData = response.PlacementData;
        this.PlacementchartLabels = this.UserPlacementsData.map((item: { Date: any; }) => 
          this.datePipe.transform(item.Date, 'MM-dd-yy') as string
        );
        this.PlacementschartData[0].data = this.UserPlacementsData.map((item: { PlacementCount: any; }) => item.PlacementCount);

        console.log(this.chartData)
        this.chartColors = [{
          backgroundColor: [
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
          ]
        }]
       
        console.log(this.PlacementChartData);
      },
      (error: any) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Failed to Load Data' });
      }
    );
  }

  SuperAdminrecord() {
    this.loading = true;
    const req = {
      AccessOrg: this.AccessOrg,
      StartDate: this.defaultStartDate,
      EndDate: this.defaultEndDate
    };

    this.service.getSuperAdminDashboardData(req).subscribe(
      (response: any) => {
        this.loading = false;
        this.hideInterviewsFields = false;
        this.adminFtcData = response.FtcData;
        this.chartLabels = this.adminFtcData.map((item: { Recruiter: any; }) => item.Recruiter);
        this.chartData[0].data = this.adminFtcData.map((item: { RecruiterCount: any; }) => item.RecruiterCount);
        console.log(this.chartData)
        this.chartColors = [{
          backgroundColor: [
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
          ]
        }]
        // DSR Data
        this.adminDsrData = response.DsrData;
        this.dsrChartLabels = this.adminDsrData.map((item: { Marketer: any; }) => item.Marketer);
        this.dsrChartData[0].data = this.adminDsrData.map((item: { SubmissionCount: any; }) => item.SubmissionCount);
        this.dsrChartColors = [{
          backgroundColor: [
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
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
        this.hideInterviewsFields = false;

        this.PChartLabels = this.adminPlacementData.map((item: { MarketerName: any; }) => item.MarketerName);
        this.PChartData = [{
          data: this.adminPlacementData.map((item: { MarketerCount: any; }) => item.MarketerCount),
          backgroundColor: ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
            '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F']
        }];
        console.log('Placement Data:',this.PChartData );

        this.Dicedata = response.JobboardData;
        this.jobBReqChartData = this.Dicedata.map((item: { diceused: any; }) => item.diceused);
        this.jobReqChartLabels = this.Dicedata.map((item: { FirstName: any; LastName: any; }) => `${item.FirstName} ${item.LastName}`);

        this.CBdata = response.JobboardData;
        this.CBChartData = this.CBdata.map((item: { cbused: any; }) => item.cbused);
        this.CBChartLabels = this.CBdata.map((item: { FirstName: any; LastName: any; }) => `${item.FirstName} ${item.LastName}`);

        this.Monsterdata = response.JobboardData;
        this.MonsterChartData = this.Monsterdata.map((item: { monsterused: any; }) => item.monsterused);
        this.MonsterChartLabels = this.Monsterdata.map((item: { FirstName: any; LastName: any; }) => `${item.FirstName} ${item.LastName}`);

        console.log(this.PlacementChartData);
      },
      (error: any) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Failed to Load Data' });
      }
    );
  }
}
