import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ResponseDetails } from './model';
import { environment } from '../../environments/environment';


@Injectable()

export class DashboardService {

    public endpoint = environment.apiUrl;
    //public endpoint = 'https://alpha.tresume.us/TresumeAPI/';

    constructor(private http: HttpClient) { }

    getFTC(item: RequestItem): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'adminFtcByMarketer/' + item.traineeID + '/' + item.startDate + '/' + item.endDate);
    }

    getPlacements(item: RequestItem): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'adminPlacementByMarketer/' + item.traineeID + '/' + item.startDate + '/' + item.endDate);
    }

    getBench(item: RequestItem): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'adminBenchByMarketer/' + item.traineeID + '/' + item.startDate + '/' + item.endDate);
    }

    getInterviews(item: RequestItem): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'adminInterviewByMarketer/' + item.traineeID + '/' + item.startDate + '/' + item.endDate);
    }

    getSubmissions(item: RequestItem): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'adminSubmissionByMarketer/' + item.traineeID + '/' + item.startDate + '/' + item.endDate);
    }

    getTraineeDetails(req: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getTraineeDetails/' , req);
    }

    getLegalStatus(id: any): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'getLegalStatus/' + id);
    }

    getJobBoardUsage(): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getJobBoardsUsage', '');
    }

    getFTCreport(request: any): Observable<ResponseDetails> {
        let requestDetails: any = { fromDate: request.fromDate, toDate: request.toDate, traineeId: request.traineeId, recruiterId: request.recruiterId, candidateStatus: request.candidateStatus };
        return this.http.post<ResponseDetails>(this.endpoint + 'getFTCReport', requestDetails);
    }

    getAllRecruiters(id: any): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'getAllRecruiters/' + id);
    }
}

export interface RequestItem {
    traineeID?: number;
    startDate?: string;
    endDate?: string;
}