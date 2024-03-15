import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import { Router } from "@angular/router";
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { OnboardingService } from '../onboarding.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-import-details',
    templateUrl: './import-details.component.html',
    providers: [OnboardingService],
    styleUrls: ['../onboarding.component.scss']
})
export class ImportDetailsComponent implements OnInit {

     loading:boolean = false;
    public selectedState: string;
    public isCandidateSelected: boolean = false;
    public selectedEmployee: any;
    public OrgID: any;
    useremail: string;

    constructor(private service: OnboardingService, private router: Router, private cookieService: CookieService) {
        this.useremail = this.cookieService.get('userName1'); 
    }

    public candidateNames: any;

    ngOnInit(): void {
        this.useremail = this.cookieService.get('userName1')
        console.log('this.useremail', this.useremail)
        let requestItem: any = {
            useremail: this.useremail ,
        }
        this.service.getCandidateByStatusList(requestItem).subscribe(x => {
            this.candidateNames = x;
        });
    }


    typeaheadOnSelect(e: TypeaheadMatch): void {
        this.isCandidateSelected = true;
        if (e.item) {
            this.selectedEmployee = e.item;
        }
        console.log('Selected value: ', e.value);
    }

    startOnboard() {
        let requestItem: any = {
            OrgID: this.selectedEmployee.organizationid,
            traineeID: this.selectedEmployee.TraineeID,
            FirstName: this.selectedEmployee.FirstName,
            LastName: this.selectedEmployee.LastName

        }
        sessionStorage.setItem("OnBoardTraineeID", this.selectedEmployee.TraineeID.toString());
        this.service.createOnboarding(requestItem).subscribe((x: any) => {
            this.router.navigate(['/onboard/step/' + x[0].ID]);
        });
    }
}
