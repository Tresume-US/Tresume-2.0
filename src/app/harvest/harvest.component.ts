import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HarvestService } from './harvest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';

@Component({
  selector: 'app-harvest',
  templateUrl: './harvest.component.html',
  providers: [HarvestService, CookieService, MessageService],
  styleUrls: ['./harvest.component.scss'],

})
export class HarvestComponent implements OnInit {
  loading: boolean = false;
  public OrgID: any;
  public userName: any;
  public TraineeID: any;
  //Monster
  public mkeywords: string;
  public mJobdescription: string;
  public mJobTitle: string;
  public mLocation: string;
  public mRadius: string;
  public mLastupdated: string;
  public mdownlodlimit: number;
  public mshedule: string;
  //dice
  public dkeywords: string;
  public dminexp: string;
  public dmaxexp: string;
  public dJobTitle: string;
  public dLocation: string;
  public dRadius: string;
  public dLastupdated: string;
  public ddownlodlimit: number;
  public dshedule: string;
  public dJobdescription: string;
  //CB
  //dice
  public ckeywords: string;
  public cminexp: string;
  public cmaxexp: string;
  public cJobTitle: string;
  public cLocation: string;
  public cRadius: string;
  public cLastupdated: string;
  public cdownlodlimit: number;
  public cshedule: string;
  public cJobdescription: string;
  public harvestlist: any;
  currentResumeID: any;
  public resumeHTMLContent: string;
  visibleSidebar2: boolean = false;
  resultsFound: boolean = false;
  responseData: any;
  totalResults: any;
  rowData: any;
  showcrediterror: boolean = false;
  //division
  creditcount: number = 0;
  usedcount: number = 0;
  clientip: any;
  userName1: any;
  divID: any;
  jobID: any = 3;
  isallowed: any = true;
  divcandidateemail: any = '';
  currentTabIndex: any;
  tabIndex: any;
  dworkstatus: any;
  dEdudegree: any;
  drelocate: any;
  cSkill: any;
  cYrExp: any;
  cschool: any;
  cWrkStat: any;
  cHighEduDegree: any;
  crelocate: any;
  cSecurityClr: any;


  constructor(
    private cookieService: CookieService,
    private service: HarvestService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private location: Location
  ) {

  }

  onTabChange(tabIndex: number) {
    const tabLabels = ['', '', '', '', '', ''];
    this.currentTabIndex = 0;
    this.tabIndex = 0;

    if (tabIndex >= 0 && tabIndex < tabLabels.length) {
      this.currentTabIndex = tabIndex;
      this.tabIndex = tabIndex;
    }

    this.currentTabIndex = tabIndex;
    switch (tabIndex) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      default:
        break;
    }
  }


  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.userName = this.cookieService.get('userName1');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.fetchharvest();
    this.fetchcredit();
  }

  saveData() {
    // this.loading = true;
    switch (parseInt(this.currentTabIndex)) {
      case 0:
        this.OncreateMonster();
        break;
      case 1:
        this.OncreateDice();
        break;
      case 2:
        this.OncreateCB();
        break;
      default:
        console.error('Invalid tab index');
    }
  }


  OncreateMonster() {
    let Req = {
      recid: this.TraineeID,
      jobboardid: 3,
      keywords: this.mkeywords,
      jobtitle: this.mJobTitle,
      location: this.mLocation,
      radius: this.mRadius,
      Lastupdated: this.mLastupdated,
      scheduledtime: this.mshedule,
      downloadlimit: this.mdownlodlimit,
      status: 1,
      orgID: this.OrgID,
      job_description: this.mJobdescription,
      recemail: this.userName
    };
    console.log(Req);
    this.loading = true;

    this.service.addharvest(Req).subscribe((x) => {
      console.log('Inserted');
      for (let i = 0; i < this.mdownlodlimit; i++) {
        this.adddivisionaudit();
      }

      this.fetchharvest();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Harvest sheduled successfully.' });
      this.loading = false;
    });
  }

  OncreateDice() {
    let Req = {
      recid: this.TraineeID,
      jobboardid: 2,
      keywords: this.dkeywords,
      jobtitle: this.dJobTitle,
      location: this.dLocation,
      radius: this.dRadius,
      Lastupdated: this.dLastupdated,
      MinExp:this.dminexp,
      MaxExp:this.dmaxexp,
      WorkStat:this.dworkstatus,
      HighestEdu:this.dEdudegree,
      Relocate:this.drelocate,
      status: 1,
      orgID: this.OrgID,
      job_description: 1, // for monster only available
      recemail: this.userName,
      downloadlimit:this.ddownlodlimit,
      scheduledtime:this.dshedule
    };
    console.log(Req);
    this.loading = true;

    this.service.addharvest(Req).subscribe((x) => {
      console.log('Inserted');
      for (let i = 0; i < this.ddownlodlimit; i++) {
        this.adddivisionaudit();
      }

      this.fetchharvest();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Harvest sheduled successfully.' });
      this.loading = false;
    });
  }

  OncreateCB() {
    let Req = {
      recid: this.TraineeID,
      jobboardid: 4,
      keywords: this.ckeywords,
      jobtitle: this.cJobTitle,
      location: this.cLocation,
      radius: this.cRadius,
      Lastupdated: this.cLastupdated,
      skill:this.cSkill,
      yearExp:this.cYrExp,
      school:this.cschool,
      WorkStatus:this.cWrkStat,
      HighEduDegree:this.cHighEduDegree,
      Relocate:this.crelocate,
      SecurityClearance:this.cSecurityClr,
      job_description: this.mJobdescription, // for monster only available
      status: 1,
      orgID: this.OrgID,
      recemail: this.userName,
      downloadlimit:this.cdownlodlimit,
      scheduledtime:this.cshedule
    };
    console.log(Req);
    this.loading = true;

    this.service.addharvest(Req).subscribe((x) => {
      console.log('Inserted');
      for (let i = 0; i < this.mdownlodlimit; i++) {
        this.adddivisionaudit();
      }

      this.fetchharvest();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Harvest sheduled successfully.' });
      this.loading = false;
    });
  }

  public fetchharvest() {
    let Req = {
      OrgID: this.OrgID,
    };
    console.log(this.OrgID);
    this.service.fetchharvest(Req).subscribe((x: any) => {
      this.harvestlist = x.result;
      this.loading = false;

    });
  }

  public fetchharvestcandidate(harvestid: number) {
    // let Req = {
    //   harvestid: harvestid,

    // };
    // console.log(this.OrgID);
    // this.service.fetchharvestcandidate(Req).subscribe((x: any) => {
    //   let response = x.result;
    //   this.resultsFound = true;
    //   this.responseData = response;
    //   this.rowData = this.responseData.slice(0, 10);
    //   this.totalResults = this.responseData.length;
    // });
    this.router.navigate(['/harvestview', harvestid]);
  }
  public fetchcredit() {
    let Req = {
      userName: this.userName,
    };
    let type = 0;
    let divid = 0;
    this.service.fetchdvisioncredit(Req).subscribe((x: any) => {
      if (x.result.length == 0) {
        this.showcrediterror = true;
      } else {
        this.creditcount = x.result[0].monster;
        this.divID = x.result[0].id;
        console.log(this.creditcount)
        type = x.result[0].type;
        divid = x.result[0].id;

        let Req2 = {
          type: type,
          jobID: this.jobID,
          divid: divid
        };
        this.service.fetchusage(Req2).subscribe((x: any) => {

          console.log(x.result)
          this.usedcount = x.result[0].row_count;
          var count = this.creditcount - this.usedcount;
          if (count <= 0) {
            this.showcrediterror = true;
          }

        });
      }
    });

  }

  public adddivisionaudit() {
    let Req = {
      userName: this.userName,
      divID: this.divID,
      jobID: this.jobID,
      ipaddress: this.ipaddress,
      candidateemail: ''
    };
    this.service.adddivisionaudit(Req).subscribe((x: any) => {
      this.ipaddress = x.body;
      console.log(this.ipaddress)
    });

    this.fetchcredit();

  }

  public ipaddress() {
    let Req = {
      userName: this.userName,
    };
    this.service.getclientipaddress(Req).subscribe((x: any) => {
      this.ipaddress = x.body;
      console.log(this.ipaddress)
    });
  }

  public onInputChange(data: number) {
    var count = this.creditcount - this.usedcount;

    this.showcrediterror = data >= 1 && data <= count;

    console.log(this.showcrediterror);
  }

  public deleteHarvest(id: any, downloadlimit: any) {
    let Req = {
      harvestid: id,

    };

    this.service.deleteharvest(Req).subscribe((x: any) => {
      for (let i = 0; i < downloadlimit; i++) {
        this.deleteAudit(this.userName);
      }
      this.messageService.add({ severity: 'error', summary: 'Notification', detail: 'Your Harvest is deleted' });
    });
    this.fetchharvest();
    // setTimeout(() => {
    //   window.location.reload();
    // }, 5000);

  }

  public deleteAudit(userName: any) {

    let Req = {
      userName: userName,
    };
    this.service.deleteAudit(Req).subscribe((x: any) => {

    });

  }

}
