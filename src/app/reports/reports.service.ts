import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

export interface ResponseDetails {
    RecruitmentmanagerID: number;
    ActiveJobs: number;
    InactiveJobs: number;
    ClientName: string;
  }

@Injectable()

export class ReportsService {

    public endpoint = environment.apiUrl;
    //public endpoint = 'https://alpha.tresume.us/TresumeAPI/';
    //public localendpoint = 'http://localhost:3000/';

  constructor(private http: HttpClient, private cookieService: CookieService) { }

    getInterviewReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getInterviewsReport', requestDetails);
    }

    getBenchTrackerReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getBenchTrackerReport', requestDetails);
    }

    getPlacementsReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getPlacementsReport', requestDetails);
    }

    getLegalStatusReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getLegalStatusReport', requestDetails);
    }

    getH1BExpiryReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getH1BExpiryReport', requestDetails);
    }

    getTimesheetReport(request: any): Observable<ResponseDetails> {
      let requestDetails: any = {
        fromDate: formatDate(request.startDate, 'yyyy-MM-dd', "en-US"), 
        endDate: formatDate(request.endDate, 'yyyy-MM-dd', "en-US"), 
        OrganizationId: this.cookieService.get("OrgID")
      };
      return this.http.post<ResponseDetails>(this.endpoint + 'getNotSubmittedReport', requestDetails);

    }

    getSiteVisitReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            traineeId: request.traineeId
        };
      return this.http.post<ResponseDetails>(this.endpoint + 'getSiteVistReport', requestDetails);
    }

    getPFAReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getPFAReport', requestDetails);
    }

    getDocExpiryReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getDocumentExpiryReport', requestDetails);
    }

    getBillableEmployeeReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getBillableEmployeeReport', requestDetails);
    }

    getNonH1BReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getNonH1BReport', requestDetails);
    }

    getDSRReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId,
            OrganizationId: request.OrganizationId,
            UserRole: request.UserRole,
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getDSRReport', requestDetails);
    }
    getjobreportbystatus(request: any): Observable<ResponseDetails[]> {
        const requestDetails = {
          traineeId: request.traineeId,
          startDate: request.startDate,
            endDate: request.endDate
        };
        return this.http.post<ResponseDetails[]>(this.endpoint + 'getjobreportbystatus', requestDetails);
      }
      getjobreportbyclient(request: any): Observable<ResponseDetails[]> {
        const requestDetails = {
          traineeId: request.traineeId,
          startDate: request.startDate,
            endDate: request.endDate
        };
        return this.http.post<ResponseDetails[]>(this.endpoint + 'getjobreportbyclient', requestDetails);
      }
      getjobreportbydate(request: any): Observable<ResponseDetails[]> {
        const requestDetails = {
          traineeId: request.traineeId,
          startDate: request.startDate,  // Consistent naming
          endDate: request.endDate       // Consistent naming
        };
      
        return this.http.post<ResponseDetails[]>(this.endpoint + 'getjobreportbydate', requestDetails);
      }
      

    getJobBoardAuditReport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = {
            startDate: request.startDate,
            endDate: request.endDate,
            traineeId: request.traineeId
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'getJobBoardAuditReport', requestDetails);
    }

  getTimeSheetReport(request: any): Observable<ResponseDetails> {
    let requestDetails: any = {
      startDate: request.startDate.replaceAll("/", "-"),
      endDate: request.startDate.replaceAll("/", "-"), 
      OrganizationId: request.OrganizationId
    };
    return this.http.post<ResponseDetails>(this.endpoint + 'getSubmittedRatio', requestDetails);
  }

  JobboardUsageReport(request: any): Observable<ResponseDetails> {
    let requestDetails: any = {
        startDate: request.startDate,
        endDate: request.endDate,
        OrgID: request.OrgID
    };
    return this.http.post<ResponseDetails>(this.endpoint + 'JobboardUsageReport', requestDetails);
}

getStatusReport(request: any): Observable<ResponseDetails> {
    let requestDetails: any = {
        startDate: request.startDate,
        endDate: request.endDate,
        traineeId: request.traineeId
    };
    return this.http.post<ResponseDetails>(this.endpoint + 'getStatusReport', requestDetails);
}

}

export interface RequestItem {
    traineeID?: number;
    startDate?: string;
    endDate?: string;
}

export interface ResponseDetails {
    inactive: any;
    active: any;
    flag?: any;
    result?: any;
}
