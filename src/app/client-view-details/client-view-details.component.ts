import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-client-view-details',
  templateUrl: './client-view-details.component.html',
  styleUrls: ['./client-view-details.component.scss']
})


export class ClientViewDetailsComponent implements OnInit {

  clients: any[];
  constructor( private router: Router, private route: ActivatedRoute,) { }

  ngOnInit(): void {
  }

}
