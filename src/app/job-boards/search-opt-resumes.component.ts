import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import { JobBoardsService } from './job-boards.service';
import { CookieService } from 'ngx-cookie-service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import * as FileSaver from 'file-saver';
//import * as htmlDocx from 'html-docx-js';
//import * as html2pdf from 'html2pdf.js';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxExtendedPdfViewerService, TextLayerRenderedEvent } from 'ngx-extended-pdf-viewer';

import { PdfViewerModule } from 'ng2-pdf-viewer';

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
}

@Component({
    selector: 'app-search-opt-resumes',
    templateUrl: './search-opt-resumes.component.html',
    providers: [JobBoardsService, CookieService, MessageService, NgxExtendedPdfViewerService],
    styleUrls: ['./search-resumes.component.scss']
})


export class SearchResumesOptComponent implements OnInit {

    form = new FormGroup({});
    model: any = {};
    options: FormlyFormOptions = {};
    fields: FormlyFieldConfig[] = [
        {
            key: 'keyword',
            type: 'input',
            templateOptions: {
                label: 'Keywords',
                placeholder: 'Enter the search keyword',
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
        'Wyoming'
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
        { value: 'CE5', name: 'Not Specified' },
        { value: 'CE30', name: 'Vocational' },
        { value: 'CE31', name: 'High School' },
        { value: 'CE32', name: 'Associate Degree' },
        { value: 'CE321', name: 'Bachelor\'s Degree' },
        { value: 'CE3210', name: 'Master\'s Degree' },
        { value: 'CE3211', name: 'Doctorate' },

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
    edgeIDs: any[] = [];
    resultsFound: boolean = false;
    loading: boolean = false;
    searchRequestItem: CLSearchRequestItem = {};
    daysWithin: string;
    searchSkill: string;
    yearsOfExp: string;
    schoolName: string;
    willingToRelocate: boolean;
    hasSecurityClearance: boolean;
    selectedWorkstatus: any[] = [];
    selectedEducationDegree: any;
    migratedProfiles: any[] = [];
    isProfileLoaded: boolean = false;
    currentResumeContent: any;
    visibleSidebar2: boolean = false;
    application: any;
    fileReady: boolean = false;
    isPDFSrc: boolean = false;
    objUrl: any;
    componentInitialized: boolean;
    currentResumeResp: any;
    currentEdgeID: any;
    currentResumeID: any;
    isMigratedProfile: boolean = false;
    pdfurl:any;

    @ViewChild('lgModal', { static: false }) lgModal?: ModalDirective;
    @ViewChild('pdfTable', { static: false }) pdfTable: ElementRef;
    accessToken: any;
    totalResults: any;
    quota: any;
    OrgID1: string;
    userName1: string;
    TraineeID1: string;
    showcrediterror: boolean;
    creditcount1: any;
    divID1: any;
    jobID1: any = 9;
    usedcount1: any;
    availablecredits: number;

    constructor(private route: ActivatedRoute, private service: JobBoardsService, private cookieService: CookieService,
        private messageService: MessageService, private sanitizer: DomSanitizer, private pdfViewerService: NgxExtendedPdfViewerService) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        if (this.traineeId == '') {
            this.traineeId = localStorage.getItem("TraineeID");
        }
        //this.traineeId = '1';
        //(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    }

    ngOnInit(): void {
        this.cookieValue = this.cookieService.get('employeruser')
        console.log(this.traineeId);
        this.OrgID1 = this.cookieService.get('OrgID');
        this.userName1 = this.cookieService.get('userName1');
        this.TraineeID1 = this.cookieService.get('TraineeID');

        
        this.fetchcredit();
        this.ipaddress();

        let migrateCheckReq = {
            source: 'OptNation',
            traineeId: this.traineeId,
          };
          this.service
            .checkIfProfileMigrated(migrateCheckReq)
            .subscribe((response: any) => {
              this.migratedProfiles = response;
            });
      

        /* if (this.traineeId) {
            let req = {
                "traineeId": this.traineeId,
                "keyword": ''
            }
            this.service.getResumes(req).subscribe(x => {
                let response = x.result;
                this.rowData = response;
                this.paginatedArray = this.rowData.slice(0, 10);
                console.log('this.rowData', this.rowData)
                this.sizeToFit();

            });
        }
        else {
            let req = {
                userName: this.cookieValue
            }
            this.service.getLoggedUser(req).subscribe((x: any) => {
                if (x) {
                    this.traineeId = x[0].TraineeID;
                }
                let req = {
                    "traineeId": this.traineeId,
                    "keyword": ''
                }
                this.service.getResumes(req).subscribe(x => {
                    let response = x.result;
                    this.rowData = response;
                    console.log('this.rowData', this.rowData)
                    this.sizeToFit();

                });
            });
        } */
    }



   
    private yearsRender(params: any) {
        if (params.value && params.value > 11) {
            return params.value / 12;
        }
        else if (params.value > 0) {
            return params.value + ' Month';
        }
        else {
            return '';
        }
    }

    private renderCell(params: any) {
        if (params.value && params.value != '1900-01-01') {
            return params.value;
        }
        else {
            return '';
        }
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
    }

    public sizeToFit() {
        let ids: string[] = [];
        this.columnDefs.forEach((column: any) => {
            ids.push(column.field || "");
        });
        if (this.gridOptions.columnApi) {
            this.gridOptions.columnApi.autoSizeColumns(ids);
        }
        if (this.gridOptions.api) {
            this.gridOptions.api.sizeColumnsToFit();
        }
    }

    public onSearch() {
        let req = {
            keywords: this.model.keyword,
            location: this.selectedState,
            page: this.searchRequestItem.page
        }

        this.loading = true;
        this.service.optresumesearch(req).subscribe((x: any) => {
            console.log(x);
            this.loading = false;
            this.resultsFound = true;
            let data = x.resumes;
            for (let resume of data) {
                const resumeid = this.extractResumeId(resume.resumeurl);
                resume.resumeid = resumeid;
                resume.migrated = this.migratedProfiles.find((x) => x.ATSID == resumeid) ? true : false;
                if (this.showcrediterror == true) {
                  resume.showmigrated = this.migratedProfiles.find((x) => x.ATSID == resumeid) ? true : false;
                }
            }


            console.log(data);

            // let meta = x.meta.pagination;
            this.totalResults = x.TotalResult;
            this.rowData = data;

        });
    }

    extractResumeId(resumeurl: string): string {
        const parts = resumeurl.split('=');
        return parts[parts.length - 1];
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
        if (this.selectedEducationDegree) {
            facetFilter += ' HighestEducationDegreeCode:' + this.selectedEducationDegree.value;
        }
        return facetFilter;
    }

    public selecteWorkstatus(value: any) {
        console.log('value', value)

    }

    public onPreview(resumeid: any,jobTitle:any) {
        let Req = {
            md5emailID: resumeid,
          };
    
          this.service.checkmd5resume(Req).subscribe((y: any) => {
            if (y.length > 0) {
                let req = {
                    userName: y[0].UserName ?? null
                }
                this.service.getResumePath(req).subscribe((x: any) => {
                    if (Array.isArray(x) && x.length > 0) {
                        FileSaver.saveAs("https://tresume.us/" + x[0].ResumePath, x[0].ResumeName);
                      } else {
                        this.downloadfromopt(resumeid,jobTitle)
                      }
                });
            }else{
                this.downloadfromopt(resumeid,jobTitle)
            }
          });

    }

    public downloadfromopt(resumeid:any,jobTitle:any){
        let req = {
            token: this.accessToken,
            resumeid: resumeid
        }
        this.loading = true;
        this.adddivisionaudit();
        this.service.optresumeopen(req).subscribe((profileDetails: any) => {
            this.currentResumeContent = profileDetails.resume.downloadurl;
            this.visibleSidebar2 = true;
            this.fileReady = true;
            this.isPDFSrc = true;
            this.loading = false;

            let createRequest = {
                emailID: profileDetails.resume.email,
                firstName: profileDetails.resume.name,
                lastName: '',
                title: jobTitle,
                currentLocation: profileDetails.resume.location,
                yearsOfExpInMonths: '',
                skills: profileDetails.resume.skill,
                htmlResume: '',
                source: 'OptNation',
                ATSID: resumeid,
                traineeId: this.traineeId,
              };
              this.service
                .createJobSeekerProfile(createRequest)
                .subscribe((z) => {
                  let saveResumeReq = {
                    Filename:
                    profileDetails.resume.filename,
                    pdfUrl : this.currentResumeContent,
                    userName: this.traineeId,
                    emailID: profileDetails.resume.email,
                  };
                  this.service.optSaveResume(saveResumeReq).subscribe((x) => { });
                });

        });
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
        const unbindWindowEvents = this.application?.unbindWindowEvents?.bind(this.application);
        if (typeof unbindWindowEvents === 'function') {
            unbindWindowEvents();
        } else {
            console.log('Error unbind pdf viewer')
        }
    }

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
                      summary: 'Notification',
                      detail: 'You dont have enough credit to View Resume',
                    });
                    reject('No division credit found');
                    this.messageService.add({
                      severity: 'warning',
                      summary: 'Notification',
                      detail: 'No division credit found',
                    });
                  } else {
                    this.creditcount1 = x.result[0].uOptNation;
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
                jobboardName: 'OptNation',
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
                    jobboardName: 'OptNation',
                    percentage: percentage,
                  };
                  if (percentage >= 80) {
                    this.messageService.add({
                      severity: 'warning',
                      summary: 'Notification',
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
                      summary: 'Notification',
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
    public nocredits() {
    this.messageService.add({
        severity: 'warning',
        summary: 'Notification',
        detail: 'You dont have enough credit to View Resume',
    });
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

}

export interface CLSearchRequestItem {
    keywords?: string;
    token?: string;
    locations_us?: string;
    page?: number;
    limit?: number;
    radius?: number;
    zip_text?: string;
    only_title?: string;
    // edu?: string;
    // clearance?: string;
}


export interface CBProfileRequestItem {
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

