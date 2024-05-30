export interface ResponseDetails {
    interviewlist: any;
    placementlist: any;
    submissionlist: any;
    flag?: any;
    result?: any;
}

export enum CardType {
    FTC = 1,
    Placements,
    Bench,
    Legal,
    Interviews,
    Submissions
}