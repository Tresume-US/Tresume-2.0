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
  file:File;
  username: string | Blob;
  CorporateDocumentTypeID: string | Blob;
  selectedOrgID:any;
  multiorgID:any;

  constructor(private cookieService: CookieService, private service: CorporateDocumentService, private messageService: MessageService, private router: Router, private route: ActivatedRoute) {
    this.OrgID = this.cookieService.get('OrgID');
    this.selectedOrgID = this.OrgID;
  }

  ngOnInit(): void {
    this.loading = true;
    this.TraineeID = this.cookieService.get('TraineeID');
    this.username = this.cookieService.get('userName1');
    this.OrgID = this.cookieService.get('OrgID');
    this.fetchDocumnetType();
    this.fetchTabslist(1);
    this.fetchmultiorg();
    this.corporateTabIndex = 0;
    this.miscellaneousTabIndex = 0;
    this.selectedOrgID = this.OrgID;
  }

  
  fetchDocumnetType() {
    this.loading = true
    const Req = {
    };
    this.service.getDocumnetType(Req).subscribe((x: any) => {
      this.DocumentType = x;
      this.loading = false
    },(error) => {
      this.loading=false
      console.error("Upload failed:", error);
    });
    console.log("Document Type",this.DocumentType);
  }

  fetchmultiorg() {
    const Req = {
      useremail:this.username
    };
    this.service.fetchmultiorg(Req).subscribe((x: any) => {
      this.multiorgID = x;
      this.loading=false
    },(error) => {
      this.loading=false
      console.error("Upload failed:", error);
    });
    console.log("Document Type",this.multiorgID);
  }

  fetchTabslist(typeid:any) {
    this.loading = true;
    let Req = {
      typeid: typeid,
      OrgID: this.selectedOrgID,
    };
    this.service.getTabsList(Req).subscribe((x: any) => {
      this.DocumentData = x.result;
      this.loading=false
    },(error) => {
      this.loading=false
      console.error("Upload failed:", error);
    });
  }

  delete(CorporateDocumentID:any,tablist:any){
    this.loading = true
    let Req = {
      CorporateDocumentID: CorporateDocumentID,
    };
    this.service.deletecorporatedocument(Req).subscribe((x: any) => {
      // this.DocumentType = x.result;
      this.fetchTabslist(tablist);
      this.messageService.add({ severity: 'success', summary: 'Successfully Doucment Deleted'});
      this.loading = false
    },(error) => {
      this.loading=false
      this.messageService.add({ severity: 'error', summary:  'Please try again later' });
      console.error("Upload failed:", error);
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

  upload(){
    this.loading = true
    if (!this.file) {
      console.error("No file selected!");
      return;
    }
    const formData = new FormData();
    formData.append('TraineeID', this.TraineeID);
    formData.append('file', this.file);
    formData.append('CreateBy', this.username);
    formData.append('OrgID', this.OrgID);
    formData.append('CorporateDocumentTypeID', this.CorporateDocumentTypeID);
    this.service.uploadCorporateDoc(formData).subscribe((x: any) => {
      this.loading = false;
      this.messageService.add({ severity: 'success', summary: x.message });
      
    },(error) => {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary:  'Please try again later' });
      console.error("Upload failed:", error);
    });
  }

  

  onFileChange(event: any) {
    this.file = event.target.files[0] as File;
  }
}
