import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()

export class TalentBenchService {
  public endpoint = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTalentBenchList(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getTalentBenchList', request);
  }

  AddTalentBenchList(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'AddTalentBenchList', request);
  }

  candidatestatus(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'candidatestatus', request);
  }

  getLegalStatus(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getLegalStatus', request);
  }

 fetchrecruiter(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'fetchrecruiter', request);
}

// DownloadSubmission(request: any): Observable<ResponseDetails> {
//   return this.http.post<ResponseDetails>(this.endpoint + 'DownloadSubmission', request);
// }

// downloadcandidatesubmission(traineeId: number): Observable<Blob> {
//   return this.http.get(`${this.endpoint}/downloadcandidatesubmission?TraineeID=${traineeId}`, { responseType: 'blob' });
// }

downloadcandidatesubmission(traineeId: string): Observable<Blob> {
  return this.http.get(`${this.endpoint}downloadcandidatesubmission?TraineeID=${traineeId}`, { responseType: 'blob' });
}

downloadcandidateInterview(traineeId: string): Observable<Blob> {
  return this.http.get(`${this.endpoint}downloadcandidateInterview?TraineeID=${traineeId}`, { responseType: 'blob' });
}

downloadcandidatePlacement(traineeId: string): Observable<Blob> {
  return this.http.get(`${this.endpoint}downloadcandidatePlacement?TraineeID=${traineeId}`, { responseType: 'blob' });
}

getGroupList(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'getGroupList', request);
}
addGroup(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'addGroup', request);
}
fetchmultiorg(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'fetchmultiorg', request);
}
fetchGroupList(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'fetchGroupList', request);
}

TBupdateSelected(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'TBupdateSelected', request);
}
deleteGroup(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'deleteGroup', request);
}
checkEmail(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'checkEmail', request);
}

insertTraineeInterview(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'insertTraineeInterview', request);
}

insertSubmissionInfo(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'insertSubmissionInfo', request);
}
PlacementReportDownload(request: any): Observable<any> {
  return this.http.post(this.endpoint + 'PlacementReportDownload',  request, { responseType: 'blob' });
}
DSRReportDownload(request: any): Observable<any> {
  return this.http.post(this.endpoint + 'DSRReportDownload', request, { responseType: 'blob' });
}
InterviewReportDownload(request: any): Observable<any> {
  return this.http.post(this.endpoint + 'InterviewReportDownload', request, { responseType: 'blob' });
}
}
export interface ResponseDetails {
  flag?: any;
  result?: any;
}