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
const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
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
  host: "smtp.hostinger.com",
  auth: {
    user: "jobpostings@dmsol.in",
    pass: "Tresume@123",
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
      
      const isAdmin = req.body.IsAdmin === 'true';
      const recruiterCondition = isAdmin ? '' : `AND J.Recruiterid = '${req.body.TraineeID}'`;

      const query = `
        SELECT 
          J.JobID AS JobID, 
          J.jobtitle AS JobTitle, 
          J.company AS Company, 
          CONCAT(J.city, ', ', J.state, ', ', J.country) AS Location, 
          J.payrate AS PayRate, 
          J.JobDescription AS JobDescription, 
          SUM(CASE WHEN JA.Status = 'NEW' THEN 1 ELSE 0 END) AS NewApplicants, 
          COUNT(CASE WHEN JA.Status <> 'DELETED' THEN 1 ELSE NULL END) AS TotalApplicants, 
          J.createtime AS PostedOn, 
          CONCAT(T.FirstName, ' ', T.LastName) AS PostedBy, 
          JT.Value AS JobType, 
          T2.TraineeID, 
          J.JobStatus 
        FROM 
          Job J 
          LEFT JOIN JobApplication JA ON J.JobID = JA.JobID 
          LEFT JOIN Trainee T ON J.Recruiterid = T.TraineeID 
          LEFT JOIN Trainee T2 ON J.PrimaryRecruiterID = T2.TraineeID 
          INNER JOIN JobType JT ON J.JobTypeID = JT.JobTypeID 
        WHERE 
          T.OrganizationID = '${req.body.OrgID}' 
          ${recruiterCondition}
          AND J.Active = 1 
        GROUP BY 
          J.JobID, J.jobtitle, J.company, J.city, J.state, J.country, J.payrate,   J.JobDescription,
          J.createtime, T.FirstName, T.LastName, T2.TraineeID, JT.Value, T2.FirstName, J.JobStatus 
        ORDER BY 
          J.createtime DESC;
      `;

      console.log(query);
      
      const request = new sql.Request();
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

router.post('/getJobListByClient', async (req, res) => {
  try {
    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database connection error' });
      }
    
      const query = `
        WITH JobDetails AS (
            SELECT 
                J.JobID AS JobID, 
                J.jobtitle AS JobTitle, 
                J.company AS Company, 
                CONCAT(J.city, ', ', J.state, ', ', J.country) AS Location, 
                J.payrate AS PayRate, 
                J.JobDescription AS JobDescription, 
                SUM(CASE WHEN JA.Status = 'NEW' THEN 1 ELSE 0 END) AS NewApplicants, 
                COUNT(CASE WHEN JA.Status <> 'DELETED' THEN 1 ELSE NULL END) AS TotalApplicants, 
                J.createtime AS PostedOn, 
                CONCAT(T.FirstName, ' ', T.LastName) AS PostedBy, 
                JT.Value AS JobType, 
                T2.TraineeID, 
                J.JobStatus 
            FROM 
                Job J 
                LEFT JOIN JobApplication JA ON J.JobID = JA.JobID 
                LEFT JOIN Trainee T ON J.Recruiterid = T.TraineeID 
                LEFT JOIN Trainee T2 ON J.PrimaryRecruiterID = T2.TraineeID 
                INNER JOIN JobType JT ON J.JobTypeID = JT.JobTypeID 
            WHERE 
                J.ClientID = '${req.body.ClientID}' 
                AND J.Active = 1 
            GROUP BY 
                J.JobID, J.jobtitle, J.company, J.city, J.state, J.country, J.payrate, 
                J.JobDescription, J.createtime, T.FirstName, T.LastName, T2.TraineeID, 
                JT.Value, T2.FirstName, J.JobStatus
        ),
        TotalCounts AS (
            SELECT 
                COUNT(*) AS TotalJobCount,
                SUM(CASE WHEN JA.Status <> 'DELETED' THEN 1 ELSE 0 END) AS TotalApplicantCount
            FROM 
                Job J
                LEFT JOIN JobApplication JA ON J.JobID = JA.JobID
                LEFT JOIN Trainee T ON J.Recruiterid = T.TraineeID 
            WHERE 
                J.ClientID = '${req.body.ClientID}'
                AND J.Active = 1
        )
        SELECT 
            JD.*,
            TC.TotalJobCount,
            TC.TotalApplicantCount
        FROM 
            JobDetails JD,
            TotalCounts TC
        ORDER BY 
            JD.PostedOn DESC;
      `;

      console.log(query);
      
      const request = new sql.Request();
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


router.post('/deleteJobPost', async (req, res) => {
  const JobID = req.body.JobID;
  try {
    const jobs = await deactivateJob(JobID);

    if (jobs) {
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

async function deactivateJob(JobID) {
  const pool = await sql.connect(config);
  const request = pool.request();
  const queryResult = await request.query(
    `UPDATE job 
     SET active = 0 
     WHERE jobid = '${JobID}'`
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



router.post('/getJobPostData', async (req, res) => {
    try {
        const [
            NextJobId ,
            statesResult,
            currencyTypes,
            payTypes,
            taxTerms,
            jobTypes,
            priorities,
            jobStatuses,
            legalstatus,
            clients,
            admins,
            recruiters,
            jobbaordaccount
        ] = await Promise.all([
            pool.query('SELECT ISNULL(MAX(JobId), 0) + 1 AS NextJobId FROM Job;'),
            pool.query('select distinct state from usazipcodenew order by state asc;'),
            pool.query('select * from CurrencyType where active = 1;'),
            pool.query('select * from paytype where active = 1;'),
            pool.query('select * from taxterm where active = 1;'),
            pool.query('select * from JobType where active = 1;'),
            pool.query('select * from Priority where active = 1;'),
            pool.query('select * from jobstatus where active = 1;'),
            pool.query('select LegalText as name,LegalValue as value from legalstatus where active = 1;'),
            pool.query(`select ClientID, ClientName from clients where PrimaryOwner = ${req.body.TraineeID}`),
            pool.query(`SELECT T.TraineeID, T.FirstName, T.LastName, T.Active FROM Trainee T JOIN memberdetails M ON T.Username = M.useremail WHERE M.isAdmin = 1 AND T.Active = 1 AND M.Active = 1 AND M.PrimaryOrgID = ${req.body.OrgID}`),
            pool.query(`SELECT T.TraineeID, T.FirstName, T.LastName, T.Active FROM Trainee T JOIN memberdetails M ON T.Username = M.useremail WHERE M.isAdmin != 1 AND T.Active = 1 AND M.Active = 1 AND M.PrimaryOrgID = ${req.body.OrgID}`),
            pool.query(`select * from JobBoardAccount where active = 1 AND RecruiterID = ${req.body.TraineeID}`)
        ]);

        const responseData = {
            NextJobId: NextJobId.recordset[0].NextJobId || 1, // Default to 1 if no result found
            states: statesResult.recordset,
            currencyTypes: currencyTypes.recordset,
            payTypes: payTypes.recordset,
            taxTerms: taxTerms.recordset,
            jobTypes: jobTypes.recordset,
            priorities: priorities.recordset,
            jobStatuses: jobStatuses.recordset,
            legalstatus:legalstatus.recordset,
            clients: clients.recordset,
            admins: admins.recordset,
            recruiters: recruiters.recordset,
            jobbaordaccount:jobbaordaccount.recordset
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/PostJob', async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    var jobbaordaccount = req.body.jobboardaccount;

    // Construct the SQL query with parameters
    const query = `
    INSERT INTO [dbo].[Job]
    ([RecruiterID], [JobTitle], [Company], [City], [State], [Country], [ZipCode], [Address],
    [AreaCode], [JobDescription], [JobCode], [Skills], [PayRate], [PayRateTypeID],
    [PayRateCurrencyTypeID], [PayRateTaxTermID], [BillRate], [BillRateTypeID],
    [BillRateCurrencyTypeID], [BillRateTaxTermID], [JobTypeID], [LegalStatus], [JobStausID],
    [NoOfPosition], [RespondDate], [ClientID], [EndClient], [ClientJobID], [PriorityID],
    [Duration], [InterviewMode], [SecruityClearance], [PrimaryRecruiterID], [RecruitmentManagerID],
    [SalesManagerID], [AccountManagerID], [TaxTermID], [Comments], [Active], [CreateTime],
    [CreateBy], [LastUpdateTime], [LastUpdateBy], [MinYearsOfExpInMonths], [JobStatus], [OrgID])
    VALUES
    ('${req.body.RecruiterID}', '${req.body.JobTitle}', '${req.body.Company}', '${req.body.City}',
    '${req.body.State}', '${req.body.Country}', '${req.body.ZipCode}', '${req.body.Address}',
    '${req.body.AreaCode}', '${req.body.JobDescription}', '${req.body.JobCode}', '${req.body.Skills}',
    '${req.body.PayRate}', '${req.body.PayRateTypeID}', '${req.body.PayRateCurrencyTypeID}',
    '${req.body.PayRateTaxTermID}', '${req.body.BillRate}', '${req.body.BillRateTypeID}',
    '${req.body.BillRateCurrencyTypeID}', '${req.body.BillRateTaxTermID}', '${req.body.JobTypeID}',
    '${req.body.LegalStatus}', '${req.body.JobStausID}', '${req.body.NoOfPosition}',
    '${req.body.RespondDate}', '${req.body.ClientID}', '${req.body.EndClient}', '${req.body.ClientJobID}',
    '${req.body.PriorityID}', '${req.body.Duration}', '${req.body.InterviewMode}', '${req.body.SecruityClearance}',
    '${req.body.PrimaryRecruiterID}', '${req.body.RecruitmentManagerID}', '${req.body.SalesManagerID}',
    '${req.body.AccountManagerID}', '${req.body.TaxTermID}', '${req.body.Comments}', '${req.body.Active}',
    GETDATE(), '${req.body.CreateBy}', GETDATE(), '${req.body.LastUpdateBy}', '${req.body.MinYearsOfExpInMonths}',
    '${req.body.JobStatus}', '${req.body.OrgID}')

    `;

    console.log(query);

    // Execute the query
    await request.query(query);

    for(var i=0;i<jobbaordaccount.length;i++){
      console.log(jobbaordaccount[i].JobBoardID);
      if(jobbaordaccount[i].JobBoardID == 2){
        
          const taxterm = req.body.JobTypeID === 1 ? 'FULLTIME' :
          req.body.JobTypeID === 2 ? 'CON_W2' :
          req.body.JobTypeID === 3 ? 'PARTTIME' : '';

          const reqBody = {
          positionid: req.body.JobCode,
          diceid: '91142245',
          taxterm: taxterm,
          allowrecruiterapplies: 'Y',
          country: 'US',
          state: req.body.State,
          postalcode: req.body.ZipCode,
          location: req.body.Address,
          areacode: req.body.AreaCode,
          company: req.body.Company,
          companystate: req.body.State,
          companyzip: req.body.ZipCode,
          addr1: req.body.Address,
          payrate: req.body.PayRate,
          jobtitle: req.body.JobTitle,
          skillsreq: req.body.Skills,
          comments: req.body.JobDescription,
          applylink:'https://tresume.us/applyjob/'+req.body.JobCode
          };

          const batchContent = generateBatchFile(reqBody);

          fs.writeFile('jobs.txt', batchContent, (err) => {
          if (err) {
          console.error('Error writing batch file:', err);
          return;
          }

          console.log('Batch file created successfully');
          var body = "username: jobpostings@dmsol.in<br>password: Tresume@123";
          const mailOptions = {
          from: 'jobpostings@dmsol.in',
          to: 'dicejobs@dice.com',
          bcc:'wilson.am@tresume.us',
          subject: 'Batch Posting Request',
          html: body,
          attachments: [
          {
          filename: 'jobs.txt',
          path: './jobs.txt'
          }
          ]
          };

          transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
          console.error('Error sending email:', error);
          } else {
          console.log('Email sent:', info.response);
          }
          });
          });
      }
    }
    // Send success response
    res.status(200).json({ success: true, message: 'Job inserted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while inserting the job.' });
  } finally {
    sql.close();
  }
});

router.post('/getjobapplicants', async (req, res) => {
  try {
    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database connection error' });
      }
      const request = new sql.Request();

      // let query ="SELECT JobApplication.CreateTime AS Date, CONCAT(trainee.FirstName, ' ', trainee.LastName) AS Name, job.JobTitle AS JobTitle, JobApplication.Source, JobApplication.Status FROM JobApplication JOIN trainee ON JobApplication.TraineeID = trainee.TraineeID JOIN job ON JobApplication.JobID = job.JobID WHERE JobApplication.JobID = '" + req.body.JobID + "' ";     
      
      let query = '';
      
      if(req.body.isAdmin == 'true'){
        query = "SELECT JobApplication.TraineeID, JobApplication.CreateTime AS Date, CONCAT(trainee.FirstName, ' ', trainee.LastName) AS Name, job.JobTitle AS JobTitle, JobApplication.Source, JobApplication.Status FROM JobApplication JOIN trainee ON JobApplication.TraineeID = trainee.TraineeID JOIN job ON JobApplication.JobID = job.JobID WHERE JobApplication.JobID = '" + req.body.JobID + "' AND (JobApplication.Status = 'SUBMITTED' OR JobApplication.Status = 'ACCEPTED' OR JobApplication.Status = 'REJECTED')";

      }else{
         query ="SELECT  JobApplication.TraineeID, JobApplication.CreateTime AS Date, CONCAT(trainee.FirstName, ' ', trainee.LastName) AS Name, job.JobTitle AS JobTitle, JobApplication.Source, JobApplication.Status FROM JobApplication JOIN trainee ON JobApplication.TraineeID = trainee.TraineeID JOIN job ON JobApplication.JobID = job.JobID WHERE JobApplication.JobID = '" + req.body.JobID + "'"; 
      }

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

router.post("/acceptApplication", async function (req, res) {
  try {
    const query = `UPDATE JobApplication SET Status = 'ACCEPTED' WHERE TraineeID = '${req.body.TraineeID}' AND JobID = '${req.body.JobID}'`;
    console.log(query);
    await sql.connect(config);
    const request = new sql.Request();
    const result = await request.query(query);

    const data = {
      flag: 1,
      message: "Application accepted",
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

router.post("/rejectApplication", async function (req, res) {
  try {
    const { TraineeID, JobID } = req.body;
    const query = `UPDATE JobApplication SET Status = 'REJECTED' WHERE TraineeID = '${req.body.TraineeID}' AND JobID = '${req.body.JobID}'`;
    console.log(query);
    await sql.connect(config);
    const request = new sql.Request();
    const result = await request.query(query);

    const data = {
      flag: 1,
      message: "Application rejected",
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

router.post("/fetchassigneeRecruiter", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "SELECT T.TraineeID, T.FirstName, T.LastName, T.Active FROM Trainee T JOIN memberdetails M ON " +
      "T.Username = M.useremail WHERE M.isAdmin != 1 AND T.Active = 1 AND M.Active = 1 AND M.PrimaryOrgID = " +
      req.body.orgID +
      "",
      function (err, recordset) {
        if (err) console.log(err);
        var result = { flag: 1, result: recordset.recordsets[0] };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

router.post('/TBassignee', async (req, res) => {
  try {
    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database connection error' });
      }
      const request = new sql.Request();
      let query = "update job set PrimaryRecruiterID ='"+req.body.selectedValue+"' where JobID = '"+req.body.JobID+"'";

      console.log(query);
      const recordset = await request.query(query);
      const result = {
        flag: 1,
        result: 'Successfully Inserted',
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

router.post('/DiceJobPost', async (req, res) => {

  const taxterm = reqBody.JobTypeID === 1 ? 'FULLTIME' :
                 reqBody.JobTypeID === 2 ? 'CON_W2' :
                 reqBody.JobTypeID === 3 ? 'PARTTIME' : '';

    const reqBody = {
    positionid: req.body.JobCode,
    diceid: '91142245',
    taxterm: taxterm,
    allowrecruiterapplies: 'Y',
    country: 'US',
    state: req.body.State,
    postalcode: req.body.ZipCode,
    location: req.body.Address,
    areacode: req.body.AreaCode,
    company: req.body.Company,
    companystate: req.body.State,
    companyzip: req.body.ZipCode,
    addr1: req.body.Address,
    payrate: req.body.PayRate,
    jobtitle: req.body.JobTitle,
    skillsreq: req.body.Skills,
    comments: req.body.JobDescription,
    applylink:'https://tresume.us/applyjob/'+req.body.JobCode
  };
  
  // Generate the batch file content
  const batchContent = generateBatchFile(reqBody);
  
  // Write the batch content to a text file
  fs.writeFile('jobs.txt', batchContent, (err) => {
    if (err) {
      console.error('Error writing batch file:', err);
      return;
    }
    
    console.log('Batch file created successfully');
    var body = "username: jobpostings@dmsol.in<br>password: Tresume@123";
    // Send email with the batch file attached
    const mailOptions = {
      from: 'jobpostings@dmsol.in',
      to: 'dicejobs@dice.com',
      bcc:'wilson.am@tresume.us',
      subject: 'Batch Posting Request',
      html: body,
      attachments: [
        {
          filename: 'jobs.txt',
          path: './jobs.txt'
        }
      ]
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  });
})

function generateBatchFile(reqBody) {
  let batchContent = `<!doctype batch totalreplace>\n<doc>\n`;

  Object.keys(reqBody).forEach(key => {
    batchContent += `<${key}>${reqBody[key]}</${key}>\n`;
  });

  batchContent += `</doc>\n`;

  return batchContent;
}

router.post('/JdEmailSent', async (req, res) => {
  const { to, subject, content } = req.body;
  try {
    // Connecting to SQL Server
    await sql.connect(config);
    const request = new sql.Request();
    const query = `SELECT username FROM trainee WHERE traineeid = 1`; // Static ID for example purposes

    console.log(query);
    const result = await request.query(query);
    const recipientEmail = result.recordset[0].username;
    console.log(recipientEmail);

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.mail.yahoo.com",
      auth: {
        user: "support@tresume.us",
        pass: "xzkmvglehwxeqrpd",
      },
      secure: true,
    });

    // Sample email content
    const mailOptions = {
      from: 'support@tresume.us',
      to: to,
      subject: subject,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tresume</title>
      <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Roboto, Arial, sans-serif;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
          }
          .header {
              text-align: center;
              background-color: #482668;
              padding: 20px 0;
       
          }
          .logo {
              display: block;
              margin: 0 auto;
          }
          .content {
              padding: 40px 20px;
              background-color: #f7f9fa;
              border-top-left-radius: 50px;
              border-top-right-radius: 50px;
          }
          .footer {
              text-align: center;
              background-color: #e7e7e7;
              padding: 20px 0;
              border-bottom-left-radius: 50px;
              border-bottom-right-radius: 50px;
          }
          .footer p {
              font-size: 12px;
              color: #8d8d8d;
          }
          .footer img {
              display: inline-block;
              vertical-align: middle;
              margin-right: 5px;
          }
      </style>
      </head>
      <body style="background-color: #482668;">
      <div class="container">
          <div class="header">
              <img src="https://tresume.us/email/Tresume_logo.png" alt="Tresume Logo" height="100" class="logo">
          </div>
          <div class="content" style="font-size:16px;">
          ${content}
          </div>
          <div class="footer">
              <p>POWERED BY <img src="https://tresume.us/assets/img/logo.png" alt="Tresume Logo" height="30"></p>
              <p> 44121 Leesburg Pike., STE 230 Ashburn, VA 20147, United States Of America</p>
              <p>(703) 9863350 | support@tresume.us </p>
              <p style="font-weight: bold; font-size: 12px; color: #a4a4a4;">© 2024 Tresume. Ltd. All rights reserved</p>
          </div>
      </div>
      </body>
      </html>
      `,


    };

    // Sending the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.send({ flag: 1, Message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send email');
  }
});

router.post('/GetJobsbyJobID', async (req, res) => {
  try {
    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database connection error' });
      }

      const query = `select * from job where jobid = ${req.body.JobID}`;

      console.log(query);
      
      const request = new sql.Request();
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

router.post("/UpdateJob", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const query = `
      UPDATE Job 
      SET 
          RecruiterID = @RecruiterID,
          OrgID = @OrgID,
          JobTitle = @JobTitle,
          Company = @Company,
          City = @City,
          State = @State,
          Country = @Country,
          ZipCode = @ZipCode,
          Address = @Address,
          AreaCode = @AreaCode,
          JobDescription = @JobDescription,
          Skills = @Skills,
          JobCode = @JobCode,
          PayRate = @PayRate,
          PayRateTypeID = @PayRateTypeID,
          PayRateCurrencyTypeID = @PayRateCurrencyTypeID,
          PayRateTaxTermID = @PayRateTaxTermID,
          BillRate = @BillRate,
          BillRateTypeID = @BillRateTypeID,
          BillRateCurrencyTypeID = @BillRateCurrencyTypeID,
          BillRateTaxTermID = @BillRateTaxTermID,
          JobTypeID = @JobTypeID,
          LegalStatus = @LegalStatus,
          NoOfPosition = @NoOfPosition,
          RespondDate = @RespondDate,
          ClientID = @ClientID,
          EndClient = @EndClient,
          ClientJobID = @ClientJobID,
          PriorityID = @PriorityID,
          Duration = @Duration,
          InterviewMode = @InterviewMode,
          SecruityClearance = @SecruityClearance,
          PrimaryRecruiterID = @PrimaryRecruiterID,
          RecruitmentManagerID = @RecruitmentManagerID,
          SalesManagerID = @SalesManagerID,
          AccountManagerID = @AccountManagerID,
          TaxTermID = @TaxTermID,
          Comments = @Comments,
          Active = @Active,
          LastUpdateBy = @LastUpdateBy,
          MinYearsOfExpInMonths = @MinYearsOfExpInMonths,
          JobStatus = @JobStatus
      WHERE 
          JobID = @JobID;
    `;

    // Assign values to parameters
    request.input('RecruiterID', sql.Int, req.body.RecruiterID);
    request.input('OrgID', sql.Int, req.body.OrgID);
    request.input('JobTitle', sql.VarChar(255), req.body.JobTitle);
    request.input('Company', sql.VarChar(255), req.body.Company);
    request.input('City', sql.VarChar(100), req.body.City);
    request.input('State', sql.VarChar(100), req.body.State);
    request.input('Country', sql.VarChar(100), req.body.Country);
    request.input('ZipCode', sql.VarChar(20), req.body.ZipCode);
    request.input('Address', sql.VarChar(255), req.body.Address);
    request.input('AreaCode', sql.VarChar(20), req.body.AreaCode);
    request.input('JobDescription', sql.Text, req.body.JobDescription);
    request.input('Skills', sql.VarChar(255), req.body.Skills);
    request.input('JobCode', sql.VarChar(50), req.body.JobCode);
    request.input('PayRate', sql.Decimal(18, 2), req.body.PayRate);
    request.input('PayRateTypeID', sql.Int, req.body.PayRateTypeID);
    request.input('PayRateCurrencyTypeID', sql.Int, req.body.PayRateCurrencyTypeID);
    request.input('PayRateTaxTermID', sql.Int, req.body.PayRateTaxTermID);
    request.input('BillRate', sql.Decimal(18, 2), req.body.BillRate);
    request.input('BillRateTypeID', sql.Int, req.body.BillRateTypeID);
    request.input('BillRateCurrencyTypeID', sql.Int, req.body.BillRateCurrencyTypeID);
    request.input('BillRateTaxTermID', sql.Int, req.body.BillRateTaxTermID);
    request.input('JobTypeID', sql.Int, req.body.JobTypeID);
    request.input('LegalStatus', sql.VarChar(50), req.body.LegalStatus);
    request.input('NoOfPosition', sql.Int, req.body.NoOfPosition);
    request.input('RespondDate', sql.Date, req.body.RespondDate);
    request.input('ClientID', sql.Int, req.body.ClientID);
    request.input('EndClient', sql.VarChar(255), req.body.EndClient);
    request.input('ClientJobID', sql.VarChar(50), req.body.ClientJobID);
    request.input('PriorityID', sql.Int, req.body.PriorityID);
    request.input('Duration', sql.VarChar(50), req.body.Duration);
    request.input('InterviewMode', sql.VarChar(50), req.body.InterviewMode);
    request.input('SecruityClearance', sql.VarChar(50), req.body.SecruityClearance);
    request.input('PrimaryRecruiterID', sql.Int, req.body.PrimaryRecruiterID);
    request.input('RecruitmentManagerID', sql.Int, req.body.RecruitmentManagerID);
    request.input('SalesManagerID', sql.Int, req.body.SalesManagerID);
    request.input('AccountManagerID', sql.Int, req.body.AccountManagerID);
    request.input('TaxTermID', sql.Int, req.body.TaxTermID);
    request.input('Comments', sql.Text, req.body.Comments);
    request.input('Active', sql.Bit, req.body.Active);
    request.input('LastUpdateBy', sql.VarChar(50), req.body.LastUpdateBy);
    request.input('MinYearsOfExpInMonths', sql.Int, req.body.MinYearsOfExpInMonths);
    request.input('JobStatus', sql.VarChar(50), req.body.JobStatus);
    request.input('JobID', sql.Int, req.body.JobID);

    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      const response = {
        flag: 1,
      };
      res.send(response);
    } else {
      const response = {
        flag: 0,
        error: "No records were updated.",
      };
      res.send(response);
    }
  } catch (error) {
    console.error("Error updating job:", error);
    const response = {
      flag: 0,
      error: "An error occurred while updating job.",
    };
    res.status(500).send(response);
  }
});

// Replace these with your actual client ID and secret
const clientId = 'b8a20d0b9d20b5a88e64482b37cca791ab924a3dcf48f9183f100c82e80c4348';
const clientSecret = 'o1Wm8LbqxvqZC4mMr95DS57SeGchDgYidrVoFm5HVWZljM0qqHxvLuuude89MkNu';
const tokenEndpoint = 'https://apis.indeed.com/graphql';
const graphqlEndpoint = 'https://apis.indeed.com/graphql';

let accessToken = '';
let tokenExpiration = Date.now();

// Middleware to check and refresh token if needed
const checkAndRefreshToken = async (req, res, next) => {
  if (!accessToken || Date.now() >= tokenExpiration) {
    try {
      const response = await axios.post(tokenEndpoint, {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      accessToken = response.data.access_token;
      tokenExpiration = Date.now() + response.data.expires_in * 1000; 
      console.log('Access token refreshed:', accessToken);
    } catch (error) {
      console.error('Error refreshing token:', error.response.data);
      return res.status(500).send('Failed to refresh access token');
    }
  }
  next();
};

// Endpoint to submit a job posting
app.post('/submit-job', checkAndRefreshToken, async (req, res) => {
  const {
    title,
    description,  
    location,
    benefits,
    companyName,
    sourceName,
    jobPostingId,
    datePublished,
    url,
    contacts
  } = req.body;

  const query = `
    mutation {
      jobsIngest {
        createSourcedJobPostings(input: {
          jobPostings: [{
            body: {
              title: "${title}",
              description: "${description}",
              location: {
                country: "${location.country}",
                cityRegionPostal: "${location.cityRegionPostal}"
              },
              benefits: ${JSON.stringify(benefits)}
            },
            metadata: {
              jobSource: {
                companyName: "${companyName}",
                sourceName: "${sourceName}",
                sourceType: "Employer"
              },
              jobPostingId: "${jobPostingId}",
              datePublished: "${datePublished}",
              url: "${url}",
              contacts: ${JSON.stringify(contacts)}
            }
          }]
        }) {
          results {
            jobPosting {
              sourcedPostingId
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      graphqlEndpoint,
      { query },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error submitting job posting:', error.response?.data || error.message);
    res.status(500).send('Failed to submit job posting to Indeed API');
  }
});

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
module.exports = router;

