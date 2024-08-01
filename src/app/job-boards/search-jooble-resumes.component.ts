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
    selector: 'app-search-jooble-resumes',
    templateUrl: './search-jooble-resumes.component.html',
    providers: [JobBoardsService, CookieService, MessageService],
    styleUrls: ['./search-resumes.component.scss']
})


export class SearchResumesJoobleComponent implements OnInit {

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
keyWord:string
    rowData: any;
    columnDefs: any;
    public gridOptions: GridOptions = {};
    public gridApi: GridApi;
    public selectedState: string;
    public resumeHTMLContent: string;
    traineeId: string | null;
    private cookieValue: any;
    loggedTraineeId: any;
    skills: any[] = [];
    resultsFound: boolean = false;
    loading: boolean = false;
    searchRequestItem: any = {};

    totalResults: any;

    constructor(private route: ActivatedRoute, private service: JobBoardsService, private cookieService: CookieService,
        private messageService1: MessageService, private sanitizer: DomSanitizer) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        if (this.traineeId == '') {
            this.traineeId = localStorage.getItem("TraineeID");
        }
    }

    ngOnInit(): void {
        this.cookieValue = this.cookieService.get('userName1')

    }


    public download(params: any) {
        window.open(params.link, '_blank');
    }

    public onSearch() {
        this.loading = true;
        this.searchRequestItem.keywords = this.model.keyword;
        this.searchRequestItem.location = this.selectedState;
        this.service.getJoobleSearch(this.searchRequestItem).subscribe((x: any) => {
            this.loading = false;
            this.resultsFound = true;
            let response = x;
            this.totalResults = response.totalCount;
            this.rowData = response.jobs;
        });
        this.keyWord=this.model.keyword.toLowerCase()
    }

    pageChanged(event: PageChangedEvent): void {
        this.searchRequestItem.page = event.page;
        this.onSearch();
        const startItem = (event.page - 1) * event.itemsPerPage;
        const endItem = event.page * event.itemsPerPage;
        window.scrollTo(0, 0);

    }

}

