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

const config = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "Tresume_Beta",
  trustServerCertificate: true,
};

const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.mail.yahoo.com",
  auth: {
    user: "support@tresume.us",
    pass: "xzkmvglehwxeqrpd",
  },
  secure: true,
});

router.post('/getTalentBenchList', async (req, res) => {
  try {
    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database connection error' });
      }

      const request = new sql.Request();
      // const query = "SELECT J.jobtitle AS JobTitle, J.company AS Company, CONCAT(J.city, ', ', J.state, ', ', J.country) AS Location, J.payrate AS PayRate, SUM(CASE WHEN JA.Status = 'NEW' THEN 1 ELSE 0 END) AS NewApplicants, COUNT(CASE WHEN JA.Status <> 'DELETED' THEN 1 ELSE NULL END) AS TotalApplicants, J.createtime AS PostedOn, CONCAT(T.FirstName, ' ', T.LastName) AS PostedBy, JT.Value AS JobType, T2.FirstName AS Assignee, J.JobStatus FROM Job J INNER JOIN JobApplication JA ON J.JobID = JA.JobID LEFT JOIN Trainee T ON J.Recruiterid = T.TraineeID LEFT JOIN Trainee T2 ON J.PrimaryRecruiterID = T2.TraineeID INNER JOIN JobType JT ON J.JobTypeID = JT.JobTypeID WHERE T.OrganizationID = '" + req.body.OrgID + "' GROUP BY J.jobtitle, J.company, J.city, J.state, J.country, J.payrate, J.createtime, T.FirstName, T.LastName, JT.Value, T2.FirstName, J.JobStatus ORDER BY J.createtime DESC;";

      const query = "select trn.TraineeID, trn.FirstName, trn.LastName, trn.YearsOfExpInMonths, trn.Organization,trn.CandidateStatus,trn.PhoneNumber,TB.GroupID,   trn.CurrentLocation,trn.MiddleName,trn.Gender,trn.Degree,trn.ReferralType,trn.RecruiterName,trn.LegalStatus,trn.Notes, trn.Title as [TraineeTitle], overall_count = COUNT(trn.TraineeID) OVER(),  ISNULL(tr.Rating, 0) as QuickRate,TB.TBID,  trn.Source,TB.BenchStatus,  (select PhoneNumber from Phone where PhoneID = (select TOP(1) PhoneID from TraineePhone where TraineeID = trn.TraineeID )) AS phone, trn.UserName,TB.BillRate,TB.PayType,TB.ReferredBy,TB.CreateTime,  DATEDIFF(DAY, TB.CreateTime, GETUTCDATE()) AS age ,CONCAT(T1.FirstName,' ',T1.MiddleName, ' ',T1.LastName ) AS Recruiter,ISNULL(TB.IsNew,'0') AS  IsNew,(select (','+ TraineeID  +',') FROM JBDetail where jobid = '') AS JBTraineeID    from Trainee trn (nolock)  LEFT join TraineeRating tr (nolock) on tr.Active = 1 and trn.TraineeID = tr.TraineeID and tr.Recruiterid = '5' LEFT JOIN Trainee T1 ON T1.TraineeID = trn.RecruiterName AND T1.Active = 1  join TalentBench TB(nolock) on TB.Active = 1 and trn.TraineeID = TB.TraineeID where trn.Talentpool = 1 AND  (trn.UserOrganizationID = '"+req.body.OrgID+"' OR trn.TraineeID in (SELECT ja.TraineeID FROM JobApplication ja WHERE ja.Active = 1 AND ja.JobID IN(SELECT j.JobID FROM Job j WHERE j.Active = 1 and j.RecruiterID   in (Select TraineeID from Trainee where OrganizationID = 2 AND Active = 1 AND Role = 'RECRUITER'))) ) and trn.active = 1 and trn.Role = 'TRESUMEUSER'   GROUP BY trn.TraineeID ,T1.FirstName ,T1.MiddleName,  T1.LastName,trn.FirstName,trn.PhoneNumber,trn.LastName,trn.YearsOfExpInMonths,trn.CandidateStatus,TB.TBID,TB.GroupID,trn.MiddleName,trn.Gender,trn.Degree,trn.ReferralType,trn.RecruiterName,trn.LegalStatus,trn.Notes,trn.Organization,trn.CurrentLocation, trn.Title,trn.LastUpdateTime,trn.CreateTime,tr.Rating,trn.Source,TB.BenchStatus,trn.UserName,TB.BillRate,TB.PayType,TB.ReferredBy,TB.CreateTime,TB.IsNew ORDER BY trn.CreateTime DESC  ";
      console.log(query);
      const recordset = await request.query(query);

      const result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      return res.send(result);
     res.send(result);
    });
  } catch (error) {
    console.error(error);
    const result = {
      flag: 0,
      message: 'Internal server error',
    };

    return res.send(result);
  }
});
module.exports = router;
