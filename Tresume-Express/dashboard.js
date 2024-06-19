const express = require("express");
const router = express.Router();
const pool = require("./database");
var request = require("request");
var sql = require("mssql");
const axios = require("axios");
const nodemailer = require("nodemailer");
var crypto = require("crypto");
const bodyparser = require('body-parser');
const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
const apiUrl = envconfig.apiUrl;
router.use(bodyparser.json());
const fs = require('fs');

router.post('/getAdminDashboardData', async (req, res) => {
    var startdate = req.body.StartDate
    var enddate = req.body.EndDate
    var accessorg = req.body.AccessOrg
    console.log(`SELECT CONCAT(R.FirstName, ' ', R.LastName) AS Recruiter, COUNT(*) AS InterviewCount FROM TraineeInterview TI INNER JOIN Trainee T ON TI.TraineeID = T.TraineeID INNER JOIN Trainee R ON TI.RecruiterID = R.TraineeID WHERE TI.Active = 1 AND TI.InterviewDate >= '${startdate}' AND TI.InterviewDate <= '${enddate}' AND R.OrganizationID IN (${accessorg}) GROUP BY CONCAT(R.FirstName, ' ', R.LastName) ORDER BY InterviewCount DESC;`);
    
    try {
        const [
            DsrData,
            Interviewdata,
            PlacementData,
            FtcData,
            jobboarddata 
        ] = await Promise.all([
            pool.query(`SELECT CONCAT(m.FirstName, ' ', m.LastName) AS Marketer, COUNT(*) AS SubmissionCount FROM submission s INNER JOIN Trainee t ON s.TraineeID = t.TraineeID INNER JOIN Trainee m ON s.markerterid = m.TraineeID WHERE s.Active = 1 AND m.Active = 1 AND s.SubmissionDate BETWEEN '${startdate}' AND '${enddate}' AND m.Organizationid IN (${accessorg}) GROUP BY CONCAT(m.FirstName, ' ', m.LastName) ORDER BY SubmissionCount DESC;`),

            pool.query(`SELECT CONCAT(R.FirstName, ' ', R.LastName) AS Recruiter, COUNT(*) AS InterviewCount FROM TraineeInterview TI INNER JOIN Trainee T ON TI.TraineeID = T.TraineeID INNER JOIN Trainee R ON TI.RecruiterID = R.TraineeID WHERE TI.Active = 1 AND TI.InterviewDate >= '${startdate}' AND TI.InterviewDate <= '${enddate}' AND R.OrganizationID IN (${accessorg}) GROUP BY CONCAT(R.FirstName, ' ', R.LastName) ORDER BY InterviewCount DESC;`),

            pool.query(`SELECT T2.FirstName + ' ' + T2.LastName AS MarketerName, COUNT(*) AS MarketerCount FROM placements P LEFT JOIN Trainee T1 ON P.TraineeID = T1.TraineeID LEFT JOIN Trainee T2 ON P.marketername = T2.TraineeID LEFT JOIN Trainee T3 ON P.RecuiterID = T3.TraineeID WHERE P.Active = 1 AND P.PlacedDate >= '${startdate}' AND P.PlacedDate < '${enddate}' AND T2.OrganizationID IN (${accessorg}) GROUP BY T2.FirstName + ' ' + T2.LastName ORDER BY MarketerCount DESC;`),

            pool.query(`SELECT CONCAT(R.FirstName, ' ', R.LastName) AS 'Recruiter', COUNT(*) AS RecruiterCount FROM Trainee T JOIN Currentstatus C ON C.CSID = T.CandidateStatus AND C.Active = 1 LEFT JOIN Trainee R ON R.TraineeID = T.RecruiterName AND R.Active = 1 WHERE T.Active = 1 AND T.UserOrganizationID IN (${accessorg}) AND T.CreateTime BETWEEN '${startdate}' AND '${enddate}' AND T.CandidateStatus = 8 AND R.Active = 1 GROUP BY CONCAT(R.FirstName, ' ', R.LastName) ORDER BY RecruiterCount DESC;`),
            pool.query(`SELECT Recruiter, monsterused, cbused, diceused FROM (SELECT CONCAT(T.FirstName, ' ', T.LastName) AS Recruiter, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 3 AND createtime BETWEEN '${startdate}' AND '${enddate}') AS monsterused, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 4 AND createtime BETWEEN '${startdate}' AND '${enddate}') AS cbused, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 2 AND createtime BETWEEN '${startdate}' AND '${enddate}') AS diceused FROM Trainee AS T INNER JOIN org_division AS OD ON T.Org_Div = OD.id WHERE T.organizationid IN (${accessorg}) AND T.Active = 1) AS Usage WHERE monsterused > 0 OR cbused > 0 OR diceused > 0 ORDER BY Recruiter;`),
            
        ]);

        const responseData = {
            DsrData: DsrData.recordset,
            Interviewdata: Interviewdata.recordset,
            PlacementData: PlacementData.recordset,
            FtcData: FtcData.recordset,
            jobboarddata:jobboarddata.recordset
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/getUserDashboardData', async (req, res) => {
    var startdate = req.body.StartDate
    var enddate = req.body.EndDate
    var traineeid = req.body.traineeId
    var username = req.body.username
    try {
        const [
            DsrData,
            Interviewdata,
            PlacementData,
            FtcData,
            diceData,
            cbData,
            monsterData 
        ] = await Promise.all([
            pool.query(`SELECT CAST(createtime AS DATE) AS Date, COUNT(*) AS RecordCount FROM trainee WHERE recruitername = '${traineeid}' AND createtime >= '${startdate}' AND createtime <= '${enddate}' GROUP BY CAST(createtime AS DATE) ORDER BY Date;`),

            pool.query(`SELECT CAST(InterviewDate AS DATE) AS Date, COUNT(*) AS InterviewCount FROM traineeinterview WHERE RecruiterID = '${traineeid}' AND InterviewDate >= '${startdate}' AND InterviewDate <= '${enddate}' GROUP BY CAST(InterviewDate AS DATE) ORDER BY Date;`),

            pool.query(`SELECT CAST(startdate AS DATE) AS Date, COUNT(*) AS PlacementCount FROM placements WHERE marketername = '${traineeid}' AND startdate >= '${startdate}' AND startdate <= '${enddate}' GROUP BY CAST(startdate AS DATE) ORDER BY Date;`),

            pool.query(`SELECT CAST(submissiondate AS DATE) AS Date, COUNT(*) AS SubmissionCount FROM submission WHERE markerterid = '${traineeid}' AND submissiondate >= '${startdate}' AND submissiondate <= '${enddate}' GROUP BY CAST(submissiondate AS DATE) ORDER BY Date;`),

            pool.query(`SELECT CAST(createtime AS DATE) AS Date, COUNT(*) AS RecordCount FROM division_audit WHERE username = '${username}' AND createtime >='${startdate}' AND createtime < '${enddate}' AND jobboardid = 2 GROUP BY CAST(createtime AS DATE) ORDER BY Date;`),

            pool.query(`SELECT CAST(createtime AS DATE) AS Date, COUNT(*) AS RecordCount FROM division_audit WHERE username = '${username}' AND createtime >='${startdate}' AND createtime < '${enddate}' AND jobboardid = 4 GROUP BY CAST(createtime AS DATE) ORDER BY Date;`),

            pool.query(`SELECT CAST(createtime AS DATE) AS Date, COUNT(*) AS RecordCount FROM division_audit WHERE username = '${username}' AND createtime >='${startdate}' AND createtime < '${enddate}' AND jobboardid = 3 GROUP BY CAST(createtime AS DATE) ORDER BY Date;`),
            
        ]);

        const responseData = {
            DsrData: DsrData.recordset,
            Interviewdata: Interviewdata.recordset,
            PlacementData: PlacementData.recordset,
            FtcData: FtcData.recordset,
            diceData:diceData.recordset,
            cbData:cbData.recordset,
            monsterData:monsterData.recordset
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/getSuperAdminDashboardData', async (req, res) => {
    var startdate = req.body.StartDate
    var enddate = req.body.EndDate
    var accessorg = req.body.AccessOrg
    console.log(`SELECT CONCAT(R.FirstName, ' ', R.LastName) AS Recruiter, COUNT(*) AS InterviewCount FROM TraineeInterview TI INNER JOIN Trainee T ON TI.TraineeID = T.TraineeID INNER JOIN Trainee R ON TI.RecruiterID = R.TraineeID WHERE TI.Active = 1 AND TI.InterviewDate >= '${startdate}' AND TI.InterviewDate <= '${enddate}' AND R.OrganizationID IN (${accessorg}) GROUP BY CONCAT(R.FirstName, ' ', R.LastName) ORDER BY InterviewCount DESC;`);
    
    try {
        const [
            DsrData,
            Interviewdata,
            PlacementData,
            FtcData,
            OrgwiseDsr,
            OrgwiseInterview,
            OrgwisePlacement,
            OrgwiseFtc,
            Divisionwisecredit, 
        ] = await Promise.all([
            pool.query(`SELECT CONCAT(m.FirstName, ' ', m.LastName) AS Marketer, COUNT(*) AS SubmissionCount FROM submission s INNER JOIN Trainee t ON s.TraineeID = t.TraineeID INNER JOIN Trainee m ON s.markerterid = m.TraineeID WHERE s.Active = 1 AND m.Active = 1 AND s.SubmissionDate BETWEEN '${startdate}' AND '${enddate}' AND m.Organizationid IN (${accessorg}) GROUP BY CONCAT(m.FirstName, ' ', m.LastName) ORDER BY SubmissionCount DESC;`),

            pool.query(`SELECT CONCAT(R.FirstName, ' ', R.LastName) AS Recruiter, COUNT(*) AS InterviewCount FROM TraineeInterview TI INNER JOIN Trainee T ON TI.TraineeID = T.TraineeID INNER JOIN Trainee R ON TI.RecruiterID = R.TraineeID WHERE TI.Active = 1 AND TI.InterviewDate >= '${startdate}' AND TI.InterviewDate <= '${enddate}' AND R.OrganizationID IN (${accessorg}) GROUP BY CONCAT(R.FirstName, ' ', R.LastName) ORDER BY InterviewCount DESC;`),

            pool.query(`SELECT T2.FirstName + ' ' + T2.LastName AS MarketerName, COUNT(*) AS MarketerCount FROM placements P LEFT JOIN Trainee T1 ON P.TraineeID = T1.TraineeID LEFT JOIN Trainee T2 ON P.marketername = T2.TraineeID LEFT JOIN Trainee T3 ON P.RecuiterID = T3.TraineeID WHERE P.Active = 1 AND P.PlacedDate >= '${startdate}' AND P.PlacedDate < '${enddate}' AND T2.OrganizationID IN (${accessorg}) GROUP BY T2.FirstName + ' ' + T2.LastName ORDER BY MarketerCount DESC;`),

            pool.query(`SELECT CONCAT(R.FirstName, ' ', R.LastName) AS 'Recruiter', COUNT(*) AS RecruiterCount FROM Trainee T JOIN Currentstatus C ON C.CSID = T.CandidateStatus AND C.Active = 1 LEFT JOIN Trainee R ON R.TraineeID = T.RecruiterName AND R.Active = 1 WHERE T.Active = 1 AND T.UserOrganizationID IN (${accessorg}) AND T.CreateTime BETWEEN '${startdate}' AND '${enddate}' AND T.CandidateStatus = 8 AND R.Active = 1 GROUP BY CONCAT(R.FirstName, ' ', R.LastName) ORDER BY RecruiterCount DESC;`),
            


            pool.query(`SELECT  O.organizationname, COUNT(*) AS SubmissionCount FROM submission s INNER JOIN Trainee t ON s.TraineeID = t.TraineeID INNER JOIN Trainee m ON s.markerterid = m.TraineeID INNER JOIN Organization O ON M.organizationid = O.organizationid WHERE s.Active = 1 AND m.Active = 1 AND s.SubmissionDate BETWEEN '${startdate}' AND '${enddate}' AND m.Organizationid IN (${accessorg}) GROUP BY O.organizationname ORDER BY SubmissionCount DESC;`),

            pool.query(`SELECT  O.organizationname, COUNT(*) AS InterviewCount FROM TraineeInterview TI INNER JOIN Trainee T ON TI.TraineeID = T.TraineeID INNER JOIN Trainee R ON TI.RecruiterID = R.TraineeID INNER JOIN Organization O ON R.organizationid = O.organizationid WHERE TI.Active = 1 AND TI.InterviewDate >= '${startdate}' AND TI.InterviewDate <= '${enddate}' AND R.OrganizationID IN (${accessorg}) GROUP BY  O.organizationname ORDER BY InterviewCount DESC;`),

            pool.query(`SELECT O.organizationname, COUNT(*) AS MarketerCount FROM placements P LEFT JOIN Trainee T1 ON P.TraineeID = T1.TraineeID LEFT JOIN Trainee T2 ON P.marketername = T2.TraineeID LEFT JOIN Trainee T3 ON P.RecuiterID = T3.TraineeID LEFT JOIN Organization O ON T2.organizationid = O.organizationid WHERE P.Active = 1 AND P.PlacedDate >= '${startdate}' AND P.PlacedDate < '${enddate}' AND T2.OrganizationID IN (${accessorg}) GROUP BY O.organizationname ORDER BY MarketerCount DESC;`),

            pool.query(`SELECT O.organizationname, COUNT(*) AS RecruiterCount FROM Trainee T JOIN Currentstatus C ON C.CSID = T.CandidateStatus AND C.Active = 1 LEFT JOIN Trainee R ON R.TraineeID = T.RecruiterName AND R.Active = 1 LEFT JOIN Organization O ON R.organizationid = O.organizationid WHERE T.Active = 1 AND T.UserOrganizationID IN (${accessorg}) AND T.CreateTime BETWEEN '${startdate}' AND '${enddate}' AND T.CandidateStatus = 8 AND R.Active = 1 GROUP BY O.organizationname ORDER BY RecruiterCount DESC`),
            
            pool.query(`SELECT OD.DivisionName, COALESCE(SUM(MA.monsterused), 0) AS monsterused, COALESCE(SUM(CA.cbused), 0) AS cbused, COALESCE(SUM(DA.diceused), 0) AS diceused FROM Trainee AS T INNER JOIN org_division AS OD ON T.Org_Div = OD.id LEFT JOIN (SELECT username, COUNT(id) AS monsterused FROM division_audit WHERE jobboardid = 3 AND createtime BETWEEN '${startdate}' AND '${enddate}' GROUP BY username) AS MA ON T.Username = MA.username LEFT JOIN (SELECT username, COUNT(id) AS cbused FROM division_audit WHERE jobboardid = 4 AND createtime BETWEEN '${startdate}' AND '${enddate}' GROUP BY username) AS CA ON T.Username = CA.username LEFT JOIN (SELECT username, COUNT(id) AS diceused FROM division_audit WHERE jobboardid = 2 AND createtime BETWEEN '${startdate}' AND '${enddate}' GROUP BY username) AS DA ON T.Username = DA.username WHERE T.OrganizationID IN (${accessorg}) AND T.Active = 1 GROUP BY OD.DivisionName ORDER BY OD.DivisionName`),
            
        ]);

        const responseData = {
            DsrData: DsrData.recordset,
            Interviewdata: Interviewdata.recordset,
            PlacementData: PlacementData.recordset,
            FtcData: FtcData.recordset,
            OrgwiseDsr:OrgwiseDsr.recordset,
            OrgwiseInterview:OrgwiseInterview.recordset,
            OrgwisePlacement:OrgwisePlacement.recordset,
            OrgwiseFtc:OrgwiseFtc.recordset ,
            Divisionwisecredit:Divisionwisecredit.recordset
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;