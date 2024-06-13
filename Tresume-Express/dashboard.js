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
            FtcData 
        ] = await Promise.all([
            pool.query(`SELECT CONCAT(m.FirstName, ' ', m.LastName) AS Marketer, COUNT(*) AS SubmissionCount FROM submission s INNER JOIN Trainee t ON s.TraineeID = t.TraineeID INNER JOIN Trainee m ON s.markerterid = m.TraineeID WHERE s.Active = 1 AND m.Active = 1 AND s.SubmissionDate BETWEEN '${startdate}' AND '${enddate}' AND m.Organizationid IN (${accessorg}) GROUP BY CONCAT(m.FirstName, ' ', m.LastName) ORDER BY SubmissionCount DESC;`),

            pool.query(`SELECT CONCAT(R.FirstName, ' ', R.LastName) AS Recruiter, COUNT(*) AS InterviewCount FROM TraineeInterview TI INNER JOIN Trainee T ON TI.TraineeID = T.TraineeID INNER JOIN Trainee R ON TI.RecruiterID = R.TraineeID WHERE TI.Active = 1 AND TI.InterviewDate >= '${startdate}' AND TI.InterviewDate <= '${enddate}' AND R.OrganizationID IN (${accessorg}) GROUP BY CONCAT(R.FirstName, ' ', R.LastName) ORDER BY InterviewCount DESC;`),

            pool.query(`SELECT T2.FirstName + ' ' + T2.LastName AS MarketerName, COUNT(*) AS MarketerCount FROM placements P LEFT JOIN Trainee T1 ON P.TraineeID = T1.TraineeID LEFT JOIN Trainee T2 ON P.marketername = T2.TraineeID LEFT JOIN Trainee T3 ON P.RecuiterID = T3.TraineeID WHERE P.Active = 1 AND P.PlacedDate >= '${startdate}' AND P.PlacedDate < '${enddate}' AND T2.OrganizationID IN (${accessorg}) GROUP BY T2.FirstName + ' ' + T2.LastName ORDER BY MarketerCount DESC;`),

            pool.query(`SELECT CONCAT(R.FirstName, ' ', R.LastName) AS 'Recruiter', COUNT(*) AS RecruiterCount FROM Trainee T JOIN Currentstatus C ON C.CSID = T.CandidateStatus AND C.Active = 1 LEFT JOIN Trainee R ON R.TraineeID = T.RecruiterName AND R.Active = 1 WHERE T.Active = 1 AND T.UserOrganizationID IN (${accessorg}) AND T.CreateTime BETWEEN '${startdate}' AND '${enddate}' AND T.CandidateStatus = 8 AND R.Active = 1 GROUP BY CONCAT(R.FirstName, ' ', R.LastName) ORDER BY RecruiterCount DESC;`),
            
        ]);

        const responseData = {
            DsrData: DsrData.recordset,
            Interviewdata: Interviewdata.recordset,
            PlacementData: PlacementData.recordset,
            FtcData: FtcData.recordset,
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;