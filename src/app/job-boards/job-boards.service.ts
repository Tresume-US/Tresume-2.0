import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable()

export class JobBoardsService {


    public endpoint = environment.apiUrl;
    //public endpoint = 'https://alpha.tresume.us/TresumeAPI/';
    //public endpoint = 'https://beta.tresume.us/TresumeAPI/';
    // public endpoint = 'http://localhost:3000/';

    constructor(private http: HttpClient) { }

    checkIfResumeExists(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'checkIfJobSeekerResumeExists', request);
    }

    createJobSeekerProfile(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'createJobSeekerDetails', request);
    }

    checkIfProfileMigrated(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'checkIfProfileMigrated', request);
    }

    uploadJobBoardResume(request: any): Observable<ResponseDetails> {
        let httpOptions = {
            headers: new HttpHeaders({ 'gzip': 'true' }),
        };
        return this.http.post<ResponseDetails>(this.endpoint + 'uploadJobBoardResume', request, httpOptions);
    }


    getResumes(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getResumes1', request);
    }

    getLoggedUser(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getLoggedUser', request);
    }

    getResumeDetails(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getResumeDetails', request);
    }

    saveResume(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'saveResume', request);
    }

    getResumePath(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getResumePath', request);
    }

    FetchRecruiterList(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'FetchRecruiterList', request);
    }
    updateCandidateNotes(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateCandidateNotes', request);
    }

    /* CB API */

    getCBAuthToken(): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getCBAuthToken', null);
    }

    getCBResumes(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'CBSearch', request);
    }

    getCBResumePreview(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'GetCBResumePreview', request);
    }

    getCBProfileDetails(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'GetCBProfileDetails', request);
    }

    getCBQuota(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getCBQuota', request);
    }

    jobBoardAudit(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'jobBoardAuditLog', request);
    }

    downloadCBpdf(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'downloadCBResume', request);
    }

    /* Monster API */

    getMonsterAuthToken(request: any): Observable<ResponseDetails> {
        let httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        };
        request = 'grant_type=client_credentials&scope=GatewayAccess&client_id=xw315565570wxrds&client_secret=3FeLETRO2RvkMszQ';
        return this.http.post<ResponseDetails>('https://sso.monster.com/core/connect/token', request, httpOptions);
    }

    getMonsterSearch(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getMonsterSearch', request);
    }

    getMonsterCandidateDetails(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getMonsterCandidateResume', request);
    }

    /* Dice API */

    getDiceAuthToken(request: any): Observable<ResponseDetails> {
        let httpOptions = {
            //headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic Y3AtYXN0YWNyczo2OGZmYzY5NS05YWM2LTRkMDYtODg3YS05YWY0NmRlYWRiY2U=' }),
            headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ZGlnaXRhbG1ha2Vyc3NvbHV0aW9uOjhlYTU4ZmNjLThkZGItNDEzYy04MTMwLTc5NWQyYTQ1NTAwOQ==' }),
        };
        //request = 'grant_type=password&username=santh@astacrs.com&password=Astanew_2021';
        request = 'grant_type=password&username=nithya@dmsol.in&password=Dicedms23@';
        return this.http.post<ResponseDetails>('https://secure.dice.com/oauth/token', request, httpOptions);
    }

    getDiceSearch(request: any, token: string): Observable<ResponseDetails> {
        let httpOptions = {
            headers: new HttpHeaders({ 'Authorization': 'bearer ' + token }),
        };
        return this.http.get<ResponseDetails>('https://talent-api.dice.com/v2/profiles/search?' + request, httpOptions);
    }

    getDiceIntelliSearch(request: any, token: string): Observable<ResponseDetails> {
        let httpOptions = {
            headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'bearer ' + token }),
        };
        return this.http.post<ResponseDetails>('https://talent-api.dice.com/v2/profiles/search',request, httpOptions);
    }

    getDiceProfileView(request: any, token: string): Observable<ResponseDetails> {
        let httpOptions = {
            headers: new HttpHeaders({ 'Authorization': 'bearer ' + token }),
        };
        return this.http.get<ResponseDetails>('https://talent-api.dice.com/v2/profiles/' + request, httpOptions);
    }

    getDiceToken(): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getDiceAuthToken', null);
    }

    //Jooble API

    getJoobleSearch(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getJoobleSearch', request);
    }
    //For Division
    fetchdvisioncredit(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'fetchdvisioncredit', request);
    }
    adddivisionaudit(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'adddivisionaudit', request);
    }
    getclientipaddress(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getclientipaddress', request);
    }

    fetchusage(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'fetchusage', request);
    }

    /* ClearanceJobs API*/
    getClearanceToken(): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getClearanceToken', null);
    }

    getClearanceResumes(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'ClearanceSearch', request);
    }

    getClreancePdf(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getClreancePdf', request);
    }

    getTresumedata(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getTresumedata', request);
    }

    atsmigrateprofile(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'atsmigrateprofile', request);
    }

    senddivisionerrormail(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'senddivisionerrormail', request);
    }

    checkmd5resume(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'checkmd5resume', request);
    }

    getcandidatelocation(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getcandidatelocation', request);
    }

    getResumes2(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getResumes2', request);
    }
    
    getResumes3(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getResumes3', request);
    }

    /* OPT Nation API*/
    optresumesearch(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'optresumesearch', request);
    }

    optresumeopen(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'optresumeopen', request);
    }

    optSaveResume(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'optSaveResume', request);
    }
    getjobtitle(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getjobtitle', request);
    }
    insertcandidatejob(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'insertcandidatejob', request);
    }
    getLocation(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getLocation', request);
      }
    
}

export interface ResponseDetails {
    flag?: any;
    result?: any;
}