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
  database: "Tresume",
  trustServerCertificate: true,
  connectionTimeout: 60000,
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

router.post('/getJobPostingList', async (req, res) => {
  try {
    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database connection error' });
      }
      const request = new sql.Request();

      if(req.body.admin ==1){

      }
      const query = "SELECT J.JobID AS JobID, J.jobtitle AS JobTitle, J.company AS Company, CONCAT(J.city, ', ', J.state, ', ', J.country) AS Location, J.payrate AS PayRate, SUM(CASE WHEN JA.Status = 'NEW' THEN 1 ELSE 0 END) AS NewApplicants, COUNT(CASE WHEN JA.Status <> 'DELETED' THEN 1 ELSE NULL END) AS TotalApplicants, J.createtime AS PostedOn, CONCAT(T.FirstName, ' ', T.LastName) AS PostedBy, JT.Value AS JobType, T2.FirstName AS Assignee, J.JobStatus FROM Job J INNER JOIN JobApplication JA ON J.JobID = JA.JobID LEFT JOIN Trainee T ON J.Recruiterid = T.TraineeID LEFT JOIN Trainee T2 ON J.PrimaryRecruiterID = T2.TraineeID INNER JOIN JobType JT ON J.JobTypeID = JT.JobTypeID WHERE T.OrganizationID = '" + req.body.OrgID + "' AND assignee='"+req.body.traineeid+"' GROUP BY J.JobID, J.jobtitle, J.company, J.city, J.state, J.country, J.payrate, J.createtime, T.FirstName, T.LastName, JT.Value, T2.FirstName, J.JobStatus ORDER BY J.createtime DESC;";


      console.log(query);
      const recordset = await request.query(query);
      const result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
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

router.post('/deleteJobPosting', async (req, res) => {
  const email = req.body.email;
  try {
    const dtrainee = await deactivatetrainee(email);
    const dmemberdetails = await deactivatememberdetails(email);

    if (dtrainee && dmemberdetails) {
      const result = {
        flag: 1,
      };
      res.send(result);
    } else {
      const result = {
        flag: 0,
      };
      res.send(result);
    }
  } catch (error) {
    const result = {
      flag: 0,
    };
    res.send(result);
  }
})

async function deactivatetrainee(email) {
  const pool = await sql.connect(config);
  const request = pool.request();
  const queryResult = await request.query(
    `update trainee set active = 0 where username = '${email}'`
  );
  return queryResult;
}

async function deactivatememberdetails(email) {
  const pool = await sql.connect(config);
  const request = pool.request();
  const queryResult = await request.query(
    `update memberdetails set active = 0 where  useremail ='${email}'`
  );
  return queryResult;
}


router.post('/getSubmittedCandidateList', async (req, res) => {
  try {
    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database connection error' });
      }

      const request = new sql.Request();

      const query = `
        SELECT
          CS.SubmittedID,
          MD.FirstName AS FirstName,
          MD.LastName AS LastName,
          MD.UserName AS UserName,
          MD.PhoneNumber AS PhoneNumber,
          MR.FirstName AS RecruiterFirstName,
          MR.LastName AS RecruiterLastName
        FROM
          CandidateSubmitted CS
        INNER JOIN
          Job J ON CS.JobID = J.JobID
        INNER JOIN
          Trainee T ON CS.CandidateID = T.TraineeID
        INNER JOIN
          MemberDetails MD ON T.ID = MD.ID
        INNER JOIN
          MemberDetails MR ON J.RecruiterID = MR.ID
        WHERE
          J.JobTitle = @JobTitle;`;

      request.input('JobTitle', sql.NVarChar, req.body.JobTitle);

      const recordset = await request.query(query);

      const result = {
        flag: 1,
        result: recordset.recordset,
      };

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

