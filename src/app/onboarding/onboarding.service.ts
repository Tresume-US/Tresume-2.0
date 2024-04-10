import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable()

export class OnboardingService {

    public endpoint = environment.apiUrl;
    //public endpoint = 'https://alpha.tresume.us/TresumeAPI/';
    //public endpoint = 'https://beta.tresume.us/TresumeAPI/';
    //public endpoint = 'http://localhost:3000/';
    private headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

    constructor(private http: HttpClient) { }

    getOnboardingList(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getOnboardingList', request);
    }

    getCandidateByStatusList(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getCandidatesbyStatus', request);
    }

    getChecklists(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getChecklists', request);
    }

    getDocTypes(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getDocTypes',request);
    }

    getNewChecklistID(request:any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getNewChecklistID',request);
    }

    saveChecklists(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'saveChecklist', request);
    }

    getWizardSteps(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getWizardSteps', request);
    }

    createOnboarding(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'createOnboarding', request);
    }

    deleteChecklist(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'deleteChecklist', request);
    }

    getChecklistNames(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getChecklistNames', request);
    }

    getOnboardingDetails(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getOnboardingDetails' , request);
    }

    getOnboardingRequest(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getOnboardingRequest' , request);
    }

    updateOnboardingStatus(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateOnboardStatus' , request);
    }

    updateOnboardingStatus1(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateOnboardStatus1/' , request);
    }

    saveOnboardingRequest(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'saveOnboardingRequest', request);
    }

    savefilepath(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'insertUploadFilepath', request);
    }

    updatesignpath(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateSignFilepath', request);
    }

    approveFile(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'approveFiles', request);
    }

    generateOnboardingsession(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'generateonboardSession', request);
    }

    updateDocStatus(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateDocStatus', request);
    }

    emailOfferLetter(request: any): Observable<ResponseDetails> {
        let params = new HttpParams({
            fromObject: { to: request.to, subject: request.subject, text: request.text },
        });

        let httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'text-mail', params.toString(), httpOptions);
    }

    uploadOnboardDocument(url: string, file: File, reqBody: any): Observable<HttpEvent<any>> {
        let formData = new FormData();
        formData.append('file', file);
        formData.append('loggedUserId', reqBody);
        let params = new HttpParams();
        const options = {
            params: params,
            reportProgress: true,
        };
        const req = new HttpRequest('POST', url, formData, options);
        return this.http.request(req);
    }

    uploadReqOnboardDocument(url: string, file: File, reqBody: any): Observable<HttpEvent<any>> {
        let formData = new FormData();
        formData.append('file', file);
        formData.append('loggedUserId', reqBody);
        let params = new HttpParams();
        const options = {
            params: params,
            reportProgress: true,
        };
        const req = new HttpRequest('POST', url, formData, options);
        return this.http.request(req);
    }

    getOnboardingSession(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'onboardSession' , request);
    }

    // getDocumentPath(id: any): Observable<ResponseDetails> {
    //     return this.http.get<ResponseDetails>(this.endpoint + 'getDocPath/' + id);
    // }

    // downloadFile(id: any): Observable<ResponseDetails> {
    //     return this.http.get<ResponseDetails>(this.endpoint + 'download/' + id);
    // }

    deleteCurrentOnboarding(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'deleteOnboard', request);
    }

    rejectDoc(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'rejectDoc', request);
    }

    deleteRequestedDoc(id: any, onBoardID: any): Observable<ResponseDetails> {
        let request = {
            id: id, onBoardID: onBoardID
        }
        return this.http.post<ResponseDetails>(this.endpoint + 'deleteRequestedDoc', request);
    }

    //Adobe E-Sign

    getAdobeToken() {
        return this.http.get<ResponseDetails>(this.endpoint + 'getAdobetoken');
    }

    getAdobeCreds() {
        return this.http.get<ResponseDetails>(this.endpoint + 'getAdobeCred');
    }

    getEsignDocs(id: any): Observable<ResponseDetails> {
        let request = {
            id: id
        }
        return this.http.post<ResponseDetails>(this.endpoint + 'getEsignDocs', request);
    }

    insertEsignDocs(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'insertEsignDocs', request);
    };

    uploadTransientDocument(file: any, token: any): Observable<HttpEvent<any>> {
        let formData = new FormData();
        formData.append('File', file);
        formData.append('token', token);
        /* let params = new HttpParams();
        const options = {
            params: params,
            reportProgress: true,
        }; */
        const req = new HttpRequest('POST', this.endpoint + "/uploadtransientDocuments", formData);
        return this.http.request(req);
    }

    createAgreement(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'agreements', request);
    };

    getAgreementDetails(id: any): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'agreements/' + id);
    }

    getAgreementDocs(id: any): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'agreements/' + id + '/documents');
    }

    downloadAgreement(id: any, docid: any): Observable<ResponseDetails> {
        return this.http.get<ResponseDetails>(this.endpoint + 'agreements/' + id + '/documents/' + docid);
    };

    getTotalOnbaordings(orgID: any): Observable<ResponseDetails> {
        let req = { OrgID: orgID }
        return this.http.post<ResponseDetails>(this.endpoint + 'getOnboardingCount', req);
    }

    getorganizationLogo(orgID: any): Observable<ResponseDetails> {
        let req = { OrgID: orgID }
        return this.http.post<ResponseDetails>(this.endpoint + 'getorganizationLogo', req);
    }

}

export interface ResponseDetails {
    flag?: any;
    result?: any;
}

const httpOptions = {
    headers: new HttpHeaders({
        'responseType': 'blob',
    }),
};