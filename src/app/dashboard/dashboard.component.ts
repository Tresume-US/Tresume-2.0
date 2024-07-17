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
  public  DiceChartData: any[] = [{ data: [] }];
  public jobReqChartLabels: Label[] = [];
  public DiceChartLabels: Label[] = [];
  public MonsterusedLabels: Label[] = [];
  public CBusedLabels: Label[] = [];

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
  totalFTCCount: number = 0;
  totalSubmissionCount: number = 0;
  totalInterviewCount: number = 0;
  totalPlacementCount: number = 0;
  totalMonsterCount: number = 0;
  totalCBCount: number = 0;
  totalDiceCount: number = 0;
  totalDiceUsed: number = 0;
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
  userDicedata: any[] = [];
  Monsterdata: any[] = [];
  userMonsterdata: any[] = [];
  CBdata: any[] = [];
  userCBdata: any[] = [];
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
        console.log('API Response:', response); // Log the response to check its structure
        if (this.checkFullAccess(1)) {
          this.loading = false;
          this.hideInterviewsFields = false;

          // Initialize Dicedata to an empty array if JobboardData is undefined
          this.Dicedata = response.jobboarddata || [];
          this.jobBReqChartData = this.Dicedata.map((item: { diceused: any; }) => item.diceused);
          this.jobReqChartLabels = this.Dicedata.map((item: { Recruiter: any; }) => `${item.Recruiter}`);
          this.totalDiceCount = this.Dicedata.reduce((sum: any, current: { diceused: any; }) => sum + (current.diceused || 0), 0);
          console.log(this.checkFullAccess(1));
          console.log('Dice :', this.Dicedata);

          this.CBdata = response.jobboarddata || [];
          this.totalCBCount = this.CBdata.reduce((sum: any, current: { cbused: any; }) => sum + (current.cbused || 0), 0);
          this.CBChartData = this.CBdata.map((item: { cbused: any; }) => item.cbused);
          this.CBChartLabels = this.CBdata.map((item: { Recruiter: any; }) => `${item.Recruiter}`);

          this.Monsterdata = response.jobboarddata || [];
          this.totalMonsterCount = this.Monsterdata.reduce((sum: any, current: { monsterused: any; }) => sum + (current.monsterused || 0), 0);
          this.MonsterChartData = this.Monsterdata.map((item: { monsterused: any; }) => item.monsterused);
          this.MonsterChartLabels = this.Monsterdata.map((item: { Recruiter: any; }) => `${item.Recruiter}`);
        }

        if (this.checkFullAccess(2)) {
          this.adminFtcData = response.FtcData || [];
          this.totalFTCCount = this.adminFtcData.reduce((sum: any, current: { RecruiterCount: any; }) => sum + (current.RecruiterCount || 0), 0);
          this.chartLabels = this.adminFtcData.map((item: { Recruiter: any; }) => item.Recruiter);
          this.chartData[0].data = this.adminFtcData.map((item: { RecruiterCount: any; }) => item.RecruiterCount);
          console.log(this.chartData);
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
          }];

          // DSR Data
          this.adminDsrData = response.DsrData || [];
          this.totalSubmissionCount = this.adminDsrData.reduce((sum: any, current: { SubmissionCount: any; }) => sum + (current.SubmissionCount || 0), 0);
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
          console.log('DSR data:',this.adminDsrData)

          // Interview Data
          this.adminInterviewData = response.Interviewdata || [];
          this.totalInterviewCount = this.adminInterviewData.reduce((sum: any, current: { InterviewCount: any; }) => sum + (current.InterviewCount || 0), 0);
          this.interviewChartLabels = this.adminInterviewData.map((item: { Recruiter: any; }) => item.Recruiter);
          this.interviewChartData = [{
            data: this.adminInterviewData.map((item: { InterviewCount: any; }) => item.InterviewCount),
            backgroundColor: ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
              '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
              '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
              '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
              '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F']
          }];

          // Placement Data
          this.adminPlacementData = response.PlacementData || [];
          this.hideInterviewsFields = false;
          this.totalPlacementCount = this.adminPlacementData.reduce((sum: any, current: { MarketerCount: any; }) => sum + (current.MarketerCount || 0), 0);

          this.PChartLabels = this.adminPlacementData.map((item: { MarketerName: any; }) => item.MarketerName);
          this.PChartData = [{
            data: this.adminPlacementData.map((item: { MarketerCount: any; }) => item.MarketerCount),
            backgroundColor: ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
              '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
              '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F']
          }];
        }
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
    this.userName = this.cookieService.get('userName1');
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
    this.fetchJobPostingData();
    if(this.UserRole == 1){
      this.Adminrecord();
      // this.fetchadminJobPostingData();

    }else if(this.UserRole ==2){
      this.Userrecord();
      // this.fetchuserJobPostingData();
    }else{
      this.SuperAdminrecord();
      // this.fetchsuperadminJobPostingData();
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
  
  public jobBReqChartDatas: any[] = [{ data: [], label: 'Dice Used' }];
  public MonsterchartData: any[] = [{ data: [], label: 'Monster Used' }];
  public CBchartData: any[] = [{ data: [], label: 'CB Used' }];

  Userrecord() {
    this.loading = true;
    const req = {
      traineeId: this.traineeID,
      StartDate: this.defaultStartDate,
      EndDate: this.defaultEndDate,
      username: this.userName
    };
  
    this.service.getUserDashboardData(req).subscribe(
      (response: any) => {
        this.loading = false;
        this.hideInterviewsFields = false;
  
        if (this.checkFullAccess(1)) {
          // Monster Data
          this.userMonsterdata = response.monsterData || [];
          this.MonsterusedLabels = this.userMonsterdata.map((item: { Date: any }) =>
            this.datePipe.transform(item.Date, 'MM-dd-yy') as string
          );
          this.MonsterchartData[0].data = this.userMonsterdata.map((item: { RecordCount: any }) => item.RecordCount);
          this.totalMonsterCount = this.userMonsterdata.reduce((sum: any, current: { RecordCount: any; }) => sum + (current.RecordCount || 0), 0);
  
          // Dice Data
          this.userDicedata = response.diceData || [];
          this.jobReqChartLabels = this.userDicedata.map((item: { Date: any }) =>
            this.datePipe.transform(item.Date, 'MM-dd-yy') as string
          );
          this.jobBReqChartDatas[0].data = this.userDicedata.map((item: { RecordCount: any }) => item.RecordCount);
          this.totalDiceUsed = this.userDicedata.reduce((sum: any, current: { RecordCount: any; }) => sum + (current.RecordCount || 0), 0);
  
          // CB Data
          this.userCBdata = response.cbData || [];
          this.CBusedLabels = this.userCBdata.map((item: { Date: any }) =>
            this.datePipe.transform(item.Date, 'MM-dd-yy') as string
          );
          this.CBchartData[0].data = this.userCBdata.map((item: { RecordCount: any }) => item.RecordCount);
          this.totalCBCount = this.userCBdata.reduce((sum: any, current: { RecordCount: any; }) => sum + (current.RecordCount || 0), 0);
        }
  
        if (this.checkFullAccess(2)) {
          // FTC Data
          this.UserFtcData = response.FtcData || [];
          this.totalFTCCount = this.UserFtcData.reduce((sum: any, current: { SubmissionCount: any; }) => sum + (current.SubmissionCount || 0), 0);
          this.FTCchartLabels = this.UserFtcData.map((item: { Date: any; }) =>
            this.datePipe.transform(item.Date, 'MM-dd-yy') as string
          );
          this.FTCchartData[0].data = this.UserFtcData.map((item: { SubmissionCount: any; }) => item.SubmissionCount);
  
          // DSR Data
          this.UserDSRData = response.DsrData || [];
          this.totalSubmissionCount = this.UserDSRData.reduce((sum: any, current: { RecordCount: any; }) => sum + (current.RecordCount || 0), 0);
          this.DSRchartLabelss = this.UserDSRData.map((item: { Date: any; }) =>
            this.datePipe.transform(item.Date, 'MM-dd-yy') as string
          );
          this.DSRchartDatas[0].data = this.UserDSRData.map((item: { RecordCount: any; }) => item.RecordCount);
          console.log('DSR Chart Data:', this.DSRchartDatas);
  
          // Interview Data
          this.UserInterviewData = response.Interviewdata || [];
          this.totalInterviewCount = this.UserInterviewData.reduce((sum: any, current: { InterviewCount: any; }) => sum + (current.InterviewCount || 0), 0);
          if (this.UserInterviewData.length) {
            this.InterviewchartLabels = this.UserInterviewData.map((item: { Date: any; }) =>
              this.datePipe.transform(item.Date, 'MM-dd-yy') as string
            );
            this.InterviewchartData[0].data = this.UserInterviewData.map((item: { InterviewCount: any; }) => item.InterviewCount);
          } else {
            this.InterviewchartLabels = [];
            this.InterviewchartData[0].data = [];
          }
  
          // Log Interview chart data
          console.log('Interview Chart Data:', this.InterviewchartData);
          console.log('Interview Chart Labels:', this.InterviewchartLabels);
  
          // Placements Data
          this.UserPlacementsData = response.PlacementData || [];
          this.totalPlacementCount = this.UserPlacementsData.reduce((sum: any, current: { MarketerCount: any; }) => sum + (current.MarketerCount || 0), 0);
          this.PlacementchartLabels = this.UserPlacementsData.map((item: { Date: any; }) =>
            this.datePipe.transform(item.Date, 'MM-dd-yy') as string
          );
          this.PlacementschartData[0].data = this.UserPlacementsData.map((item: { PlacementCount: any; }) => item.PlacementCount);
  
          console.log(this.chartData);
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
              '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F',
              '#F9F871', '#2C73D2', '#008E9B', '#008F7A', '#B39CD0',
            ]
          }];
          console.log(this.PlacementChartData);
        }
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
        if (this.checkFullAccess(1)) {
          this.Dicedata = response.Divisionwisecredit;
          this.DiceChartData = this.Dicedata.map((item: { diceused: any;}) => `${item.diceused}`);
          this.DiceChartLabels = this.Dicedata.map((item: { DivisionName: any; }) => item.DivisionName);

          this.CBdata = response.Divisionwisecredit;
          this.CBChartData = this.CBdata.map((item: { cbused: any; }) => item.cbused);
          this.CBChartLabels = this.CBdata.map((item: { DivisionName: any; }) => item.DivisionName);

          this.Monsterdata = response.Divisionwisecredit;
          this.MonsterChartData = this.Monsterdata.map((item: { monsterused: any; }) => item.monsterused);
          this.MonsterChartLabels = this.Monsterdata.map((item: { DivisionName: any; }) => item.DivisionName);
        }
        if(this.checkFullAccess(2)){
          this.adminFtcData = response.FtcData;
          this.chartLabels = this.adminFtcData.map((item: { Recruiter: any; }) => item.Recruiter);
          this.chartData[0].data = this.adminFtcData.map((item: { RecruiterCount: any; }) => item.RecruiterCount);
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
        }
      },
      (error: any) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Failed to Load Data' });
      }
    );
  }

  
  // public lineChartData: any[] = [
  //   { data: [1, 2, 3, 4, 5, 6, 7], label: 'Job Posting Record' }
  // ];

  // public joblineChartLabels: string[] = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  // public joblineChartOptions: any = {
  //   responsive: true,
  //   scales: {
  //     yAxes: [{
  //       ticks: {
  //         beginAtZero: true
  //       }
  //     }]
  //   }
  // };

  // public lineChartColors: any[] = [
  //   {
  //     backgroundColor: 'rgba(0, 0, 255, 0.2)',
  //     borderColor: 'blue',
  //     pointBackgroundColor: 'blue',
  //     pointBorderColor: '#fff',
  //     pointHoverBackgroundColor: '#fff',
  //     pointHoverBorderColor: 'blue'
  //   }
  // ];

  // public lineChartLegend = true;
  // public joblineChartType = 'line';

  public lineChartData: Array<any> = [{ data: [], label: 'Job Postings' }];
  public joblineChartLabels: Array<any> = [];
  joblineChartOptions: any = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: false,
          suggestedMin: 1,
          suggestedMax: 10,
          stepSize: 1
        }
      }]
    }
  };
  public lineChartColors: any[] = [
    {
      backgroundColor: 'rgba(0, 0, 255, 0.2)',
      borderColor: 'blue',
      pointBackgroundColor: 'blue',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'blue'
    }
  ];
  public lineChartLegend: boolean = true;
  public joblineChartType: string = 'line';


  // fetchuserJobPostingData() {
  //   this.loading = true;
  //   const req = {
  //     traineeid: 39950,
  //     StartDate: '2024-05-19',
  //     EndDate: '2024-06-18',
  //     // traineeid: this.traineeID,
  //     // StartDate: this.defaultStartDate,
  //     // EndDate: this.defaultEndDate,
  //     userName: this.userName,
  //   };

  //   this.service.getUserJobPostingData(req).subscribe(data => {
  //     const labels: any[] = [];
  //     const counts: any[] = [];
  //     const weekdays = this.calculateWeekdays(new Date(req.StartDate), new Date(req.EndDate));
  //     weekdays.forEach((date: Date) => {
  //       const formattedDate = this.datePipe.transform(date, 'MM/dd/yyyy');
  //       labels.push(formattedDate);
  //       counts.push(0);
  //     });
  //     data.forEach(item => {
  //       const formattedDate = this.datePipe.transform(item.CreateDate, 'MM/dd/yyyy');
  //       const index = labels.indexOf(formattedDate);
  //       if (index !== -1) {
  //         counts[index] += item.RecruitmentManagerCount;
  //       }
  //     });
  //     this.lineChartData = [{ data: counts, label: 'Job Postings' }];
  //     this.joblineChartLabels = labels;
  //     this.loading = false;
  //   }, error => {
  //     console.error('Error fetching job posting data:', error);
  //     this.loading = false;
  //   });
  // }

  calculateWeekdays(startDate: Date, endDate: Date): Date[] {
    const weekdays: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { 
        weekdays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return weekdays;
  }


  // fetchadminJobPostingData() {
  //   this.loading = true;
  //   const req = {
  //     traineeid: 39950,
  //     StartDate: '2024-05-20',
  //     EndDate: '2024-06-04',
  //     userName: this.userName,
  //     AccessOrg: "82,152,158",
  //      // AccessOrg: this.AccessOrg,
  //       // traineeid: this.traineeID,
  //     // StartDate: this.defaultStartDate,
  //     // EndDate: this.defaultEndDate,
  //   };
  
  //   console.log(req);
  
  //   this.service.getAdminJobPostingData(req).subscribe(
  //     data => {
  //       const labels: any[] = [];
  //       const counts: any[] = [];
  //       const nameCounts: { [key: string]: number } = {};
  
  //       data.forEach(item => {
  //         const name = `${item.firstname} ${item.lastname}`;
  //         if (!nameCounts[name]) {
  //           nameCounts[name] = 0;
  //         }
  //         nameCounts[name] += item.RecruitmentManagerCount;
  //       });
  
  //       for (const name in nameCounts) {
  //         if (nameCounts.hasOwnProperty(name)) {
  //           labels.push(name);
  //           counts.push(nameCounts[name]);
  //         }
  //       }
  
  //       this.lineChartData = [{ data: counts, label: 'Job Postings' }];
  //       this.joblineChartLabels = labels;
  //       this.loading = false;
  //     },
  //     error => {
  //       console.error('Error fetching job posting data:', error);
  //       this.loading = false;
  //     }
  //   );
  // }
  
  // fetchsuperadminJobPostingData() {
  //   this.loading = true;
  //   const req = {
  //     traineeid: 39950,
  //     StartDate: '2023-02-01',
  //     EndDate: '2024-06-20',
  //     userName: this.userName,
  //     AccessOrg: "82,152,158",
  //      // AccessOrg: this.AccessOrg,
  //       // traineeid: this.traineeID,
  //     // StartDate: this.defaultStartDate,
  //     // EndDate: this.defaultEndDate,
  //   };
  
  //   console.log(req);
  
  //   this.service.getSuperAdminJobPostingData(req).subscribe(
  //     data => {
  //       const labels: any[] = [];
  //       const counts: any[] = [];
  //       const nameCounts: { [key: string]: number } = {};
  
  //       data.forEach(item => {
  //         const name = `${item.OrganizationName}`;
  //         if (!nameCounts[name]) {
  //           nameCounts[name] = 0;
  //         }
  //         nameCounts[name] += item.RecruitmentManagerCount;
  //       });
  
  //       for (const name in nameCounts) {
  //         if (nameCounts.hasOwnProperty(name)) {
  //           labels.push(name);
  //           counts.push(nameCounts[name]);
  //         }
  //       }
  
  //       this.lineChartData = [{ data: counts, label: 'Job Postings' }];
  //       this.joblineChartLabels = labels;
  //       this.loading = false;
  //     },
  //     error => {
  //       console.error('Error fetching job posting data:', error);
  //       this.loading = false;
  //     }
  //   );
  // }


  fetchJobPostingData() {
    this.loading = true;
  
    const req = {
      traineeid: this.traineeID,
      StartDate: this.defaultStartDate,
      EndDate: this.defaultEndDate,
      userName: this.userName,
      AccessOrg: this.AccessOrg,
      userRole:this.UserRole
    };
  
    // if (this.UserRole == 1) {
    //   req.StartDate = '2024-05-20';
    //   req.EndDate = '2024-06-04';
    // } else if (this.UserRole == 2) {
    //   req.StartDate = '2023-02-01';
    //   req.EndDate = '2024-06-20';
    // }
    console.log(req);
  
    this.service.getJobPostingData(req).subscribe(
      data => {
        const labels: any[] = [];
        const counts: any[] = [];
  
       if (this.UserRole == 1) {
          // Admin functionality
          const nameCounts: { [key: string]: number } = {};
          data.forEach(item => {
            const name = `${item.firstname} ${item.lastname}`;
            if (!nameCounts[name]) {
              nameCounts[name] = 0;
            }
            nameCounts[name] += item.RecruitmentManagerCount;
            
          });
          for (const name in nameCounts) {
            if (nameCounts.hasOwnProperty(name)) {
              labels.push(name);
              counts.push(nameCounts[name]);
            }
          }
        }
        if (this.UserRole == 2) {
          // Regular user functionality
          const weekdays = this.calculateWeekdays(new Date(req.StartDate), new Date(req.EndDate));
          weekdays.forEach((date: Date) => {
            const formattedDate = this.datePipe.transform(date, 'MM/dd/yyyy');
            labels.push(formattedDate);
            counts.push(0);
          });
          data.forEach(item => {
            const formattedDate = this.datePipe.transform(item.CreateDate, 'MM/dd/yyyy');
            const index = labels.indexOf(formattedDate);
            if (index !== -1) {
              counts[index] += item.RecruitmentManagerCount;
            }
          });
        } 
        else if (this.UserRole == 3) {
          // Superadmin functionality
          const nameCounts: { [key: string]: number } = {};
          data.forEach(item => {
            const name = `${item.OrganizationName}`;
            if (!nameCounts[name]) {
              nameCounts[name] = 0;
            }
            nameCounts[name] += item.RecruitmentManagerCount;
          });
          for (const name in nameCounts) {
            if (nameCounts.hasOwnProperty(name)) {
              labels.push(name);
              counts.push(nameCounts[name]);
            }
          }
        }
  
        this.lineChartData = [{ data: counts, label: 'Job Postings' }];
        this.joblineChartLabels = labels;
        this.loading = false;
      },
      error => {
        console.error('Error fetching job posting data:', error);
        this.loading = false;
      }
    );
  }
  
}
