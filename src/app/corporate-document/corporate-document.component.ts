import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-corporate-document',
  templateUrl: './corporate-document.component.html',
  styleUrls: ['./corporate-document.component.scss']
})
export class CorporateDocumentComponent implements OnInit {

  loading: boolean = false;
  DocumentType: any;

  constructor() { }

  ngOnInit(): void {
  }

}
