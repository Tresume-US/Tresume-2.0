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

app.post('/JdEmailSent', async (req, res) => {
  const { to, subject, content } = req.body;

  try {
    await sql.connect(config);
    const request = new sql.Request();

    // Placeholder for SQL query
    // const query = `SELECT username FROM trainee WHERE traineeid = ${timesheetAdmin}`;
    // const result = await request.query(query);
    // var recipientEmail = result.recordset[0].username;

    const transporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true,
      auth: {
        user: "support@tresume.us",
        pass: "xzkmvglehwxeqrpd",
      },
    });

    const mailOptions = {
      from: 'support@tresume.us',
      to: to,
      subject: subject,
      html: `<p>${content}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.send({
      flag: 1,
      Message: 'Email sent successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send email');
  }
});

module.exports = router;

