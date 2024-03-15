const express = require("express");
const router = express.Router();
var sql = require("mssql");
const nodemailer = require("nodemailer");
const bodyparser = require('body-parser');
const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
router.use(bodyparser.json());

const config = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "Tresume",
  trustServerCertificate: true,
  connectionTimeout: 60000,
};

module.exports = router;

router.post('/getJobApplicationList', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "select '3' AS PostDay,j.*, (Select FirstName + ' ' + LastName as Name from Trainee where Active=1 and TraineeID=j.RecruiterID) as CreaterName, overall_count = COUNT(j.JobID) OVER() ,(SELECT COUNT(JobApplicationID) FROM JobApplication ja inner join Trainee t (nolock) on t.TraineeID = ja.TraineeID and t.Active=1 WHERE ja.Active = 1 and j.JobID = ja.JobID) as TotalApplicant,(Select Value from JobType jt where jt.JobTypeID=j.JobTypeID) as JobType,(SELECT COUNT(JobApplicationID) FROM JobApplication ja inner join Trainee t(nolock) on t.TraineeID = ja.TraineeID and t.Active = 1 WHERE ja.Active = 1 and j.JobID = ja.JobID and ja.[Status] = 'NEW') as NewApplicant from Job j (nolock) where j.Active = 1 AND j.RecruiterID IN (SELECT TraineeID FROM Trainee WHERE UserName in (SELECT UserEmail FROM MemberDetails Where OrgID='" + req.body.OrgID+ "' AND Active=1) AND Active=1 AND Role='RECRUITER')";

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
        error: "No active applications found! ",
      };
      res.send(result); 
    }
  } catch (error) {
    console.error("Error fetching job application data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching job application data!",
    };
    res.status(500).send(result);
  }
});

router.post("/getjobtitle", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = new sql.Request();
    const orgID = parseInt(req.body.orgID);

    const query = `
        SELECT j.JobID,CONCAT(j.jobtitle, ' - ', c.clientname) AS job_title_clientname
        FROM job j
        JOIN clients c ON j.clientid = c.clientid
        WHERE j.orgid = ${orgID};
    `;
    
  
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
        error: "No jobs found! ",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching jobs!",
    };
    res.status(500).send(result);
  }
});

router.post("/insertcandidatejob", async function (req, res) {
  try {
    const getIdQuery = `SELECT ISNULL(MAX(JobApplicationID), 0) + 1 AS NextJobApplicationID FROM JobApplication`;

    await sql.connect(config);
    const idResult = await sql.query(getIdQuery);
    const nextJobApplicationID = idResult.recordset[0].NextJobApplicationID;

    const insertQuery = `
      INSERT INTO jobapplication (JobApplicationID, JobID, TraineeID, Active, CreateTime, CreateBy, LastUpdateTime, LastUpdateBy, Status, Source)
      VALUES (@JobApplicationID, @JobID, @TraineeID, '1', GETDATE(), @CreateBy, GETDATE(), @LastUpdateBy, 'SUBMITTED', @Source)
    `;

    var request = new sql.Request();
    request.input('JobApplicationID', nextJobApplicationID);
    request.input('JobID', req.body.JobID);
    request.input('TraineeID', req.body.TraineeID);
    request.input('CreateBy', req.body.username);
    request.input('LastUpdateBy', req.body.username);
    request.input('Source', req.body.Source);

    var result = await request.query(insertQuery);
    
    const data = {
      flag: 1,
      message: "Trainee Candidate Data Inserted",
    };

    res.send(data);
  } catch (error) {
    console.error(error);
    const data = {
      flag: 0,
      message: "Internal Server Error",
    };
    res.status(500).send(data);
  }
});


