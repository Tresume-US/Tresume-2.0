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

module.exports = router;
router.post('/getTalentBenchList', async (req, res) => {
  try {
    traineeID = req.body.traineeID;
    OrganizationID = req.body.OrganizationID;
    const request = new sql.Request();
    const query = "select trn.TraineeID, trn.FirstName, trn.LastName, trn.YearsOfExpInMonths, trn.Organization, trn.CandidateStatus,trn.PhoneNumber,TB.GroupID,   trn.CurrentLocation,trn.MiddleName,trn.Gender, trn.Degree,trn.ReferralType,trn.RecruiterName,trn.LegalStatus,trn.Notes, trn.Title as [TraineeTitle], overall_count = COUNT(trn.TraineeID) OVER(),  ISNULL(tr.Rating, 0) as QuickRate,TB.TBID, trn.Source,TB.BenchStatus,  (select PhoneNumber from Phone where PhoneID = (select TOP(1) PhoneID from TraineePhone where TraineeID = trn.TraineeID )) AS phone, trn.UserName,TB.BillRate, TB.PayType,TB.ReferredBy,TB.CreateTime,  DATEDIFF(DAY, TB.CreateTime, GETUTCDATE()) AS age , CONCAT(T1.FirstName,' ',T1.MiddleName, ' ',T1.LastName ) AS Recruiter,ISNULL(TB.IsNew,'0') AS IsNew,(select traineeid FROM JBDetail where jobid = '') AS JBTraineeID from Trainee trn (nolock)  LEFT join TraineeRating tr (nolock) on tr.Active = 1 and trn.TraineeID = tr.TraineeID and tr.Recruiterid = '"+ traineeID +"' LEFT JOIN Trainee T1 ON T1.TraineeID = trn.RecruiterName AND T1.Active = 1  join TalentBench TB(nolock) on TB.Active = 1 and trn.TraineeID = TB.TraineeID where trn.Talentpool = 1 AND  (trn.UserOrganizationID = '"+ OrganizationID +"' OR trn.TraineeID in (SELECT ja.TraineeID FROM JobApplication ja WHERE ja.Active = 1 AND ja.JobID IN (SELECT j.JobID FROM Job j WHERE j.Active = 1 and j.RecruiterID in (Select TraineeID from Trainee where OrganizationID = '"+ OrganizationID +"' AND Active = 1 AND Role = 'RECRUITER'))) ) and trn.active = 1 and trn.Role = 'TRESUMEUSER'   GROUP BY trn.TraineeID ,T1.FirstName, T1.MiddleName,  T1.LastName,trn.FirstName,trn.PhoneNumber,trn.LastName,trn.YearsOfExpInMonths, trn.CandidateStatus,TB.TBID,TB.GroupID,trn.MiddleName,trn.Gender,trn.Degree,trn.ReferralType, trn.RecruiterName,trn.LegalStatus,trn.Notes,trn.Organization,trn.CurrentLocation, trn.Title, trn.LastUpdateTime,trn.CreateTime,tr.Rating,trn.Source,TB.BenchStatus,trn.UserName,TB.BillRate, TB.PayType,TB.ReferredBy,TB.CreateTime,TB.IsNew ORDER BY trn.CreateTime DESC";

    console.log(query);

    const recordset = await request.query(query);

    if (recordset && recordset.recordsets && recordset.recordsets.length > 0) {
      const result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    } else {
      const result = {
        flag: 0,
        error: "No active clients found! ",
      };
      res.send(result); 
    }
  } catch (error) {
    console.error("Error fetching client data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching client data!",
    };
    res.status(500).send(result);
  }
});

router.post('/AddTalentBenchList', async function (req, res) {
  try {
    var TraineeID = await generateTraineeID();

    var query =
      "IF NOT EXISTS(SELECT * FROM Trainee WHERE UserName = '" +
      req.body.Email +
      "' AND UserOrganizationID = '" +
      req.body.OrganizationID +
      "') " +
      "BEGIN " +
      "INSERT INTO Trainee (TraineeID, Email, FirstName, Phone, MiddleName, LastName, LegalStatus, CandidateStatus, Degree, Gender, Notes, RecruiterName, ReferralType, Groups, LocationConstraint, MarketerName, University ) " +
      "VALUES (" + 
      `'${TraineeID}',` +
      ` ${formatValue(req.body.Email)},` +
      ` ${formatValue(req.body.FirstName)},` +
      ` ${formatValue(req.body.Phone)},` +
      ` ${formatValue(req.body.MiddleName)},` +
      ` ${formatValue(req.body.LastName)},` +
      ` ${formatValue(req.body.Groups)},` +
      ` ${formatValue(req.body.LegalStatus)},` +
      ` ${formatValue(req.body.CandidateStatus)},` +
      ` ${formatValue(req.body.Degree)},` +
      ` ${formatValue(req.body.Gender)},` +
      ` ${formatValue(req.body.Notes)},` +
      ` ${formatValue(req.body.RecruiterName)},` +
      ` ${formatValue(req.body.ReferralType)},` +
      ' 1,' +
      ` ${formatValue(req.body.LocationConstraint)},` +
      ` ${formatValue(req.body.MarketerName)},` +
      ` ${formatValue(req.body.University)},` +
      ' 1,' +
      " 'ACTIVE'," +
      " 'READY'," +
      ' 1,' +
      ' 1,' +
      " 'TRESUMEUSER', " +
      "'', GETDATE()) " +
      "END";

    console.log(query);

    // await sql.connect(config);
    // var request = new sql.Request();
    // var result = await request.query(query);

    res.status(200).send("Data Fetched");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function generateTraineeID() {
  try {
    await sql.connect(config);
    var request = new sql.Request();

    var query = "SELECT TOP 1 TraineeID FROM Trainee ORDER BY TraineeID DESC";

    var recordset = await request.query(query);

    if (recordset.recordset.length > 0) {
      return recordset.recordset[0].TraineeID + 1;
    } else {
      return 1; 
    }
  } catch (error) {
    console.error("Error generating TraineeID:", error);
    throw error;
  }
}


