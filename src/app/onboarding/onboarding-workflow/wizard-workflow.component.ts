import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { GridOptions, ColDef, RowNode, Column, GridApi, Environment } from 'ag-grid-community';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AppService } from '../../app.service';
import { OnboardingService } from '../onboarding.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';


function getFormattedDate(date: any) {
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'MM/dd/yyyy') || "";
}

@Component({
    selector: 'app-wizard-workflow',
    templateUrl: './wizard-workflow.component.html',
    styleUrls: ['../onboarding.component.scss'],
    providers: [{
        provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
    }, OnboardingService, MessageService]
})
export class WizardWorkflowComponent implements OnInit {
   loading:boolean = false;
    @ViewChild('stepper') stepper: any;
    @ViewChild('stepper2') stepper2: any;
    @ViewChild('esign') esign: any;

    cards: any[] = [];
    steps: any[] = [];

    bsConfig?: Partial<BsDatepickerConfig>;

    form = new FormGroup({});
    emailform = new FormGroup({});
    model: any = {};

    public enableSteps: boolean = false;
    public typeSelector: boolean = true;
    public approvalView: boolean = false;
    public loggedTraineeId: any;
    public traineeId: any;
    public onboardId: any;
    public OrgID: any;
    public candidateDetails: any;
    public filesRequested: boolean = false;
    public emailSent: boolean = false;
    public groupedItems: { [key: string]: any[] } = {};
    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;
    isEditable = false;
    stepperOrientation: Observable<StepperOrientation>;
    stepperPercentage: number = 0;
    username: string;
    requested: any[] = [];
    requestedList: any[] = [];
    uploadFile: any[] = [];
    adhocUploadFile: any;
    text: string;
    modalRef?: BsModalRef;
    docTypes?: any[] = [];
    adhocDocItem: any = {};
    rejectDocItem: any = {};
    approveDocItem: any = {};
    visibleSidebar2: boolean = false;
    application: any;
    componentInitialized: boolean;
    apiUrl: string = environment.apiUrl;
    uploadUrl = `${this.apiUrl}uploadOnboardDocument`;
    profileUploadUrl = `${this.apiUrl}uploadDocument`;
    checkType: any = 1;
    additionalChecklistIDs: any[] = [];
    adobeAccessToken: any;
    transientDocumentId: any;
    agreementId: any;
    orgLogo: string = '';
    orgName: string = '';
    validationReqList = [20, 36, 11, 42, 44];
    fileRoute: string;

    constructor(private route: ActivatedRoute, private service: OnboardingService, private _formBuilder: FormBuilder,
        private appService: AppService, breakpointObserver: BreakpointObserver, private router: Router,
        private cookieService: CookieService, private messageService: MessageService, private modalService: BsModalService) {
        this.stepperOrientation = breakpointObserver
            .observe('(min-width: 1200px)')
            .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

        this.loggedTraineeId = sessionStorage.getItem("TraineeID");
        this.onboardId = this.route.snapshot.params["id"];
        this.adobeAccessToken = this.route.snapshot.queryParams["token"];
        //this.traineeId = sessionStorage.getItem("OnBoardTraineeID");
    }
    options: FormlyFormOptions = {};
    fields: FormlyFieldConfig[] = [
        {
            key: 'file',
            type: 'file',
        },
        {
            key: 'Checkbox',
            type: 'checkbox',
            templateOptions: {
                label: 'Accept terms',
                description: 'In order to proceed, please accept terms',
                pattern: 'true',
                required: true,
            },

            validation: {
                messages: {
                    pattern: 'Please accept the terms',
                },
            },
        }
    ];
    emailfields: FormlyFieldConfig[] = [
        {
            key: 'Input',
            type: 'input',
            templateOptions: {
                label: 'Email ID',
                placeholder: 'Email',
                required: true,
            },
        }
    ];
    /* fields: FormlyFieldConfig[] = [{
        type: 'stepper',
        fieldGroup: [
            {
                templateOptions: { label: 'Select a Document Type' }
            }
        ]
    }]; */

    ngOnInit(): void {
        this.bsConfig = Object.assign({}, { containerClass: 'theme-default' });

        this.OrgID = this.cookieService.get('OrgID');
        let req2 = {
            onboardId:this.onboardId
        }
        this.service.getOnboardingDetails(req2).subscribe((x: any) => {
            this.traineeId = x[0].TraineeID;
            if (x[0].Status != 1) {
                this.typeSelector = false;
                this.enableSteps = false;
                this.approvalView = true;
                this.getOnboardRequests();
            }
            let req = {
                traineeId:this.traineeId
            }
            this.appService.getTraineeDetails(req).subscribe((x: any) => {
                let response = x.result;
                if (response) {
                    this.candidateDetails = response[0];
                    this.model.Input = response[0].UserName;
                }
            });
        });
        let req={
            OrgID:this.OrgID 
        }
        this.service.getChecklistNames(req).subscribe((x: any) => {
            this.cards = x.result;
        });
        this.firstFormGroup = this._formBuilder.group({
            firstCtrl: ['', ''],
        });
        this.secondFormGroup = new FormGroup({
            note: new FormControl()
        });

        this.service.getorganizationLogo(this.OrgID).subscribe((x: any) => {
            var data = x;
            this.orgName = x.result[0].organizationName;
            this.orgLogo = x.result[0].logo;
            console.log(data);

        });
    }

    enableStepper(id: any) {
        let requestItem: any = {
            OrgID: this.OrgID || 9,
            ListID: id
        }
        this.service.getWizardSteps(requestItem).subscribe((x: any) => {
            this.steps = x;

        });
        this.typeSelector = false;
        this.enableSteps = true;
    }

    removeStep(i: any) {
        if (this.steps.length < i + 1) { return; }
        this.steps.splice(i, 1);
        this.stepper.selectedIndex = this.steps.length;
        //this.checkCompleted();
    }

    EmailOffer() {
        this.stepper2.selected.completed = true;
        var clientlogo;
        if (this.orgLogo === null || this.orgLogo === undefined) {
            clientlogo = '';
        } else {
            clientlogo = `<img src='${this.orgLogo}' alt = '${this.orgName}' class='logo'>`;
        }
        let requestItem: any = {
            to: this.model.Input,
            // to: 'wilson@dmsol.in',
            subject: 'Welcome aboard, ' + this.candidateDetails.FirstName,
            text: `
            <html>
            <head>
              <style>

                .logo {
                  width: 100px;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
               <center>
                ${clientlogo}
                </center>
                <div style="width: 100%; text-align: left;">
                  <p>Hi ${this.candidateDetails.FirstName},</p>
                  <p>${this.text}</p>
                  <p>Thanks & Regards</p>
                  <p>${this.orgName}</p>
                </div>
                <center>
                <p>Powered by<p><br>
                <img src="https://tresume.us/img_Home/logo_new.png" alt="Tresume Logo" class="logo">
                </center>
              </div>
            </body>
            </html>
            `
        }
        this.service.emailOfferLetter(requestItem).subscribe(x => {
            this.messageService.add({ severity: 'success', summary: 'Welcome Email Sent', detail: this.model.Input });
        });
        this.stepper2.next();
        this.stepper.selectedIndex = 0;
        this.stepperPercentage = (this.stepper2.selectedIndex / (this.stepper2.steps.length - 1)) * 100;

    }

    onUpload(event: any, index: number) {
        if (event.files) {
            this.uploadFile[index] = event.files[0];
        }

    }

    onAdhocUpload(event: any) {
        if (event.files) {
            this.adhocUploadFile = event.files[0];
        }

    }

    uploadFiles(item: any, i: any) {
        if (this.uploadFile[i]) {
            let file = this.uploadFile[i];
            console.log('file', file)
            let uploadUrl = this.uploadUrl + '/' + this.onboardId;
            let reqBody = this.traineeId;
            this.service.uploadOnboardDocument(uploadUrl, file, reqBody).subscribe((x: any) => {
                if (x.type == 4) {
                    if (x.body.code == 'LIMIT_FILE_SIZE') {
                        console.log('error upload')
                        return;
                    }
                }
                if (x.body) {
                    let requestItem: any = {
                        onboardID: this.onboardId,
                        docTypeName: item.DocTypeName,
                        docTypeID: item.DocTypeID,
                        filepath: x.body.FilePath,
                        requested: this.requested[i] ? 1 : 0,
                        docNote: item?.note || '',
                        additionalChecklistID: ''
                    }

                    this.service.savefilepath(requestItem).subscribe(x => {

                    });
                }
            });
            this.stepperPercentage = (this.stepper2.selectedIndex / (this.stepper2.steps.length - 1)) * 100;
        }
        else {
            let requestItem: any = {
                onboardID: this.onboardId,
                docTypeName: item.DocTypeName,
                docTypeID: item.DocTypeID,
                requested: this.requested[i] ? 1 : 0,
                docNote: item?.note || '',
                additionalChecklistID: ''
            }

            this.service.savefilepath(requestItem).subscribe(x => {

            });
        }
        /* let requestItem: any = {
            onboardID: this.onboardId,
            docTypeName: item.DocTypeName,
            docTypeID: item.DocTypeID,
            fileName: (this.uploadFile[i] && this.uploadFile[i][0].name) || null,
            requested: this.requested[i]

        }
        this.service.saveOnboardingRequest(requestItem).subscribe(x => {

        }); */

    }

    afterUploads() {
        this.stepper2.selected.completed = true;
        if (this.OrgID == 98) { //Only preload for silverline
            this.preloadSteps();
        }


        let requestItem: any = {
            onboardID: this.onboardId,
            orgID: this.OrgID || 9,
            traineeID: this.traineeId,
        }
        this.service.generateOnboardingsession(requestItem).subscribe((x: any) => {
            if (x && x.length > 0 && x[0].SessionID) {
                const sessionID = x[0].SessionID;
                var clientlogo;
                if (this.orgLogo === null || this.orgLogo === undefined) {
                    clientlogo = '';
                } else {
                    clientlogo = `<img src='${this.orgLogo}' alt = '${this.orgName}' class='logo'>`;
                }
                const url = `https://tresume.us/onboard/employee/${sessionID}`;

                const emailSubject = 'Onboarding Documents Request';
                const emailText = `
              <html>
              <head>
                <style>

                  .logo {
                    width: 100px;
                  }
                </style>
              </head>
              <body>
                <div class="email-container">
                <center>
                ${clientlogo}
                <center>
                  <div style="width: 100%; text-align: left;">
                    <p>Hi ${this.candidateDetails.FirstName},</p>
                    <p>Please upload the documents in the link below:</p>
                    <p><a href="${url}">Access Tresume Link</a></p>
                    <p><i>Note: The link will be valid for 7 days.</i></p>
                    <p>Thank you,<br></p>
                    <p>${this.orgName}</p>
                  </div>
                  <center>
                  <p>Powered by</p><br>
                  <img src="https://tresume.us/img_Home/logo_new.png" alt="Tresume Logo" class="logo">
                  <center>
                </div>
              </body>
              </html>
              `;

                const requestItemEmail = {
                    to: this.candidateDetails.UserName,
                    // to: 'wilson@dmsol.in',
                    subject: emailSubject,
                    text: emailText
                };

                this.service.emailOfferLetter(requestItemEmail).subscribe(emailResponse => {

                });

                this.stepper2.next();
            }
        });

        console.log('model', this.requestedList)
        //this.stepperPercentage = (this.stepper2.selectedIndex / (this.stepper2.steps.length - 1)) * 100;
    }

    save() {
      this.loading = true;
      let req = {
        onboardId: this.onboardId
      }
        this.service.updateOnboardingStatus(req).subscribe(x => {
            this.router.navigate(['/onboardingList']);
        })
    }

    onRequest(item: any) {
        console.log('item', item)
        this.requestedList.push(item);
    }

    getOnboardRequests() {
        let req = {
            OnboardID:this.onboardId
        }
        this.service.getOnboardingRequest(req).subscribe((x: any) => {
            console.log('x', x)
            this.groupedItems = x.reduce((acc: { [key: string]: any[] }, item: any) => {
                this.additionalChecklistIDs.push(item.AdditionalChecklistID);
                let additionalChecklistID = '';
                if (item.AdditionalChecklistID === -999) {
                    additionalChecklistID = "Additional Checklist";
                } else if (item.AdditionalChecklistID === 0) {
                    additionalChecklistID = "Main Checklist";
                } else if (item.AdditionalChecklistID === -998) {
                    additionalChecklistID = "E-Sign Checklist";
                }
                else {
                    additionalChecklistID = "Checklist - " + item.AdditionalChecklistName;
                }
                acc[additionalChecklistID] = acc[additionalChecklistID] || [];
                acc[additionalChecklistID].push(item);
                return acc;
            }, {});
            console.log('groupedItems', this.groupedItems)
            this.requestedList = x;
        });
    }

    onTabChange() {
        /* let newList = this.requestedList[0]
        newList.AdditionalChecklistID = 10;
        this.requestedList.push(newList); */
    }

    get categories() {
        return Object.keys(this.groupedItems);
    }

    calPercentage(catergory: any) {
        return (this.groupedItems[catergory].filter(x => x.isUpload != 0).length / this.groupedItems[catergory].length) * 100;
    }

    goback() {
        this.router.navigate(['/onboardingList']);
    }

    // viewDoc(docID: any) {
    //     this.visibleSidebar2 = true;
    //     this.fileRoute = `${this.apiUrl}reviewdownload/` + this.onboardId + "/" + docID;
    //     window.open(fileRoute, '_blank');
    // }

    viewDoc(docID: any) {
        const fileRoute: string = `${this.apiUrl}reviewdownload/${this.onboardId}/${docID}`;
        window.open(fileRoute, '_blank');
    }
    

    download(docID: any) {
        window.location.href = `${this.apiUrl}reviewdownload/` + this.onboardId + "/" + docID
    }

    approveValidation(item: any, template: TemplateRef<any>) {
        if (this.validationReqList.find(x => x == item.DocTypeID)) {
            this.approveDocItem = item;
            this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
        }
        else {
            this.approveItem(item);
        }
    }

    approveItem(item: any) {
        this.loading=true;
        let fileNameArr = item.SignedFilepath.split('\\');
        let indexFilename = fileNameArr.length;
        let fileName = fileNameArr[indexFilename - 1];
        let requestItem: any = {
            traineeID: this.traineeId,
            FileName: fileName,
            FilePath: 'Content/Resume/' + this.traineeId + '/' + fileName,
            loggedUserEmail: this.loggedTraineeId,
            docType: item.DocTypeID,
            startDate: getFormattedDate(item.startDate),
            expiryDate: getFormattedDate(item.expiryDate),
            "otherInfo": {
                "title": '',
                "Client": '',
                "rate": '',
                "salary": '',
                "state": '',
            },
            onboardID: this.onboardId,
            oldPath: item.SignedFilepath,
            newPath: 'C:/inetpub/vhosts/tresume.us/httpdocs/Content/Resume/' + this.traineeId + '/' + fileName,
        }
        this.service.approveFile(requestItem).subscribe((x: any) => {
            this.loading=false;
            this.messageService.add({ severity: 'success', summary: 'File Approved' });
        },
        error => {
          console.error('Error:', error);
          this.loading = false;
        });
            this.getOnboardRequests();
            this.approveDocItem = {};
            this.modalService.hide();

    }

    rejectItem(item: any, template: TemplateRef<any>) {
        this.rejectDocItem = item;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    }

    delete(item: any) {
        this.service.deleteRequestedDoc(item.ID, item.OnboardID).subscribe(x => {
            this.getOnboardRequests();
        });
    }

    complete() {
        if (this.requestedList && this.requestedList.filter(x => x.Status == 0).length == 0) {
            //this.messageService.add({ severity: 'success', summary: 'Onboarding Complete' });
            let req = {
                onboardId:this.onboardId
            }
            this.service.updateOnboardingStatus1(req).subscribe(x => {
                this.router.navigate(['/onboardingList']);
            })
        }
        else {
            this.messageService.add({ severity: 'error', summary: 'Documents Pending', detail: 'Please approve all the Documents' });
        }
    }

    resendEmail() {
        let requestItem: any = {
            onboardID: this.onboardId,
            orgID: this.OrgID || 9,
            traineeID: this.traineeId,

        }
        this.service.generateOnboardingsession(requestItem).subscribe((x: any) => {
            if (x) {
                console.log('x', x)
                let url = "https://tresume.us/onboard/employee/" + x[0].SessionID
                let requestItem: any = {
                    //to: 'rohit@tresume.us',
                    to: this.candidateDetails.UserName,
                    subject: 'Onboarding Documents Request',
                    text: "Hi, <br><br> Please Upload the Documents in the link below <br> <a href=" + url + ">Access Tresume Link</a> <br><br> <i>Note: Link will be only valid for 7 days</i> <br><br>Thank you<br>Tresume"
                }
                this.service.emailOfferLetter(requestItem).subscribe(x => {
                });
            }
        })
        this.messageService.add({ severity: 'success', summary: 'Email Sent', detail: this.candidateDetails.UserName });
    }

    createAdhocDoc(template: TemplateRef<any>, checklist: any) {
        this.adhocDocItem.checklistID = checklist[0]?.AdditionalChecklistID;
        this.adhocDocItem.checklistName = checklist[0]?.AdditionalChecklistName;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
        let requestItem: any = {
            OrgID: this.OrgID,
        }
        this.service.getDocTypes(requestItem).subscribe((x: any) => {
            this.docTypes = x.map((item: any) => {
                return { name: item.DocTypeName, value: item.DTID };
            });
        });
    }

    uploadAdhocDoc(docItem: any) {
        if (this.adhocUploadFile) {
            let file = this.adhocUploadFile;
            let uploadUrl = this.uploadUrl + '/' + this.onboardId;
            let reqBody = this.traineeId;
            this.service.uploadOnboardDocument(uploadUrl, file, reqBody).subscribe((x: any) => {
                if (x.type == 4) {
                    if (x.body.code == 'LIMIT_FILE_SIZE') {
                        console.log('error upload')
                        return;
                    }
                }
                if (x.body) {
                    let requestItem: any = {
                        onboardID: this.onboardId,
                        docTypeName: docItem.selectedDocType.name,
                        docTypeID: docItem.selectedDocType.value,
                        filepath: x.body.FilePath,
                        requested: 1,
                        docNote: docItem?.note || '',
                        additionalChecklistID: this.adhocDocItem.checklistID || '',
                        additionalChecklistName: this.adhocDocItem.checklistName || ''
                    }

                    this.service.savefilepath(requestItem).subscribe(x => {
                        this.modalService.hide();
                        this.adhocDocItem = {};
                        this.adhocUploadFile = {};
                        this.sendEmailonAdhocReq();
                    });
                }
            });
        }
        else {
            let requestItem: any = {
                onboardID: this.onboardId,
                docTypeName: docItem.selectedDocType.name,
                docTypeID: docItem.selectedDocType.value,
                requested: 1,
                docNote: docItem.note || '',
                additionalChecklistID: this.adhocDocItem.checklistID || '',
                additionalChecklistName: this.adhocDocItem.checklistName || ''
            }

            this.service.savefilepath(requestItem).subscribe(x => {
                this.modalService.hide();
                this.adhocDocItem = {};
                this.sendEmailonAdhocReq();
            });
        }

    }

    sendEmailonAdhocReq() {
        let requestItem: any = {
            onboardID: this.onboardId,
            orgID: this.OrgID || 9,
            traineeID: this.traineeId,

        }
        this.service.generateOnboardingsession(requestItem).subscribe((x: any) => {
            if (x) {
                console.log('x', x)
                let url = "https://tresume.us/onboard/employee/" + x[0].SessionID
                let requestItem: any = {
                    //to: 'rohit@tresume.us',
                    to: this.candidateDetails.UserName,
                    subject: 'Onboarding Documents Request - New Documents Requested',
                    text: "Hi, <br><br> Please Upload the Documents in the link below <br> <a href=" + url + ">Access Tresume Link</a> <br><br> <i>Note: Link will be only valid for 7 days</i> <br><br>Thank you<br>Tresume"
                }
                this.service.emailOfferLetter(requestItem).subscribe(x => {
                });
            }
        })
        this.getOnboardRequests();
    }

    createAdditionalChecklist(template: TemplateRef<any>) {
        this.adhocDocItem.checklistID = this.onboardId + this.requestedList.length;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
        let requestItem: any = {
            OrgID: this.OrgID,
        }
        this.service.getDocTypes(requestItem).subscribe((x: any) => {
            this.docTypes = x.map((item: any) => {
                return { name: item.DocTypeName, value: item.DTID };
            });
        });
    }

    updateRejectNote(docItem: any) {
        console.log('docItem', docItem)
        let requestItem: any = {
            onBoardID: this.onboardId,
            note: this.rejectDocItem.note,
            id: docItem.ID
        }
        this.service.rejectDoc(requestItem).subscribe(x => {
            this.modalService.hide();
            this.rejectDocItem = {};
            let requestItem: any = {
                onboardID: this.onboardId,
                orgID: this.OrgID || 9,
                traineeID: this.traineeId,

            }
            this.service.generateOnboardingsession(requestItem).subscribe((x: any) => {
                if (x) {
                    console.log('x', x)
                    let url = "https://tresume.us/onboard/employee/" + x[0].SessionID
                    let requestItem: any = {
                        //to: 'rohit@tresume.us',
                        to: this.candidateDetails.UserName,
                        subject: 'Onboarding Documents - Document request needs attention',
                        text: "Hi, <br><br> A document was rejected from the employer. Please review the Document request notes in the link below <br> <a href=" + url + ">Access Tresume Link</a> <br><br> <i>Note: Link will be only valid for 7 days</i> <br><br>Thank you<br>Tresume"
                    }
                    this.service.emailOfferLetter(requestItem).subscribe(x => {
                    });
                }
            })
            this.getOnboardRequests();
        });
    }

    rejectCancel(item: any) {
        this.service.deleteRequestedDoc(item.ID, item.OnboardID).subscribe(x => {
            this.modalService.hide();
            this.getOnboardRequests();
        });
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

    public connectAdobe() {
        let requestItem: any = {
            onboardID: this.onboardId,
            docTypeName: 'ESIGN',
            docTypeID: 51,
            requested: 1,
            docNote: '',
            additionalChecklistID: -998,
            additionalChecklistName: 'Adobe E-Sign'
        }

        this.service.savefilepath(requestItem).subscribe(x => {
            let adobeUrl = "https://secure.na4.adobesign.com/public/oauth/v2?response_type=code&client_id=CBJCHBCAABAApA85epC6yGOUGFJailUdDMcf8UgYnCL6&redirect_uri=https://tresume.us/TresumeAPI/getAdobeAccessToken&scope=user_read:account+user_write:account+user_login:account+agreement_read:account+agreement_write:account+agreement_send:account+widget_read:account+widget_write:account+library_read:account+library_write:account+workflow_read:account+workflow_write:account";
            window.location.href = adobeUrl;
        });

    }

    createEsignDoc(template: TemplateRef<any>, checklist: any) {
        //this.adhocDocItem.checklistID = checklist[0]?.AdditionalChecklistID;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
        let requestItem: any = {
            OrgID: this.OrgID,
        }
        this.service.getDocTypes(requestItem).subscribe((x: any) => {
            this.docTypes = x.map((item: any) => {
                return { name: item.DocTypeName, value: item.DTID };
            });
        });
    }

    uploadeSignDoc(docItem: any) {
        if (this.adhocUploadFile) {
            let file = this.adhocUploadFile;
            this.sendToAdobe(this.adhocUploadFile);
            /* setTimeout(() => {
                this.saveEsignDoc(docItem);
            }, 1000); */
            /* let uploadUrl = this.uploadUrl + '/' + this.onboardId;
            let reqBody = this.traineeId;
            this.service.uploadOnboardDocument(uploadUrl, file, reqBody).subscribe((x: any) => {
                if (x.type == 4) {
                    if (x.body.code == 'LIMIT_FILE_SIZE') {
                        console.log('error upload')
                        return;
                    }
                }
                if (x.body) {
                    let requestItem: any = {
                        onboardID: this.onboardId,
                        docTypeName: docItem.selectedDocType.name,
                        docTypeID: docItem.selectedDocType.value,
                        filepath: x.body.FilePath,
                        requested: 1,
                        docNote: docItem?.note || '',
                        additionalChecklistID: this.adhocDocItem.checklistID || ''
                    }

                    this.service.savefilepath(requestItem).subscribe(x => {
                        this.modalService.hide();

                        this.adhocDocItem = {};
                        this.adhocUploadFile = {};
                    });
                }
            }); */
        }

    }

    public sendToAdobe(file: any) {
        this.service.uploadTransientDocument(file, this.adobeAccessToken).subscribe(
            (data: any) => {
                if (data && data.body) {
                    this.transientDocumentId = data.body.transientDocumentId;
                    console.log('this.transientDocumentId', this.transientDocumentId);
                    this.createAgreement();
                }
            },
            (error: any) => {
                if (error.status === 500) {
                    this.connectAdobe();
                }
            }
        );

    }

    createAgreement() {
        const requestBody = {
            transientDocumentId: this.transientDocumentId,
            recipientEmail: 'roh1t.kumar@outlook.com',
            agreementName: 'Test',
            accessToken: this.adobeAccessToken
        };

        this.service.createAgreement(requestBody).subscribe((data: any) => {
            if (data) {
                this.agreementId = data.agreementId;
                console.log('this.agreementId', this.agreementId)
                this.saveEsignDoc(this.adhocDocItem);
                this.esign.getEsignDocs();
            }

        });
    }

    saveEsignDoc(docItem: any) {
        let requestItem: any = {
            onboardID: this.onboardId,
            docTypeName: docItem.selectedDocType.name,
            docTypeID: docItem.selectedDocType.value,
            agreementID: this.agreementId,
            docTransientID: this.transientDocumentId,
            status: 0
        }

        this.service.insertEsignDocs(requestItem).subscribe(x => {
            this.modalService.hide();
            this.adhocDocItem = {};
            this.adhocUploadFile = {};
        });
    };

    public preloadSteps() {
        this.adhocDocItem.checklistID = this.onboardId + this.requestedList.length;
        let requestItem1: any = {
            onboardID: this.onboardId,
            docTypeName: "HireRight Confirmations",
            docTypeID: 52,
            requested: 1,
            docNote: '',
            additionalChecklistID: this.adhocDocItem.checklistID || '',
            additionalChecklistName: 'HireRight'
        }

        this.service.savefilepath(requestItem1).subscribe(x => {

        });
        let requestItem2: any = {
            onboardID: this.onboardId,
            docTypeName: "ESIGN",
            docTypeID: 51,
            requested: 1,
            docNote: '',
            additionalChecklistID: this.adhocDocItem.checklistID + 1,
            additionalChecklistName: 'Adobe on-boarding'
        }

        this.service.savefilepath(requestItem2).subscribe(x => {

        });
        let requestItem3: any = {
            onboardID: this.onboardId,
            docTypeName: "Orientation",
            docTypeID: 27,
            requested: 1,
            docNote: '',
            additionalChecklistID: this.adhocDocItem.checklistID + 1,
            additionalChecklistName: 'Orientation'
        }

        this.service.savefilepath(requestItem3).subscribe(x => {

        });
    }
}
