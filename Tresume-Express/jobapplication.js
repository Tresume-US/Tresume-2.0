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
  database: "Tresume_Beta",
  trustServerCertificate: true,
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