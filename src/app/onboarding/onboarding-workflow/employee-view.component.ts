import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OnboardingService } from '../onboarding.service';
import { AppService } from '../../app.service';
import { saveAs } from 'file-saver';
import { environment } from '../../../environments/environment';


@Component({
    selector: 'app-employee-view',
    templateUrl: './employee-view.component.html',
    providers: [OnboardingService],
    styleUrls: ['../onboarding.component.scss']
})
export class EmployeeViewComponent implements OnInit {
  loading:boolean = false;
    public sessionID: string;
    public sessionDetails: any;
    public employeeDetails: any;
    requestedList: any[] = [];
    loaded: boolean = false;
    uploadFile: any[] = [];
    isCompleted: boolean;

    uploadUrl = `${environment.apiUrl}uploadReqOnboardDocument`;

    constructor(private route: ActivatedRoute, private service: OnboardingService, private router: Router, private appService: AppService,) {
        this.sessionID = this.route.snapshot.params["id"];
        //sessionStorage.setItem("Route", "Documents");
    }

    ngOnInit(): void {
        let req = {
            sessionID:this.sessionID
        }
        this.service.getOnboardingSession(req).subscribe((x: any) => {
            if (x[0]) {
                let CurrentDate = new Date(new Date());
                this.sessionDetails = x[0];
                let sessionExpiry = new Date(this.sessionDetails.Expiry);
                if (CurrentDate <= sessionExpiry) {
                    console.log('Valid')
                    this.getOnboardRequests();
                    this.getDetails();
                }
                else {
                    window.location.href = "https://www.tresume.us/Login.aspx";
                }
            }
            else {
                window.location.href = "https://www.tresume.us/Login.aspx";
            }
        });
    }

    getOnboardRequests() {
        let req={
            OnboardID:this.sessionDetails.OnboardID
        }
        this.service.getOnboardingRequest(req).subscribe((x: any) => {
            console.log('x', x)
            this.requestedList = x;
        });
    }

    getDetails() {
        this.appService.getTraineeDetails(this.sessionDetails.TraineeID).subscribe((x: any) => {
            let response = x.result;
            if (response) {
                this.employeeDetails = response[0];
                console.log('this.employeeDetails', this.employeeDetails)
                this.loaded = true;
            }
        });
    }

    download(docID: any) {
        window.location.href = `${environment.apiUrl}download/` + this.sessionDetails.OnboardID + "/" + docID
    }

    upload(item: any, i: any) {
        if (this.uploadFile[i]) {
            let file = this.uploadFile[i][0];
            let uploadUrl = this.uploadUrl + '/' + item.OnboardID;
            let reqBody = '';
            this.service.uploadReqOnboardDocument(uploadUrl, file, reqBody).subscribe((x: any) => {
                if (x.type == 4) {
                    if (x.body.code == 'LIMIT_FILE_SIZE') {
                        console.log('error upload')
                        return;
                    }
                }
                if (x.body) {
                    let requestItem: any = {
                        onboardID: this.sessionDetails.OnboardID,
                        docTypeID: item.DocTypeID,
                        filepath: x.body.FilePath
                    }

                    this.service.updatesignpath(requestItem).subscribe(x => {

                    });
                }
            });
            let requestItem: any = {
                onboardID: item.OnboardID,
                docTypeID: item.DocTypeID

            }
            this.service.updateDocStatus(requestItem).subscribe(x => {
                this.getOnboardRequests();
            });

        }
    }

    submitDocs() {
        this.isCompleted = true;
    }

}
