import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
  GridOptions,
  ColDef,
  RowNode,
  Column,
  GridApi,
} from 'ag-grid-community';
import { JobBoardsService } from './job-boards.service';
import { CookieService } from 'ngx-cookie-service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import * as FileSaver from 'file-saver';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as html2pdf from 'html2pdf.js';

const b64toBlob = (b64Data: any, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

@Component({
  selector: 'app-search-dice-resumes',
  templateUrl: './search-dice-resumes.component.html',
  providers: [JobBoardsService, CookieService, MessageService],
  styleUrls: ['./search-resumes.component.scss'],
})
export class SearchResumesDiceComponent implements OnInit {
  @ViewChild('pdfdoc') pdfdoc: ElementRef;

  form = new FormGroup({});
  form1 = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'keyword',
      type: 'input',
      templateOptions: {
        label: 'Job Title',
        placeholder: 'Search jobs, keywords, companies',
        required: true,
      },
    },
    {
      key: 'jobDesc',
      type: 'textarea',
      templateOptions: {
        label: 'Job Description',
        placeholder: 'Enter Job Description',
        required: true,
        rows: 5,
      },
    },
  ];

  fieldBool: FormlyFieldConfig[] = [
    {
      key: 'boolean',
      type: 'input',
      templateOptions: {
        label: 'Keyword',
        placeholder: 'Search boolean query',
        required: true,
      },
    },
  ];

  states: any[] = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Dakota',
    'North Carolina',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'Washington DC',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
    //canada
    'Ontario',
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
    'Northwest Territories',
    'Nunavut',
    'Yukon',
  ];

  workStatus: any[] = [
    { value: 'CTAY', name: 'Can work for any employer' },
    { value: 'CTCT', name: 'US Citizen' },
    { value: 'CTEM', name: 'H1 Visa' },
    { value: 'CTGR', name: 'Green Card Holder' },
    { value: 'CTNO', name: 'Need H1 Visa Sponsor' },
    { value: 'CTNS', name: 'Not Specified' },
    { value: 'EATN', name: 'TN Permit Holder' },
    { value: 'EAEA', name: 'Employment Authorization Document' },
  ];

  educationDegree: any[] = [
    { value: 'Vocational', name: 'Vocational' },
    { value: 'High School', name: 'High School' },
    { value: 'Associate', name: 'Associate Degree' },
    { value: 'Bachelors', name: "Bachelor's Degree" },
    { value: 'Masters', name: "Master's Degree" },
    { value: 'Doctorate', name: 'Doctorate' },
  ];

  workPermit: any[] = [
    { value: 'us citizenship', name: 'US Citizenship' },
    { value: 'green card', name: 'Green Card' },
    { value: 'employment auth document', name: 'Employment Auth Document' },
    { value: 'have h1', name: 'Have h1' },
    { value: 'need h1', name: 'Need h1' },
    { value: 'canadian citizen', name: 'Canadian Citizen' },
    { value: 'tn permit holder', name: 'tn permit holder' },
  ];

  rowData: any;
  columnDefs: any;
  public gridOptions: GridOptions = {};
  public gridApi: GridApi;
  public selectedState: string;
  public resumeHTMLContent: string;
  traineeId: string | null;
  private cookieValue: any;
  modalRef?: BsModalRef;
  loggedTraineeId: any;
  skills: any[] = [];
  resultsFound: boolean = false;
  loading: boolean = false;
  searchRequestItem: CBSearchRequestItem = {};
  daysWithin: number;
  searchSkill: string;
  yearsOfExp: number;
  yearsOfExpmin: number;
  schoolName: string;
  willingToRelocate: boolean;
  hasSecurityClearance: boolean;
  selectedWorkstatus: any[] = [];
  selectedEducationDegree: any;
  searchType: SearchType = SearchType.jobDetail;
  visibleSidebar2: boolean = false;
  fileReady: boolean = false;
  application: any;
  isPDFSrc: boolean = false;
  objUrl: SafeHtml;
  Htmlresumetopdf: string;
  componentInitialized: boolean;
  currentResumeResp: any;
  migratedProfiles: any[] = [];
  migratedResumeID: any;

  selectedWorkPermit: any[] = [];
  onlyWithSecurityClearance: boolean;
  workPermitDocuments: any;
  isscocialprofiles: boolean;
  @ViewChild('lgModal', { static: false }) lgModal?: ModalDirective;
  @ViewChild('pdfTable', { static: false }) pdfTable: ElementRef;
  accessToken: any;
  totalResults: any;
  quota: any;

  //division
  creditcount1: any = 0;
  usedcount1: any = 0;
  clientip: any;
  OrgID1: any;
  userName1: any;
  TraineeID1: any;
  divID1: any;
  jobID1: any = 2;
  isallowed: any = true;
  divcandidateemail: any = '';
  availablecredits: any = 0;
  showcrediterror: boolean = false;
  jobTitle: string = '';

  cfullname: string = '';
  clocation: string = '';
  cphone: string = '';
  cworkpermit: string = '';
  cyearsofExperience: string = '';
  cjobtitle: string = '';
  csocialsource: any[] = [];
  cskill: any[] = [];
  cemail: string = '';
  ccurrentExperience: any[] = [];
  coldExperience: any[] = [];
  ceducation: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private service: JobBoardsService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    this.traineeId = sessionStorage.getItem('TraineeID');
  }

  ngOnInit(): void {
    this.cookieValue = this.cookieService.get('userName1');
    this.OrgID1 = this.cookieService.get('OrgID');
    this.userName1 = this.cookieService.get('userName1');
    this.TraineeID1 = this.cookieService.get('TraineeID');

    // this.OrgID1 = 9;
    // this.userName1 = 'karthik@tresume.us';
    // this.TraineeID1 = 36960;
    // this.traineeId = '36960';
    // this.jobID1 = 2;

    this.initGrid();
    let request = '';
    this.service.getDiceToken().subscribe((x: any) => {
      if (x) {
        this.accessToken = x.access_token;
      }
    });
    console.log(this.traineeId);
    let migrateCheckReq = {
      source: 'Dice',
      traineeId: this.traineeId,
    };
    this.service
      .checkIfProfileMigrated(migrateCheckReq)
      .subscribe((response: any) => {
        this.migratedProfiles = response;
      });

    this.fetchcredit();
    this.ipaddress();
  }

  public initGrid() {
    let cellRendererFn = function (params: any): any {
      return null;
    };
    this.columnDefs = [
      {
        headerName: 'Source',
        field: 'Source',
        sortable: true,
        resizable: true,
        filter: true,
      },
      {
        headerName: 'Name',
        field: 'FullName',
        sortable: true,
        resizable: true,
        filter: true,
      },
      {
        headerName: 'Years of Exp',
        field: 'YRSEXP',
        sortable: true,
        resizable: true,
        valueFormatter: this.yearsRender.bind(this),
        filter: true,
      },
      {
        headerName: 'Location',
        field: 'CurrentLocation',
        sortable: true,
        resizable: true,
        filter: true,
      },
      {
        headerName: 'Legal Status',
        field: 'LegalStatus',
        sortable: true,
        resizable: true,
        filter: true,
      },
      {
        headerName: 'Title',
        field: 'TraineeTitle',
        sortable: true,
        resizable: true,
        filter: true,
      },
      {
        headerName: 'Last Update',
        field: 'LastUpdateTime',
        resizable: true,
        valueFormatter: this.renderCell.bind(this),
      },
    ];

    this.columnDefs.push({
      headerName: '',
      field: 'download',
      minWidth: 60,
      maxWidth: 60,
      onCellClicked: this.download.bind(this),
      cellClass: 'fa fa-info-circle',
      cellStyle: { cursor: 'pointer' },
      headerClass: 'ag-header-cell-action',
      cellRenderer: cellRendererFn,
      suppressMenu: true,
      suppressMovable: true,
      pinned: 'right',
    });

    this.gridOptions = {
      rowData: this.rowData,
      columnDefs: this.columnDefs,
      pagination: true,
    };
  }

  // private download(params: any) {
  //   if (!this.showcrediterror) {
  //     this.loading = true;
  //     this.service.getDiceProfileView(params, this.accessToken).subscribe((x: any) => {
  //       this.loading = false;
  //       if (x.resume) {
  //         let profileDetails = x;
  //         let emailID = profileDetails.email[0];
  //         this.divcandidateemail = profileDetails.email[0];
  //         let firstName = profileDetails.firstName;
  //         let lastName = profileDetails.lastName;
  //         let title = profileDetails?.desiredJobTitles[0];
  //         let CurrentLocation = profileDetails?.region;
  //         let YearsOfExpInMonths = (profileDetails.yearsOfExperience * 12).toString();
  //         let skilllist: any = profileDetails.skills;
  //         let skills: any = [];
  //         skilllist.forEach((itm: any) => {
  //           skills.push(itm.skill);
  //         });
  //         let HtmlResume = profileDetails.resume?.resumeHtml;
  //         let source = 'Dice';
  //         let ATSID = profileDetails.legacyIds[0];
  //         this.migratedResumeID = emailID;
  //         let req1: DiceProfileRequestItem = {
  //           emailID: emailID,
  //         };
  //         this.service.checkIfResumeExists(req1).subscribe((y: any) => {
  //           if (y.length > 0) {
  //             this.isPDFSrc = false;
  //             this.objUrl = this.sanitizer.bypassSecurityTrustHtml(
  //               y[0].HtmlResume
  //             );
  //             this.loading = false;
  //             this.fileReady = true;
  //             this.visibleSidebar2 = true;
  //           } else {
  //             this.currentResumeResp = x.resume;
  //             let b64Data: any = x.resume.resumeData;
  //             let contentType = x.resume.contentType;
  //             const blob = b64toBlob(b64Data, contentType);
  //             this.isPDFSrc =
  //               contentType === 'application/pdf' ? true : false;
  //             this.fileReady = true;
  //             this.visibleSidebar2 = true;
  //             let createRequest: DiceProfileRequestItem = {
  //               emailID: emailID,
  //               firstName: firstName,
  //               lastName: lastName,
  //               title: title,
  //               currentLocation: CurrentLocation,
  //               yearsOfExpInMonths: YearsOfExpInMonths,
  //               skills: skills,
  //               htmlResume: HtmlResume,
  //               source: source,
  //               ATSID: ATSID,
  //               traineeId: this.traineeId,
  //             };
  //             this.service.createJobSeekerProfile(createRequest).subscribe((z) => {
  //               let saveResumeReq = {
  //                 Filename:
  //                   profileDetails.fullName + '_' + x.resume.filename,
  //                 Content: b64Data,
  //                 userName: this.traineeId,
  //                 emailID: emailID,
  //               };
  //               this.service.saveResume(saveResumeReq).subscribe((x) => { });
  //             });
  //             this.adddivisionaudit();
  //           }
  //         });
  //       } else {
  //         this.messageService.add({
  //           severity: 'warning',
  //           summary: 'No Resume Found',
  //         });
  //       }
  //     });
  //   } else {
  //     this.messageService.add({
  //       severity: 'warning',
  //       summary: 'You have no credits left',
  //     });
  //   }
  // }

  public downloadhtmlPdf(){
    setTimeout(() => {
      const options = {
        margin: [5, 5, 5, 5], // Optional margin settings
        filename: this.cfullname+'.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf()
        .from(document.getElementById('printpdf')!)
        .set(options)
        .save();
    });
  }

  private download(params: any) {
    if (!this.showcrediterror) {
      this.loading = true;
      let Req = {
        md5emailID: params,
      };

      this.service.checkmd5resume(Req).subscribe((y: any) => {
        let inputString;
        if(this.searchType ==1){
          inputString = this.model.boolean || '';
        }else{
          inputString = this.model.keyword || '';
        }
        console.log(this.model.boolean);
        var keywords: any[] = [];
        if (inputString.trim() !== '') {
          keywords = inputString.match(/"[^"]+"|\S+/g);
          if (keywords !== null) {
            keywords = keywords
              .map((keyword: string) => keyword.replace(/(^"|"$|\(|\))/g, ''))
              .filter(
                (keyword: string) =>
                  !['and', 'or', 'not'].includes(keyword.toLowerCase())
              );
            keywords = keywords.filter((keyword) => keyword !== '');
            keywords = keywords.map((keyword) => keyword.replace(/^"|"$/g, ''));
          } else {
            keywords = [];
          }
        }

        console.log(keywords);
        if (y.length > 0) {
          this.isPDFSrc = false;
          this.objUrl = this.highlightSkills(y[0].HtmlResume, keywords);
          this.Htmlresumetopdf = y[0].HtmlResume;
          this.loading = false;
          this.fileReady = true;
          this.visibleSidebar2 = true;
          this.cfullname = y[0].FirstName ?? null + ' ' + y[0].LastName ?? null;
          this.clocation = y[0].CurrentLocation ?? null;
          this.cyearsofExperience =
            (y[0].YearsOfExpInMonths / 12).toString() ?? null;
          this.cemail = y[0].UserName ?? null;
          this.cphone = y[0].PhoneNumber ?? null;
          this.cjobtitle = y[0].Title ?? null;
          const skillsString = y[0].Skill;
          const skillsArray = skillsString.split(',');
          const skillsJSON = skillsArray.map((skill: any) => ({ skill }));
          const skillsObject: any = skillsJSON;
          console.log(skillsObject);
          this.cskill = skillsObject;
          this.migratedResumeID = y[0].UserName ?? null;
        } else {
          this.adddivisionaudit();
          this.service
            .getDiceProfileView(params, this.accessToken)
            .subscribe((x: any) => {
              let profileDetails = x;
              this.loading = false;
              this.cfullname = profileDetails?.fullName;
              this.clocation = profileDetails?.region;
              this.cphone = profileDetails?.phone?.[0] ?? null;
              this.cemail = profileDetails?.email?.[0] ?? null;
              this.cworkpermit =
                profileDetails?.workPermitDocuments?.[0] ?? null;
              this.cyearsofExperience = profileDetails?.yearsOfExperience;
              this.cjobtitle = profileDetails?.desiredJobTitles?.[0] ?? null;
              this.csocialsource = profileDetails?.socialProfiles;
              this.ceducation = profileDetails?.education;
              this.cskill = profileDetails?.skills;
              console.log(this.cskill);
              let emailID = profileDetails.email[0];
              this.divcandidateemail = profileDetails.email[0];
              let firstName = profileDetails.firstName;
              let lastName = profileDetails.lastName;
              let title = profileDetails?.desiredJobTitles[0];
              let CurrentLocation = profileDetails?.region;
              let YearsOfExpInMonths = (
                profileDetails.yearsOfExperience * 12
              ).toString();
              let skilllist: any = profileDetails.skills;
              let skills: any = [];
              skilllist.forEach((itm: any) => {
                skills.push(itm.skill);
              });
              this.visibleSidebar2 = true;
              if (x.resume) {
                let HtmlResume = profileDetails.resume?.resumeHtml;
                let source = 'Dice';
                let ATSID = profileDetails.legacyIds[0];
                this.migratedResumeID = emailID;
                this.currentResumeResp = x.resume;
                let b64Data: any = x.resume.resumeData;
                console.log(b64Data);
                let contentType = x.resume.contentType;
                const blob = b64toBlob(b64Data, contentType);
                // this.isPDFSrc = contentType === 'application/pdf' ? true : false;
                this.fileReady = true;

                // this.objUrl = this.sanitizer.bypassSecurityTrustHtml(HtmlResume);
                this.objUrl = this.highlightSkills(HtmlResume, keywords);
                this.Htmlresumetopdf = HtmlResume;
                let createRequest: DiceProfileRequestItem = {
                  emailID: emailID,
                  firstName: firstName,
                  lastName: lastName,
                  title: title,
                  currentLocation: CurrentLocation,
                  yearsOfExpInMonths: YearsOfExpInMonths,
                  skills: skills,
                  htmlResume: HtmlResume,
                  source: source,
                  ATSID: ATSID,
                  traineeId: this.traineeId,
                };
                this.service
                  .createJobSeekerProfile(createRequest)
                  .subscribe((z) => {
                    let saveResumeReq = {
                      Filename:
                        profileDetails.fullName + '_' + x.resume.filename,
                      Content: b64Data,
                      userName: this.traineeId,
                      emailID: emailID,
                    };
                    this.service.saveResume(saveResumeReq).subscribe((x) => {});
                  });
              } else {
                this.messageService.add({
                  severity: 'warning',
                  summary: 'No Resume Found',
                });
              }
            });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warning',
        summary: 'You have no credits left',
      });
    }
  }

  public downloadDoc() {
    let req = {
      userName: this.migratedResumeID,
    };
    this.service.getResumePath(req).subscribe((x: any) => {
      if (x[0] && x[0].ResumePath) {
        FileSaver.saveAs(
          'https://tresume.us/' + x[0].ResumePath,
          x[0].ResumeName
        );
      } else {
        const pdfdoc = this.pdfdoc.nativeElement;
        const pdfOptions = {
          margin: 10,
          filename: 'Resume.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        html2pdf().from(pdfdoc).set(pdfOptions).save();
      }
    });
  }

  private yearsRender(params: any) {
    if (params.value && params.value > 11) {
      return params.value / 12;
    } else if (params.value > 0) {
      return params.value + ' Month';
    } else {
      return '';
    }
  }

  private renderCell(params: any) {
    if (params.value && params.value != '1900-01-01') {
      return params.value;
    } else {
      return '';
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  public sizeToFit() {
    let ids: string[] = [];
    this.columnDefs.forEach((column: any) => {
      ids.push(column.field || '');
    });
    if (this.gridOptions.columnApi) {
      this.gridOptions.columnApi.autoSizeColumns(ids);
    }
    if (this.gridOptions.api) {
      this.gridOptions.api.sizeColumnsToFit();
    }
  }

  public onSearch() {
    if(this.searchType == 1){
      let req =
      'q=' +
      encodeURIComponent(this.model.boolean) +
      '&page=' +
      (this.searchRequestItem?.page || 1);
    if (this.selectedState) {
      /* const selectedState = "value"+"'"'":" + this.selectedState"" */
      let locations = '[{"value":"' + this.selectedState + '"}]';
      if (this.searchRequestItem.locationRadius) {
        locations =
          '[{"value":"' +
          this.selectedState +
          '","distance":' +
          this.searchRequestItem.locationRadius +
          ',"distanceUnit":"miles"}]';
        console.log('locations', `${locations}`);
      }
      req += '&locations=' + encodeURIComponent(locations);
    }
    if (this.isscocialprofiles) {
      req += this.daysWithin ? '&dateResumeLastUpdated=' + this.daysWithin : '';
    } else {
      req += this.daysWithin
        ? '&dateResumeLastUpdated=' + this.daysWithin
        : '&dateResumeLastUpdated=999';
    }

    req += this.selectedEducationDegree
      ? '&educationDegree=' + this.selectedEducationDegree.value
      : '';
    req += this.willingToRelocate
      ? '&willingToRelocate=' + this.willingToRelocate
      : '';
    req += this.onlyWithSecurityClearance
      ? '&onlyWithSecurityClearance=' + this.onlyWithSecurityClearance
      : '';
    req += this.jobTitle ? '&jobTitle=' + this.jobTitle : '';
    const workarray = this.selectedWorkstatus.map((item) => item.value);
    const workPermit = workarray.join(', ');
    req += workPermit ? '&workPermit=' + workPermit : '';
    if (this.yearsOfExp && this.yearsOfExpmin) {
      let exp =
        '{"min":' + this.yearsOfExpmin + ',"max":' + this.yearsOfExp + '}';
      req += '&yearsExperience=' + encodeURIComponent(exp);
    } else if (this.yearsOfExpmin) {
      let exp = '{"min":' + this.yearsOfExpmin + '}';
      req += '&yearsExperience=' + encodeURIComponent(exp);
    } else if (this.yearsOfExp) {
      let exp = '{"max":' + this.yearsOfExp + '}';
      req += '&yearsExperience=' + encodeURIComponent(exp);
    }
    req += '&excludeThirdParty= true';
    console.log(req);
    this.loading = true;
    if (this.searchRequestItem.page == undefined) {
      let auditReq = {
        jobBoard: 'Dice',
        query: this.model.boolean,
        dateTime: new Date(),
        userName: this.cookieValue,
      };
      this.service.jobBoardAudit(auditReq).subscribe((x) => {});
    }

    this.service.getDiceSearch(req, this.accessToken).subscribe((x: any) => {
      console.log('x', x);
      this.loading = false;
      this.resultsFound = false;
      let response = x;
      this.rowData = response.data;

      this.resultsFound = true;
      this.totalResults = response.meta.totalCount;
      this.rowData.map((items: any) => {
        items.migrated = this.migratedProfiles.find(
          (x) => x.ATSID == items.legacyIds[0]
        )
          ? true
          : false;
        if (this.showcrediterror == true) {
          items.showmigrated = this.migratedProfiles.find(
            (x) => x.ATSID == items.EdgeID
          )
            ? true
            : false;
        }
        let item: any = items;
        items.diceSkills = [];
        for (let i = 0; i < 5; i++) {
          items.diceSkills.push(item.skills[i] ? item.skills[i].skill : '');
        }
        /* item.skills.forEach((itm: any, i) => {
                    items.diceSkills.push(itm.skill);
                }); */
      });

      console.log('this.rowData', this.rowData);

    });
    }else{
      const request = {
        searchParameters: {
          input: this.model.jobDesc, // Use the keyword from the form
          jobTitleKeyword : this.model.keyword, // Use the job description from the form
          locations: [{ value: this.selectedState }], // Use the selected state for location
          page: this.searchRequestItem.page || 1, // Use the page from the search request item or default to 1
          dateResumeLastUpdated: this.isscocialprofiles ? this.daysWithin : 999, // Use the days within for dateResumeLastUpdated or default to 999
          educationDegree: this.selectedEducationDegree?.value, // Use the selected education degree value
          willingToRelocate: this.willingToRelocate,
          onlyWithSecurityClearance: this.onlyWithSecurityClearance,
          jobTitle:this.jobTitle,
          workPermit: this.selectedWorkstatus.map(item => item.value).join(', '), // Use the selected work status values joined by comma
          // yearsExperience: this.constructYearsExperience(), // Construct years of experience object
          excludeThirdParty: true // Exclude third party profiles
        }
      };
  
      console.log('Request:', request);
  
      this.loading = true;
  
      this.service.getDiceIntelliSearch(request, this.accessToken).subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.loading = false;
          this.resultsFound = false;
          this.rowData = response.data;
          this.resultsFound = true;
          this.totalResults = response.meta.totalCount;
          this.rowData.forEach((item: { migrated: boolean; legacyIds: any[]; showmigrated: boolean; EdgeID: any; diceSkills: any; skills: any[]; }) => {
            item.migrated = this.migratedProfiles.find(x => x.ATSID == item.legacyIds[0]) ? true : false;
            if (this.showcrediterror) {
              item.showmigrated = this.migratedProfiles.find(x => x.ATSID == item.EdgeID) ? true : false;
            }
            item.diceSkills = item.skills ? item.skills.map((skill: { skill: any; }) => skill.skill) : [];
          });
        },
        error => {
          console.error('Error:', error);
          this.loading = false;
        }
      );
    }
    
  }

  private constructYearsExperience(): string {
    if (this.yearsOfExp && this.yearsOfExpmin) {
      return `{"min": ${this.yearsOfExpmin}, "max": ${this.yearsOfExp}}`;
    } else if (this.yearsOfExpmin) {
      return `{"min": ${this.yearsOfExpmin}}`;
    } else if (this.yearsOfExp) {
      return `{"max": ${this.yearsOfExp}}`;
    } else {
      return '';
    }
  }
  public nocredits() {
    this.messageService.add({
      severity: 'warning',
      summary: 'Error',
      detail: 'You dont have enough credit to View Resume',
    });
  }

  private getFilterValues() {
    let filter: string = '';
    if (this.daysWithin) {
      filter = 'ResumeModified:[NOW-' + this.daysWithin + 'DAYS/DAY TO *]';
    }
    if (this.searchSkill) {
      filter += 'Skill:[' + this.searchSkill + ']';
    }
    return filter;
  }

  public getFacetFilterValues() {
    let facetFilter: string = '';
    if (this.yearsOfExp) {
      facetFilter = 'YearsOfExperience:' + this.yearsOfExp;
    }
    if (this.schoolName) {
      facetFilter = 'School:[' + this.schoolName + ']';
    }
    if (this.willingToRelocate) {
      facetFilter += ' WillingToRelocate:' + this.willingToRelocate;
    }
    if (this.hasSecurityClearance) {
      facetFilter += ' SecurityClearance:' + this.hasSecurityClearance;
    }
    if (this.selectedWorkstatus.length > 0) {
      facetFilter += ' WorkStatus:' + this.selectedWorkstatus[0].value;
    }
    if (this.selectedWorkPermit.length > 0) {
      facetFilter += ' workPermit:' + this.selectedWorkPermit[0].value;
    }
    if (this.selectedEducationDegree) {
      facetFilter +=
        ' HighestEducationDegreeCode:' + this.selectedEducationDegree.value;
    }
    return facetFilter;
  }

  public selecteWorkstatus(value: any) {
    console.log('value', value);
  }

  public goBack() {
    window.history.back();
  }

  pageChanged(event: PageChangedEvent): void {
    this.searchRequestItem.page = event.page;
    this.onSearch();
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    window.scrollTo(0, 0);
  }

  public onReady(): void {
    this.componentInitialized = true;
    this.application = (window as any).PDFViewerApplication;
    // this.info('PDF loading starts', this.application != null);
  }

  public close(result?: void) {
    // unbind offending event listeners
    const unbindWindowEvents = this.application?.unbindWindowEvents?.bind(
      this.application
    );
    if (typeof unbindWindowEvents === 'function') {
      unbindWindowEvents();
    } else {
      console.log('Error unbind pdf viewer');
    }
    this.cfullname = '';
    this.cjobtitle = '';
    this.cyearsofExperience = '';
    this.cemail = '';
    this.cphone = '';
    this.clocation = '';
    this.ceducation = [];
    this.cworkpermit = '';
    this.csocialsource = [];
    this.cskill = [];
    this.objUrl = '';
  }

  //Division

  // public fetchcredit() {
  //     let Req = {
  //         userName: this.userName1,
  //     };
  //     let type = 0;
  //     let divid = 0;
  //     this.service.fetchdvisioncredit(Req).subscribe((x: any) => {
  //         console.log(x.result.length);
  //         if(x.result.length == 0){
  //             this.showcrediterror = true;
  //         } else{
  //         this.creditcount1 = x.result[0].dice;
  //         this.divID1 = x.result[0].id;
  //         console.log(this.divID1);
  //         type = x.result[0].type;
  //         divid = x.result[0].id;
  //         let Req2 = {
  //             type: type,
  //             jobID: this.jobID1,
  //             divid: this.divID1,
  //             jobboardName:'Dice'
  //         };
  //         this.service.fetchusage(Req2).subscribe((x: any) => {

  //             console.log(x.result)
  //             this.usedcount1 = x.result[0].row_count;
  //             var count = this.creditcount1 - this.usedcount1;
  //             var percentage = (23/this.creditcount1) * 100;
  //             console.log(percentage);
  //             if(percentage>=80){
  //                 this.service.senddivisionerrormail(Req2).subscribe((x: any) =>{

  //                 })
  //             }
  //             console.log(count)
  //             if (count <= 0) {
  //                 this.showcrediterror = true;
  //             }

  //           });
  //         }
  //         console.log(this.showcrediterror);
  //       });

  // }

  public async fetchcredit() {
    try {
      let Req = {
        userName: this.userName1,
      };

      let type = 0;
      let divid = 0;

      const fetchDivisionCredit = (): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
          this.service
            .fetchdvisioncredit(Req)
            .toPromise()
            .then((x: any) => {
              console.log(x.result.length);
              if (x.result.length == 0) {
                this.showcrediterror = true;
                this.messageService.add({
                  severity: 'warning',
                  summary: 'Error',
                  detail: 'You dont have enough credit to View Resume',
                });
                reject('No division credit found');
                this.messageService.add({
                  severity: 'warning',
                  summary: 'Error',
                  detail: 'No division credit found',
                });
              } else {
                this.creditcount1 = x.result[0].udice;
                this.divID1 = x.result[0].id;
                console.log(this.divID1);
                type = x.result[0].type;
                divid = x.result[0].id;
                resolve();
              }
            })
            .catch((error: any) => {
              reject(error);
            });
        });
      };

      const fetchUsage = (): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
          let Req2 = {
            type: type,
            userName: this.userName1,
            jobID: this.jobID1,
            divid: this.divID1,
            jobboardName: 'Dice',
          };
          this.service
            .fetchusage(Req2)
            .toPromise()
            .then((x: any) => {
              console.log(x.result);
              this.usedcount1 = x.result[0].row_count;
              var count = this.creditcount1 - this.usedcount1;
              this.availablecredits = count;
              var percentage = (this.usedcount1 / this.creditcount1) * 100;
              let Req3 = {
                type: type,
                jobID: this.jobID1,
                divid: this.divID1,
                jobboardName: 'Dice',
                percentage: percentage,
              };
              if (percentage >= 80) {
                this.messageService.add({
                  severity: 'warning',
                  summary: 'Error',
                  detail:
                    'Your Credit reached 80% contact sales to increase your credit',
                });
                this.service
                  .senddivisionerrormail(Req3)
                  .toPromise()
                  .then((x: any) => {
                    // Handle the email sent
                  })
                  .catch((error: any) => {
                    // Handle the email sending error
                  });
              }
              console.log(count);
              if (count <= 0) {
                this.showcrediterror = true;
                this.messageService.add({
                  severity: 'warning',
                  summary: 'Error',
                  detail: 'You dont have enough credit to View Resume',
                });
              }
              resolve();
            })
            .catch((error: any) => {
              reject(error);
            });
        });
      };

      await fetchDivisionCredit();
      await fetchUsage();

      console.log(this.showcrediterror);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //division
  public ipaddress() {
    let Req = {
      userName: this.userName1,
    };
    this.service.getclientipaddress(Req).subscribe((x: any) => {
      this.ipaddress = x.body;
      console.log(this.ipaddress);
    });
  }

  public adddivisionaudit() {
    let Req = {
      userName: this.userName1,
      divID: this.divID1,
      jobID: this.jobID1,
      ipaddress: this.ipaddress,
      candidateemail: '',
    };
    this.service.adddivisionaudit(Req).subscribe((x: any) => {
      this.ipaddress = x.body;
      console.log(this.ipaddress);
    });
    this.fetchcredit();
  }

  highlightSkills(htmlContent: string, skills: string[]): string {
    skills.forEach((skill) => {
      // Constructing regex pattern to match all variations of the skill
      var htmltagslist = [
        'data',
        'big',
        'center',
        'embed',
        'form',
        'meta',
        'input',
        'select',
        'menu',
        'style',
        'strike',
        'border',
        'disc',
        'type',
        'circle',
      ];
      if (!htmltagslist.includes(skill.toLowerCase())) {
        const regex = new RegExp(
          `\\b${skill
            .split('')
            .map((c) => `[${c}${c.toUpperCase()}]`)
            .join('')}+\\b`,
          'g'
        );
        console.log(regex);
        htmlContent = htmlContent.replace(
          regex,
          `<span style="background-color: yellow;font-weight: bold;">$&</span>`
        );
      }
    });
    return htmlContent;
  }

  sanitizeHtml(htmlContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}

export interface CBSearchRequestItem {
  query?: string;
  token?: string;
  locations?: string;
  page?: number;
  resultsPerPage?: number;
  locationRadius?: number;
  jobTitle?: string;
  filters?: string;
  facetFilter?: string;
}

export enum SearchType {
  jobDetail = 1,
  boolean,
}

export interface DiceProfileRequestItem {
  emailID?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  currentLocation?: string;
  yearsOfExpInMonths?: string;
  skills?: string;
  htmlResume?: string;
  source?: string;
  ATSID?: string;
  traineeId?: string | null;
}
