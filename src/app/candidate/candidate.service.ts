import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable()

export class CandidateService {

    public endpoint = environment.apiUrl;
    //public endpoint = 'https://alpha.tresume.us/TresumeAPI/';
    //public endpoint = 'http://localhost:3000/';

    constructor(private http: HttpClient) { }

    getDocuments(item: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getCandidateDocuments', item);
    }

    deleteDocument(docId: number): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'deleteDocument/' + docId);
    }

    uploadDocument(url: string, file: File, reqBody: any): Observable<HttpEvent<any>> {
        let formData = new FormData();
        formData.append('file', file);
        formData.append('loggedUserId', reqBody);
        formData.append('store', "Resume");
        let params = new HttpParams();
        const options = {
            params: params,
            reportProgress: true,
        };
        const req = new HttpRequest('POST', url, formData, options);
        return this.http.request(req);
    }

    uploadInsert(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'uploadinsert', request);
    }

    getSiteVisitDetails(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'sitevisit' , request);
    }

    getTraineeEduDetails(id: RequestItem): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'getEducationDetails/' + id);
    }

    updateJobDuties(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateJobDuties', request);
    }

    updatesupervised(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updatesupervised', request);
    }

    updateworktype(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateworktype', request);
    }

    getPlacementDetails(placementID: number) {
        return this.http.post<ResponseDetails>(this.endpoint + 'getPlacementDetails', { placementID: placementID });
    }

    getMarketerNames(request: any) {
        return this.http.post<ResponseDetails>(this.endpoint + 'getMarketerNames', request);
    }

    addUpdatePlacementDetails(request: any) {
        return this.http.post<ResponseDetails>(this.endpoint + 'addPlacement', request);
    }

    changeDocStatus(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'changeDocStatus', request);
    }
    getplacementsBytID(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getplacementsBytID', request);
    }
    UpdateplacementsBytID(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'UpdateplacementsBytID', request);
    }

}

export interface RequestItem {
    traineeID?: number;
}

export interface ResponseDetails {
    flag?: any;
    result?: any;
}