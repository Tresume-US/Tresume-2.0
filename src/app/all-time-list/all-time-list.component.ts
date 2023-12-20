import { Component, OnInit, OnChanges } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TimesheetListService } from './all-time-list.service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-all-time-list',
  templateUrl: './all-time-list.component.html',
  providers: [CookieService,TimesheetListService,MessageService],
  styleUrls: ['./all-time-list.component.scss']
})
export class AllTimeListComponent implements OnChanges {

  tableData: any [];
  showConfirmationDialog: boolean = false;
  router: any;
  OrgID:string = '';
  TraineeID:string = '';

  constructor(private cookieService: CookieService, private service: TimesheetListService, private messageService: MessageService)
  {}

  ngOnInit(): void {
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.fetchtimesheet();
  }

  ngOnChanges(): void{
    // this.fetchtimesheet();
  }
  fetchtimesheet(){
    let Req = {
      traineeID: this.TraineeID,
    };
    this.service.getAllTimeList(Req).subscribe((x: any) => {
      this.tableData = x.result;
    });
  }

 

}