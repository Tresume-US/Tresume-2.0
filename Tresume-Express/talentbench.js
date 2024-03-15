const express = require("express");
const router = express.Router();
const pool = require("./database");
var request = require("request");
var sql = require("mssql");
const axios = require("axios");
const nodemailer = require("nodemailer");
var crypto = require("crypto");
const bodyparser = require('body-parser');
const ExcelJS = require('exceljs');
const fs = require('fs');
 
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

function generateSearchCondition(searchterm) {
  if (searchterm.includes(' ')) {
    const words = searchterm.split(' ');
    return `tr.FirstName LIKE '%${words[0]}%' AND tr.LastName LIKE '%${words[1]}%'`;
  } else if (searchterm.includes('@')) {
    return `tr.UserName LIKE '%${searchterm}%'`;
  } else {
    return `(tr.FirstName LIKE '%${searchterm}%' OR tr.LastName LIKE '%${searchterm}%' OR tr.UserName LIKE '%${searchterm}%')`;
  }
}

router.post('/getTalentBenchList', async (req, res) => {
  try {
    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect();
    await poolConnect;

    const traineeID = req.body.traineeID;
    const OrganizationID = req.body.OrganizationID;
    const username = req.body.username;
    const searchterm = req.body.searchterm;
    const Page = req.body.Page * 25;
    const startdate = req.body.startdate;
    const enddate = req.body.enddate;
    const request = new sql.Request(pool);

    const query = `
    WITH CountCTE AS (
      SELECT COUNT(*) AS TotalCount
      FROM Trainee tr
      INNER JOIN memberdetails md ON tr.userorganizationid IN (SELECT Value FROM dbo.SplitString(md.accessorg, ','))
      INNER JOIN talentbench tb ON tr.TraineeID = tb.TraineeID
      WHERE md.useremail = '${username}'
          AND tr.active = 1
          AND tb.active = 1
          AND ${generateSearchCondition(searchterm)}
          ${startdate && enddate ? `AND tb.CreateTime BETWEEN '${startdate}' AND '${enddate}'` : ''}
  ),
  Results AS (
      SELECT 
          tr.TraineeID,
          tb.TBID,
          tr.firstname AS FirstName,
          tr.lastname AS LastName,
          tr.RecruiterName,
          tr.MarketerName,
          tr.Title,
          tr.username AS UserName,
          org.organizationname,
          tr.LegalStatus,
          tr.GroupID,
      tb.CreateTime,
          DATEDIFF(day, tb.CreateTime, GETDATE()) AS Age,
          tb.IsNew
      FROM 
          Trainee tr
      INNER JOIN 
          memberdetails md ON tr.userorganizationid IN (SELECT Value FROM dbo.SplitString(md.accessorg, ','))
      INNER JOIN 
          organization org ON tr.userorganizationid = org.organizationid
      INNER JOIN 
          talentbench tb ON tr.TraineeID = tb.TraineeID
      WHERE 
          md.useremail = '${username}'
          AND tr.active = 1
          AND tb.active = 1
          AND ${generateSearchCondition(searchterm)}
          ${startdate && enddate ? `AND tb.CreateTime BETWEEN '${startdate}' AND '${enddate}'` : ''}
          ORDER BY 
          tb.CreateTime DESC
          OFFSET ${Page} ROWS FETCH NEXT 25 ROWS ONLY
  )
  SELECT 
      TotalCount,
      TraineeID,
      TBID,
      FirstName,
      LastName,
      RecruiterName,
      MarketerName,
      Title,
      UserName,
      organizationname,
      LegalStatus,
      GroupID,
      Age,
      IsNew
  FROM 
      CountCTE
  CROSS JOIN 
      Results;
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
        error: "No active clients found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching talent bench data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching talent bench data!",
    };
    res.status(500).send(result);
  }
});


// router.post('/getTalentBenchList', async (req, res) => {
//   try {
//     const pool = new sql.ConnectionPool(config);
//     const poolConnect = pool.connect();
//     await poolConnect;

//     const traineeID = req.body.traineeID;
//     const OrganizationID = req.body.OrganizationID;

//     const request = new sql.Request(pool);

//     const query = `
//     SELECT
//     trn.TraineeID, trn.FirstName, trn.LastName, trn.YearsOfExpInMonths, trn.Organization, org.organizationname, trn.CandidateStatus, trn.PhoneNumber,
//     TB.GroupID, trn.CurrentLocation, trn.MiddleName, trn.Gender, trn.Degree, trn.ReferralType, trn.RecruiterName, trn.LegalStatus, trn.Notes,
//     trn.Title AS [TraineeTitle], COUNT(trn.TraineeID) OVER() AS overall_count, ISNULL(tr.Rating, 0) AS QuickRate, TB.TBID, trn.Source,
//     TB.BenchStatus, (SELECT PhoneNumber FROM Phone WHERE PhoneID = (SELECT TOP(1) PhoneID FROM TraineePhone WHERE TraineeID = trn.TraineeID)) AS phone,
//     trn.UserName, TB.BillRate, TB.PayType, TB.ReferredBy, TB.CreateTime, DATEDIFF(DAY, TB.CreateTime, GETUTCDATE()) AS age,
//     CONCAT(T1.FirstName, ' ', T1.MiddleName, ' ', T1.LastName) AS Recruiter, ISNULL(TB.IsNew, '0') AS IsNew,
//     (SELECT traineeid FROM JBDetail WHERE jobid = '') AS JBTraineeID, trn.groupid
// FROM
//     Trainee trn (NOLOCK)
//     LEFT JOIN TraineeRating tr (NOLOCK) ON tr.Active = 1 AND trn.TraineeID = tr.TraineeID AND tr.Recruiterid = '${traineeID}'
//     LEFT JOIN Trainee T1 ON T1.TraineeID = trn.RecruiterName AND T1.Active = 1
//     JOIN TalentBench TB (NOLOCK) ON TB.Active = 1 AND trn.TraineeID = TB.TraineeID
//     JOIN organization org ON trn.UserOrganizationID = org.organizationid -- Added join to fetch organizationname
// WHERE
//     trn.Talentpool = 1
//     AND (trn.UserOrganizationID = '${OrganizationID}' OR trn.TraineeID IN (
//       SELECT ja.TraineeID
//       FROM JobApplication ja
//       WHERE ja.Active = 1 AND ja.JobID IN (
//         SELECT j.JobID
//         FROM Job j
//         WHERE j.Active = 1 AND j.RecruiterID IN (
//           SELECT TraineeID
//           FROM Trainee
//           WHERE OrganizationID = '${OrganizationID}' AND Active = 1 AND Role = 'RECRUITER'
//         )
//       )
//     ))
//     AND trn.active = 1 AND trn.Role = 'TRESUMEUSER'
// GROUP BY
//     trn.TraineeID, T1.FirstName, T1.MiddleName, T1.LastName, trn.FirstName, trn.PhoneNumber, trn.LastName, trn.YearsOfExpInMonths,
//     trn.CandidateStatus, TB.TBID, TB.GroupID, trn.MiddleName, trn.Gender, trn.Degree, trn.ReferralType, trn.RecruiterName, trn.LegalStatus,
//     trn.Notes, trn.Organization, org.organizationname, trn.CurrentLocation, trn.Title, trn.LastUpdateTime, trn.CreateTime, tr.Rating, trn.Source,
//     TB.BenchStatus, trn.UserName, TB.BillRate, TB.PayType, TB.ReferredBy, TB.CreateTime, TB.IsNew, trn.groupid
// ORDER BY
//     trn.CreateTime DESC
//     `;


//     const recordset = await request.query(query);

//     if (recordset && recordset.recordsets && recordset.recordsets.length > 0) {
//       const result = {
//         flag: 1,
//         result: recordset.recordsets[0],
//       };
//       res.send(result);
//     } else {
//       const result = {
//         flag: 0,
//         error: "No active clients found!",
//       };
//       res.send(result);
//     }
//   } catch (error) {
//     console.error("Error fetching talent bench data:", error);
//     const result = {
//       flag: 0,
//       error: "An error occurred while fetching talent bench data!",
//     };
//     res.status(500).send(result);
//   }
// });

// router.post('/AddTalentBenchList', async function (req, res) {
//   try {
//     var TraineeID = await generateTraineeID();
//     console.log(TraineeID);
//     var query =
//       "IF NOT EXISTS(SELECT * FROM Trainee WHERE UserName = '" +
//       req.body.email +
//       "' AND UserOrganizationID = '" + req.body.orgID + "') " +
//       "BEGIN " +
//       "INSERT INTO Trainee (TraineeID, username, firstName, phonenumber, middleName, lastName, legalStatus, candidateStatus, degree, gender, notes, recruiterName, referralType, locationConstraint, marketerName,Active,Accountstatus,profilestatus,role,createtime,userorganizationid,createby,FollowUpon, CurrentLocation,talentpool ) " +
//       "VALUES (" +
//       `'${TraineeID}',` +
//       ` ${formatValue(req.body.email || '')},` +
//       ` ${formatValue(req.body.firstName || '')},` +
//       ` ${formatValue(req.body.phone || '')},` +
//       ` ${formatValue(req.body.middleName || '')},` +
//       ` ${formatValue(req.body.lastName || '')},` +
//       ` ${formatValue(req.body.legalStatus || '')},` +
//       ` ${formatValue(req.body.candidateStatus || '')},` +
//       ` ${formatValue(req.body.degree || '')},` +
//       ` ${formatValue(req.body.gender || '')},` +
//       ` ${formatValue(req.body.notes || '')},` +
//       ` ${formatValue(req.body.recruiterName || '')},` +
//       ` ${formatValue(req.body.referralType || '')},` +
//       ` ${formatValue(req.body.locationConstraint || '')},` +
//       ` ${formatValue(req.body.marketerName || '')},` +
//       ' 1,' +
//       " 'ACTIVE'," +
//       " 'READY'," +
//       " 'TRESUMEUSER', " +
//       " GETDATE(), " +
//       ` ${formatValue(req.body.orgID || '')},` +
//       ` ${formatValue(req.body.createby || '')},` +
//       ` ${formatValue(req.body.followupon || '')},` +
//       ` ${formatValue(req.body.currentLocation || '')}` +
//       ",1) END";

//     console.log(query);

//     await sql.connect(config);
//     var request = new sql.Request();
//     var result = await request.query(query);



//     const data = {
//       flag: 1,
//       message: "Trainee Candidate Data Fetched",
//     };

//     res.send(data);
//   }
//   catch (error) {
//     const data = {
//       flag: 1,
//       message: "Internal Server Error",
//     };
//     res.status(500).send(data);
//   }
// });

// router.post('/AddTalentBenchList', async function (req, res) {
//   try {
//     var TraineeID = await generateTraineeID();
//     console.log(TraineeID);

//     // Insert into Trainee table
//     var traineeQuery =
//     "IF NOT EXISTS(SELECT * FROM Trainee WHERE UserName = '" +
//     req.body.email +
//     "' AND UserOrganizationID = '" + req.body.orgID + "') " +
//     "BEGIN " +
//     "INSERT INTO Trainee (TraineeID, username, firstName, phonenumber, middleName, lastName, legalStatus, candidateStatus, degree, gender, notes, recruiterName, referralType, locationConstraint, marketerName,Active,Accountstatus,profilestatus,role,createtime,userorganizationid,createby,FollowUpon, CurrentLocation,talentpool ) " +
//     "VALUES (" +
//     `'${TraineeID}',` +
//     ` ${formatValue(req.body.email || '')},` +
//     ` ${formatValue(req.body.firstName || '')},` +
//     ` ${formatValue(req.body.phone || '')},` +
//     ` ${formatValue(req.body.middleName || '')},` +
//     ` ${formatValue(req.body.lastName || '')},` +
//     ` ${formatValue(req.body.legalStatus || '')},` +
//     ` ${formatValue(req.body.candidateStatus || '')},` +
//     ` ${formatValue(req.body.degree || '')},` +
//     ` ${formatValue(req.body.gender || '')},` +
//     ` ${formatValue(req.body.notes || '')},` +
//     ` ${formatValue(req.body.recruiterName || '')},` +
//     ` ${formatValue(req.body.referralType || '')},` +
//     ` ${formatValue(req.body.locationConstraint || '')},` +
//     ` ${formatValue(req.body.marketerName || '')},` +
//     ' 1,' +
//     " 'ACTIVE'," +
//     " 'READY'," +
//     " 'TRESUMEUSER', " +
//     " GETDATE(), " +
//     ` ${formatValue(req.body.orgID || '')},` +
//     ` ${formatValue(req.body.createby || '')},` +
//     ` ${formatValue(req.body.followupon || '')},` +
//     ` ${formatValue(req.body.currentLocation || '')}` +
//     ",1) END";

//     console.log(traineeQuery);

//     await sql.connect(config);
//     var traineeRequest = new sql.Request();
//     var traineeResult = await traineeRequest.query(traineeQuery);

//     // Insert into TalentBench table
//     var talentBenchQuery =
//     "INSERT INTO TalentBench " +
//     "([TraineeID], [Name], [ReferredBy], [Currency], [BillRate], [PayType], [TaxTerm], [ConsultantType], [JobTitle], [LocationPreference], [BenchStatus], [Availability], [txtComments], [Active], [CreateBy], [CreateTime], [GroupID], [IsNew]) " +
//     "VALUES (" +
//     `'${TraineeID}',` + 
//     ` ${formatValue(req.body.firstName + ' ' + req.body.lastName || '')},` +
//     ` ${formatValue(req.body.recruiterName || '')},` +
//     " NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'TRESUMEUSER', GETDATE(), NULL, 1)";
  

//     console.log(talentBenchQuery);
//     await sql.connect(config);
//     var talentBenchRequest = new sql.Request();
//     var talentBenchResult = await talentBenchRequest.query(talentBenchQuery);

//     const data = {
//       flag: 1,
//       message: "Trainee Candidate Data Fetched",
//     };
//     res.send(data);
//   }
//   catch (error) {
//     const data = {
//       flag: 1,
//       message: "Internal Server Error",
//     };
//     res.status(500).send(data);
//   }
// });

router.post('/AddTalentBenchList', async function (req, res) {
  try {
    // Generate TraineeID
    var TraineeID = await generateTraineeID();
    console.log(TraineeID);

    // Connect to SQL Server
    await sql.connect(config);

    // Insert into Trainee table
    var traineeQuery =
    "IF NOT EXISTS(SELECT * FROM Trainee WHERE UserName = '" +
    req.body.email +
    "' AND UserOrganizationID = '" + req.body.orgID + "') " +
    "BEGIN " +
    "INSERT INTO Trainee (TraineeID, username, firstName, phonenumber, middleName, lastName, legalStatus, candidateStatus, degree, gender, notes, recruiterName, referralType, locationConstraint, marketerName,Active,Accountstatus,profilestatus,role,createtime,userorganizationid,createby,FollowUpon, CurrentLocation,talentpool ) " +
    "VALUES (" +
    `'${TraineeID}',` +
    ` ${formatValue(req.body.email || '')},` +
    ` ${formatValue(req.body.firstName || '')},` +
    ` ${formatValue(req.body.phone || '')},` +
    ` ${formatValue(req.body.middleName || '')},` +
    ` ${formatValue(req.body.lastName || '')},` +
    ` ${formatValue(req.body.legalStatus || '')},` +
    ` ${formatValue(req.body.candidateStatus || '')},` +
    ` ${formatValue(req.body.degree || '')},` +
    ` ${formatValue(req.body.gender || '')},` +
    ` ${formatValue(req.body.notes || '')},` +
    ` ${formatValue(req.body.recruiterName || '')},` +
    ` ${formatValue(req.body.referralType || '')},` +
    ` ${formatValue(req.body.locationConstraint || '')},` +
    ` ${formatValue(req.body.marketerName || '')},` +
    ' 1,' +
    " 'ACTIVE'," +
    " 'READY'," +
    " 'TRESUMEUSER', " +
    " GETDATE(), " +
    ` ${formatValue(req.body.orgID || '')},` +
    ` ${formatValue(req.body.createby || '')},` +
    ` ${formatValue(req.body.followupon || '')},` +
    ` ${formatValue(req.body.currentLocation || '')}` +
    ",1) END";

    console.log(traineeQuery);

    var traineeRequest = new sql.Request();
    var traineeResult = await traineeRequest.query(traineeQuery);

    // Insert into TalentBench table
    var talentBenchQuery =
    "INSERT INTO TalentBench " +
    "([TraineeID], [Name], [ReferredBy], [Currency], [BillRate], [PayType], [TaxTerm], [ConsultantType], [JobTitle], [LocationPreference], [BenchStatus], [Availability], [txtComments], [Active], [CreateBy], [CreateTime], [GroupID], [IsNew]) " +
    "VALUES (" +
    `'${TraineeID}',` +
    ` ${formatValue(req.body.firstName + ' ' + req.body.lastName || '')},` +
    " NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'TRESUMEUSER', GETDATE(), NULL, 1)";



  // If recruiterName is not provided, set it to an empty string in the query
  if (!req.body.recruiterName) {
    talentBenchQuery = talentBenchQuery.replace(` ${formatValue(req.body.recruiterName || '')}`, " ''");
  }

  console.log(talentBenchQuery);


    var talentBenchRequest = new sql.Request();
    var talentBenchResult = await talentBenchRequest.query(talentBenchQuery);

    // Close the SQL connection
    await sql.close();

    const data = {
      flag: 1,
      message: "Trainee Candidate Data Fetched",
    };
    res.send(data);
  } catch (error) {
    console.error("Error:", error.message);

    // Close the SQL connection in case of an error
    await sql.close();

    const data = {
      flag: 1,
      message: "Internal Server Error",
    };
    res.status(500).send(data);
  }
});



async function generateTraineeID() {
  try {
    await sql.connect(config);
    var request = new sql.Request();

    var query = "SELECT TOP 1 TraineeID FROM Trainee ORDER BY TraineeID DESC";
    console.log(query)
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


router.post('/getGroupList', async (req, res) => {
  try {
    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect();
    await poolConnect;
    const OrganizationID = req.body.OrganizationID;

    const request = new sql.Request(pool);

    const query = `
    SELECT
    g.GID,
    g.GroupName,
    COUNT(t.traineeID) AS TotalTrainees
    FROM
        groups g
    LEFT JOIN
        trainee t ON g.GID = t.groupid AND t.active = 1
    WHERE
        g.active = 1 AND
        g.orgID = '${OrganizationID}'
    GROUP BY
        g.GID, g.GroupName;
    `;

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
        error: "No active clients found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching talent bench data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching talent bench data!",
    };
    res.status(500).send(result);
  }
});


router.post('/addGroup', async (req, res) => {
  try {
    var query = `
    INSERT INTO groups (groupName, orgID,Active,createtime,CreatedBy)
    VALUES (+'${req.body.groupName}', ${req.body.orgID}, ${req.body.Active || '1'},GETDATE(),'${req.body.createby}');
  `;
    console.log(query);
    const pool = await sql.connect(config);
    const request = new sql.Request(pool);
    const recordset = await request.query(query);

    const result = {
      flag: 1,
      message: "Client data inserted successfully!",
    };
    res.status(200).json(result);

  } catch (error) {
    console.error("Error inserting Client data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while inserting Client data!",
    };
    res.status(500).json(result);
  }
});



// Helper function to format values
function formatValue(value) {
  return value !== undefined ? `'${value}'` : '';
}


router.post('/fetchGroupList', async (req, res) => {
  try {
    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect();
    await poolConnect;

    const OrganizationID = req.body.OrganizationID;

    const request = new sql.Request(pool);

    const query = "SELECT * FROM groups WHERE active = 1 AND orgID = '" + req.body.orgID + "' ";

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
        error: "No active groups found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching group data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching group data!",
    };
    res.status(500).send(result);
  }
});


router.post('/TBupdateSelected', async (req, res) => {
  try {
    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect();
    await poolConnect;

    const traineeID = req.body.traineeid;
    const groupid = req.body.groupid;
    const marketername = req.body.marketername;
    var query = '';
    if(groupid){
      query = "UPDATE trainee SET groupid='"+groupid+"' WHERE traineeid = '"+traineeID+"'";
    }else{
      query = "UPDATE trainee SET MarketerName='"+marketername+"' WHERE traineeid = '"+traineeID+"'";
    }

    const request = new sql.Request(pool);


    const recordset = await request.query(query);
    console.log(recordset);
    if (recordset&&recordset.rowsAffected) {
      const result = {
        flag: 1,
        message: "Data Updated Successfully",
      };
      res.send(result);
    } else {
      const result = {
        flag: 0,
        message: "Error please try again",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching group data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching group data!",
    };
    res.status(500).send(result);
  }
});

router.post('/deleteGroup', async (req, res) => {
  try {
    const grp = await deactivatedeleteGroup(req.body.GID);
    if (grp) {
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
    console.error("Error deleting Group Name:", error);
    const result = {
      flag: 0,
      error: "An error occurred while deleting the Group Name!",
    };
    res.status(500).send(result);
  }

})

async function deactivatedeleteGroup(GID) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    var query = "UPDATE groups set Active = 0 where GID ="+ GID ;
    console.log(query);
    const queryResult = await request.query(query);

    if (queryResult.rowsAffected[0] === 0) {
      throw new Error("No records found!");
    }
    return queryResult;
  } catch (error) {
    console.error("Error while deleting Group Name:", error);
    throw error;
  }
}

// Endpoint to check if email exists
router.post('/checkEmail', async function (req, res) {
  const email = req.body.email;
  const orgID = req.body.orgID;

  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM Trainee WHERE Active = 1 AND userOrganizationID =${orgID}  AND userName = ${email}`;

    if (result.recordset.length > 0) {
      
      const data = {
        flag: 2,
        message: "The candidate is already under "+result.recordset[0].CreateBy,
      };
      res.send(data);
    } else {
      const data = {
        flag: 1,
        message: "The candidate is not available",
      };
      res.send(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await sql.close();
  }
});


async function executeQuery(query, params = []) {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(query, ...params);
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

router.post('/InterviewReportDownload', async (req, res) => {
  try {
    const query = `
      SELECT 
          TI.TraineeInterviewID,
          CONCAT(T.FirstName, ' ', T.LastName) AS CandidateName,
          CONCAT(R.FirstName, ' ', R.LastName) AS Recruiter,
          TI.InterviewDate,
          TI.InterviewStatus,
          TI.Assistedby,
          TI.TypeofAssistance,
          TI.VendorName,
          TI.ClientName,
          TI.Notes,
          TI.CreateTime
      FROM 
          TraineeInterview TI
      INNER JOIN 
          Trainee T ON TI.TraineeID = T.TraineeID
      INNER JOIN 
          Trainee R ON TI.RecruiterID = R.TraineeID
      WHERE 
          TI.Active = 1 
          AND TI.InterviewDate >= '${req.body.startdate}'
          AND TI.InterviewDate < '${req.body.enddate}'
          AND R.OrganizationID = '${req.body.OrgID}'`;

    const result = await executeQuery(query);

    // Create a new Excel workbook and worksheet
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('TraineeInterviews');

    // Define column headers
    const headers = [
      'TraineeInterviewID',
      'CandidateName',
      'Recruiter',
      'InterviewDate',
      'InterviewStatus',
      'Assistedby',
      'TypeofAssistance',
      'VendorName',
      'ClientName',
      'Notes',
      'CreateTime',
    ];

    // Add headers to the worksheet
    ws.addRow(headers);

    // Add data to the worksheet
    result.forEach((row) => {
      ws.addRow(headers.map((header) => row[header]));
    });

    // Save the workbook to a file
    const filePath = 'TraineeInterviews.xlsx';
    await wb.xlsx.writeFile(filePath);

    // Send the file for download
    res.download(filePath, 'TraineeInterviews.xlsx', (err) => {
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.post('/DSRReportDownload', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.SubmissionID,
        s.Title,
        FORMAT(s.submissiondate, 'dd-MM-yyyy') AS SubmissionDate,
        CONCAT(m.FirstName, ' ', m.LastName) AS Marketer,
        CONCAT(t.FirstName, ' ', t.LastName) AS Candidate,
        s.VendorName,
        s.ClientName,
        s.Note,
        s.Rate,
        FORMAT(s.createtime, 'dd-MM-yyyy') AS CreatedOn
      FROM 
        submission s
      INNER JOIN 
        Trainee t ON s.TraineeID = t.TraineeID
      INNER JOIN 
        Trainee m ON s.markerterid = m.TraineeID
      WHERE 
        s.Active = 1 
        AND m.Active = 1 
        AND s.SubmissionDate BETWEEN '${req.body.startdate}' AND '${req.body.enddate}'
        AND m.OrganizationID = '${req.body.OrgID}'`;

    const result = await executeQuery(query);

    // Create a new Excel workbook and worksheet
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Submissions');

    // Define column headers
    const headers = [
      'SubmissionID',
      'Title',
      'SubmissionDate',
      'Marketer',
      'Candidate',
      'VendorName',
      'ClientName',
      'Note',
      'Rate',
      'CreatedOn',
    ];

    // Add headers to the worksheet
    ws.addRow(headers);

    // Add data to the worksheet
    result.forEach((row) => {
      ws.addRow(headers.map((header) => row[header]));
    });

    // Save the workbook to a file
    const filePath = 'Submissions.xlsx';
    await wb.xlsx.writeFile(filePath);

    // Send the file for download
    res.download(filePath, 'Submissions.xlsx', (err) => {
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.post('/PlacementReportDownload', async (req, res) => {
  try {
    const query = `
      SELECT 
        P.PID,
        T1.FirstName + ' ' + T1.LastName AS CandidateName,
        T2.FirstName + ' ' + T2.LastName AS MarketerName,
        T3.FirstName + ' ' + T3.LastName AS RecruiterName,
        P.positiontitle,
        P.BillType,
        P.BillRate,
        P.PlacedDate,
        P.ClientState,
        P.CandidateEmailId,
        P.ClientAddress,
        P.ClientManagerName,
        P.ClientEmail,
        P.ClientPhoneNumber,
        P.VendorContactName,
        P.VendorEmail,
        P.VendorPhone,
        P.VendorAddress,
        P.SubVendorName
      FROM 
        placements P
      LEFT JOIN 
        Trainee T1 ON P.TraineeID = T1.TraineeID
      LEFT JOIN 
        Trainee T2 ON P.marketername = T2.TraineeID
      LEFT JOIN 
        Trainee T3 ON P.RecuiterID = T3.TraineeID
      WHERE 
        P.Active = 1 
        AND P.PlacedDate >= '${req.body.startdate}'
        AND P.PlacedDate <= '${req.body.enddate}'
        AND T2.OrganizationID = '${req.body.OrgID}'`;

    const result = await executeQuery(query);

    // Create a new Excel workbook and worksheet
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Placements');

    // Define column headers
    const headers = [
      'PID',
      'CandidateName',
      'MarketerName',
      'RecruiterName',
      'positiontitle',
      'BillType',
      'BillRate',
      'PlacedDate',
      'ClientState',
      'CandidateEmailId',
      'ClientAddress',
      'ClientManagerName',
      'ClientEmail',
      'ClientPhoneNumber',
      'VendorContactName',
      'VendorEmail',
      'VendorPhone',
      'VendorAddress',
      'SubVendorName',
    ];

    // Add headers to the worksheet
    ws.addRow(headers);

    // Add data to the worksheet
    result.forEach((row) => {
      ws.addRow(headers.map((header) => row[header]));
    });

    // Save the workbook to a file
    const filePath = 'Placements.xlsx';
    await wb.xlsx.writeFile(filePath);

    // Send the file for download
    res.download(filePath, 'Placements.xlsx', (err) => {
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
