import { Component, OnInit, ViewChild,Input } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateService } from './candidate.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup,Validators  } from '@angular/forms';
import { ReviewService } from '../review-tresume/review.service';


@Component({
    selector: 'app-sitevisit',
    templateUrl: './site-visit.component.html',
    styleUrls: ['../app.component.scss'],
    providers: [CandidateService, DashboardService,ReviewService]
})


export class SiteVisitComponent implements OnInit {
    @Input() supervisionInfo: string;
    loading:boolean = false;

    public traineeId: any;
    public details: any;
    public eduDetails: any;
    public H1BStatus: any;
    public newJDDetails: any;
    public toggleView: boolean = false;
    @Input() candidateId: string;

    @ViewChild('lgModal', { static: false }) lgModal?: ModalDirective;
    workTypeModal: any;
    TraineeID: string;
    candidateID: any;
    placementList: any;
    

    constructor(private route: ActivatedRoute, private service: CandidateService, private dashservice: DashboardService , private formBuilder: FormBuilder,private cookieService: CookieService, private Service:ReviewService) { 
        this.TraineeID = this.cookieService.get('TraineeID')
        this.candidateID = this.route.snapshot.params["traineeID"];
        this.supervisionForm = this.formBuilder.group({
            supervisionText: ['']
          });}
          isEditing: boolean = false;
          supervisionForm: FormGroup; 
    ngOnInit(): void {
        this.getPlacementList();
        this.supervisionForm = this.formBuilder.group({
          supervisionText: ['', Validators.required]
        });
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
    workType: string = ""; 
    editedWorkType: string = ""; 
    
    editWorkType() {
        this.editedWorkType = this.workType;
        this.workTypeModal.show();
      }

      toggleEdit(): void {
        this.isEditing = !this.isEditing;
        if (this.isEditing) {
          this.supervisionForm.patchValue({ supervisionText: this.details.supervised });
        }
      }

      saveChanges(): void {
        if (this.supervisionForm.valid) {
          const newSupervisedInfo = this.supervisionForm.value.supervisionText;
          const request = {
            supervised: newSupervisedInfo,
            traineeID: this.traineeId
          };
          this.service.updatesupervised(request).subscribe(() => {
            this.details.supervised = newSupervisedInfo;
            this.toggleEdit();
          });
        }
      }

      toggleEditS(): void {
        this.isEditing = !this.isEditing;
        if (this.isEditing) {
          this.editedWorkType = this.details.worktype;
        }
      }
    
      saveChangesedwork(): void {
        this.details.worktype = this.editedWorkType;
        const request = {
          worktype: this.editedWorkType,
          traineeID: this.traineeId
        };
        this.service.updateworktype(request).subscribe(() => {
        });
        this.toggleEditS();
      }
    
      cancelEdit(): void {
        this.toggleEdit();
        this.isEditing = false;
      }

    getPlacementList() {
        this.TraineeID = this.cookieService.get('TraineeID');
        const Req = {
          TraineeID: this.candidateID
        };
        this.Service.getPlacementList(Req).subscribe((x: any) => {
          this.placementList = x.result;
        });
      }

      showTable: boolean = false;

      toggleTable() {
        this.showTable = !this.showTable;
      }
    }