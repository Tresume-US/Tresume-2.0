import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { CorporateDocumentService } from './corporate-document.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Console } from 'console';
@Component({
  selector: 'app-corporate-document',
  templateUrl: './corporate-document.component.html',
  providers: [CookieService, CorporateDocumentService, MessageService],
  styleUrls: ['./corporate-document.component.scss']
})

export class CorporateDocumentComponent implements OnInit {

  TraineeID: string = '';
  loading: boolean = false;
  DocumentType: any;
  CDTID: any;
  OrgID: any;
  corporateTabIndex: number = 0;
  miscellaneousTabIndex: number = 0;
  DocumentData: any;

  constructor(private cookieService: CookieService, private service: CorporateDocumentService, private messageService: MessageService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.TraineeID = this.cookieService.get('TraineeID');
    this.OrgID = this.cookieService.get('OrgID');
    this.fetchDocumnetType();
    this.fetchTabslist(1);
    this.corporateTabIndex = 0;
    this.miscellaneousTabIndex = 0;
  }

  
  fetchDocumnetType() {
    const Req = {
    };
    this.service.getDocumnetType(Req).subscribe((x: any) => {
      this.DocumentType = x;
    });
    console.log("Document Type",this.DocumentType);
  }

  fetchTabslist(typeid:any) {
    let Req = {
      typeid: typeid,
      OrgID: this.OrgID,
    };
    this.service.getTabsList(Req).subscribe((x: any) => {
      this.DocumentData = x.result;
    });
  }

  delete(CorporateDocumentID:any){
    let Req = {
      CorporateDocumentID: CorporateDocumentID,
    };
    this.service.deletecorporatedocument(Req).subscribe((x: any) => {
      this.DocumentType = x.result;
    });
  }

   download(DocumentPath: string) {

    const downloadLink = document.createElement('a');
    downloadLink.href = 'https://tresume.us/'+DocumentPath;  
    downloadLink.setAttribute('download', ''); 
    downloadLink.setAttribute('target', '_blank'); 

    document.body.appendChild(downloadLink);

    downloadLink.click();
    
    document.body.removeChild(downloadLink);
  }
}
