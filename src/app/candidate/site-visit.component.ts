import { Component, OnInit, ViewChild,Input } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateService } from './candidate.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-sitevisit',
    templateUrl: './site-visit.component.html',
    styleUrls: ['../app.component.scss'],
    providers: [CandidateService, DashboardService]
})


export class SiteVisitComponent implements OnInit {
    loading:boolean = false;

    public traineeId: any;
    public details: any;
    public eduDetails: any;
    public H1BStatus: any;
    public newJDDetails: any;
    public toggleView: boolean = false;
    @Input() candidateId: string;

    @ViewChild('lgModal', { static: false }) lgModal?: ModalDirective;

    constructor(private route: ActivatedRoute, private service: CandidateService, private dashservice: DashboardService) { 
    }

    ngOnInit(): void {
        this.traineeId=this.candidateId;
        let req = {
            traineeID:this.traineeId
        }
        this.service.getSiteVisitDetails(req).subscribe(x => {
            let response = x.result;
            if (response) {
                this.details = response[0];
                this.getLegalStatus();
                this.service.getTraineeEduDetails(this.traineeId).subscribe(x => {
                    this.toggleView = true;
                    let response = x.result;
                    if (response) {
                        this.eduDetails = response[0];
                    }

                });
            }

        });


    }

    public getLegalStatus() {
        this.dashservice.getLegalStatus(1).subscribe(x => {
            let response = x.result;
            if (response) {
                this.H1BStatus = response.filter((y: any) => y.LegalStatusID == 14)[0].Total;

            }
        });
    }

    public saveJD() {
        var str;
        str = this.details.JobDuties.replace(/'/g, '\'\'');
        let request = {
            jd: str,
            traineeID: this.traineeId
        }
        this.service.updateJobDuties(request).subscribe(x => {
            this.lgModal?.hide()
        });
    }

    printThisPage() {
        window.print();
    }

    public goBack() {
        window.history.back();
    }
}