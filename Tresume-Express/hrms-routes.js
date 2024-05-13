const express = require("express");
const router = express.Router();
const pool = require("./database");
var request = require("request");
var sql = require("mssql");
const axios = require("axios");
const nodemailer = require("nodemailer");
var crypto = require("crypto");
const bodyparser = require("body-parser");
const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
const apiUrl = envconfig.apiUrl;
router.use(bodyparser.json());
const exceljs = require("exceljs");
const excel = require('exceljs');
const fs = require('fs');

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/inetpub/vhosts/tresume.us/httpdocs/Content/ProfileVideo/');
  },
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueFilename + fileExtension);
  }
});

const upload = multer({ storage: storage });

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
/*
router.post("/gethrmscandidateList", async (req, res) => {
  try {
    const timeoutDuration = 60000; // Timeout duration in milliseconds (15 seconds)

    // Set a timeout for the database query
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Request timed out"));
      }, timeoutDuration);
    });

    // Execute the database query within the timeout
    const databasePromise = new Promise(async (resolve, reject) => {
      try {
        const pool = await sql.connect(config);
        const request = new sql.Request();
        var traineeid = req.body.TraineeID;
        var useremail = req.body.useremail;
        var admin = req.body.admin;
        var searchterm = req.body.searchterm;
        var Page = req.body.Page * 25;
        var query = "";

        function generateSearchCondition(searchterm) {
          if (searchterm.includes(" ")) {
            const words = searchterm.split(" ");
            return `T.FirstName LIKE '%${words[0]}%' AND T.LastName LIKE '%${words[1]}%'`;
          } else if (searchterm.includes("@")) {
            return `T.UserName LIKE '%${searchterm}%'`;
          } else {
            return `(T.FirstName LIKE '%${searchterm}%' OR T.LastName LIKE '%${searchterm}%' OR T.UserName LIKE '%${searchterm}%')`;
          }
        }

        if (admin) {
          query = `WITH CountCTE AS (
      SELECT COUNT(*) AS TotalCount
      FROM Trainee T
      INNER JOIN Memberdetails M ON T.userorganizationid IN (SELECT Value FROM dbo.SplitString(M.accessorg, ','))
      INNER JOIN Currentstatus CS ON T.CandidateStatus = CS.CSID
      LEFT JOIN Trainee CreatedBy ON T.createby = CreatedBy.username
      INNER JOIN Organization O ON T.userorganizationid = O.organizationid
      WHERE M.useremail = '${useremail}' AND T.active = 1   AND ${generateSearchCondition(
            searchterm
          )}
  ),
  PaginatedResults AS (
    SELECT T.TraineeID, CONCAT(T.firstname, ' ', T.lastname) AS Name, CONCAT(CreatedBy.firstname, ' ', CreatedBy.lastname) AS CreatedBy,      
    T.username AS Email, O.organizationname, T.LegalStatus AS LegalStatus, T.PhoneNumber AS Phone, CS.CSName AS CandidateStatus,
    T.followupon, T.notes, T.CreateTime AS DateCreated
FROM Trainee T
INNER JOIN Memberdetails M ON T.userorganizationid IN (SELECT Value FROM dbo.SplitString(M.accessorg, ','))
INNER JOIN Currentstatus CS ON T.CandidateStatus = CS.CSID
LEFT JOIN Trainee CreatedBy ON T.createby = CreatedBy.username
INNER JOIN Organization O ON T.userorganizationid = O.organizationid
      WHERE M.useremail = '${useremail}' AND T.active = 1    AND ${generateSearchCondition(
            searchterm
          )}
      ORDER BY T.CreateTime DESC
      OFFSET ${Page} ROWS FETCH NEXT 25 ROWS ONLY
  )
  SELECT TotalCount, *
  FROM CountCTE
  CROSS JOIN PaginatedResults;`;
        } else {
          query = `WITH CountCTE AS (
      SELECT COUNT(*) AS TotalCount
      FROM Trainee T
      INNER JOIN Currentstatus CS ON T.CandidateStatus = CS.CSID
      LEFT JOIN Trainee CreatedBy ON T.CreateBy = CreatedBy.UserName
      LEFT JOIN organization O ON T.userorganizationid = O.organizationid
      WHERE T.RecruiterName = '${traineeid}'
  ),
  PaginatedResults AS (
      SELECT T.TraineeID, CONCAT(CreatedBy.FirstName, ' ', CreatedBy.LastName) AS CreatedBy, CONCAT(T.FirstName, ' ', T.LastName) AS Name, T.UserName AS Email, T.PhoneNumber AS Phone, T.LegalStatus AS LegalStatus, CS.CSName AS CandidateStatus, T.CreateTime AS DateCreated, T.followupon, T.notes, O.organizationname
      FROM Trainee T
      INNER JOIN Currentstatus CS ON T.CandidateStatus = CS.CSID
      LEFT JOIN Trainee CreatedBy ON T.CreateBy = CreatedBy.UserName
      LEFT JOIN organization O ON T.userorganizationid = O.organizationid
      WHERE T.RecruiterName = '${traineeid}' AND ${generateSearchCondition(
            searchterm
          )}
      ORDER BY T.CreateTime DESC
      OFFSET '${Page}' ROWS FETCH NEXT 25 ROWS ONLY
  )
  SELECT TotalCount, *
  FROM CountCTE
  CROSS JOIN PaginatedResults;`;
        }

        console.log(query);

        const recordset = await request.query(query);

        if (
          recordset &&
          recordset.recordsets &&
          recordset.recordsets.length > 0
        ) {
          const result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          resolve(result);
        } else {
          const result = {
            flag: 0,
            error: "No active candidates found!",
          };
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });

    // Wait for either the database query to complete or the timeout to occur
    const result = await Promise.race([databasePromise, timeoutPromise]);

    res.send(result);
  } catch (error) {
    console.error("Error fetching candidates data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching candidates data!",
    };
    res.status(500).send(result);
  }
});
*/

router.post("/gethrmscandidateList", async (req, res) => {
  try {
    const timeoutDuration = 60000; // Timeout duration in milliseconds (60 seconds)

    // Set a timeout for the database query
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Request timed out"));
      }, timeoutDuration);
    });

    // Execute the database query within the timeout
    const databasePromise = new Promise(async (resolve, reject) => {
      try {
        const pool = await sql.connect(config);
        const request = new sql.Request();
        var traineeid = req.body.TraineeID;
        var useremail = req.body.useremail;
        var admin = req.body.admin;
        var searchterm = req.body.searchterm;
        var Page = req.body.Page * 25;
        var query = "";

        // Function to generate search condition based on search term
        function generateSearchCondition(searchterm) {
          if (searchterm.includes(" ")) {
            const words = searchterm.split(" ");
            return `T.FirstName LIKE '%${words[0]}%' AND T.LastName LIKE '%${words[1]}%'`;
          } else if (searchterm.includes("@")) {
            return `T.UserName LIKE '%${searchterm}%'`;
          } else {
            return `(T.FirstName LIKE '%${searchterm}%' OR T.LastName LIKE '%${searchterm}%' OR T.UserName LIKE '%${searchterm}%')`;
          }
        }
//INNER JOIN Memberdetails M ON T.userorganizationid IN (SELECT Value FROM dbo.SplitString(M.accessorg, ','))
        // Build the SQL query based on user role (admin or recruiter)
        if (admin) {
          query = `
            SELECT Distinct T.TraineeID, CONCAT(T.firstname, ' ', T.lastname) AS Name, CONCAT(CreatedBy.firstname, ' ', CreatedBy.lastname) AS CreatedBy,      
            T.username AS Email, O.organizationname, T.LegalStatus AS LegalStatus, T.PhoneNumber AS Phone, CS.CSName AS CandidateStatus,
            T.followupon, T.notes, T.CreateTime AS DateCreated
            FROM Trainee T
            INNER JOIN Memberdetails M ON T.userorganizationid IN (SELECT Value FROM dbo.SplitString(M.accessorg, ','))
            INNER JOIN Currentstatus CS ON T.CandidateStatus = CS.CSID
            LEFT JOIN Memberdetails CreatedBy ON T.createby = CreatedBy.useremail
            INNER JOIN Organization O ON T.userorganizationid = O.organizationid
            WHERE M.useremail = '${useremail}' AND T.active = 1 AND ${generateSearchCondition(searchterm)}
            ORDER BY T.CreateTime DESC
            OFFSET ${Page} ROWS FETCH NEXT 25 ROWS ONLY`;
        } else {
          query = `
            SELECT Distinct T.TraineeID, CONCAT(CreatedBy.FirstName, ' ', CreatedBy.LastName) AS CreatedBy, CONCAT(T.FirstName, ' ', T.LastName) AS Name, T.UserName AS Email, T.PhoneNumber AS Phone, T.LegalStatus AS LegalStatus, CS.CSName AS CandidateStatus, T.CreateTime AS DateCreated, T.followupon, T.notes, O.organizationname
            FROM Trainee T
            INNER JOIN Currentstatus CS ON T.CandidateStatus = CS.CSID
            LEFT JOIN Memberdetails CreatedBy ON T.CreateBy = CreatedBy.Useremail
            LEFT JOIN organization O ON T.userorganizationid = O.organizationid
            WHERE T.RecruiterName = '${traineeid}' AND ${generateSearchCondition(searchterm)}
            ORDER BY T.CreateTime DESC
            OFFSET '${Page}' ROWS FETCH NEXT 25 ROWS ONLY`;
        }

        console.log(query);

        const recordset = await request.query(query);

        if (recordset && recordset.recordsets && recordset.recordsets.length > 0) {
          const result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          resolve(result);
        } else {
          const result = {
            flag: 0,
            error: "No active candidates found!",
          };
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });

    // Wait for either the database query to complete or the timeout to occur
    const result = await Promise.race([databasePromise, timeoutPromise]);

    res.send(result);
  } catch (error) {
    console.error("Error fetching candidates data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching candidates data!",
    };
    res.status(500).send(result);
  }
});

router.post("/updatehrmscandidate", async (req, res) => {});

router.post("/addHrmsCandidate", async (req, res) => {
  console.log(req);
});

router.post("/saveSubmissionFormData", async (req, res) => {
  console.log(req);
});

router.post("/saveInterviewFormData", async (req, res) => {
  console.log(req);
});

router.post("/saveGeneralFormData", async (req, res) => {
  console.log(req);
});

router.post("/saveFinancialInfoFormData", async (req, res) => {
  console.log(req);
});

async function deactivatecandidate(TraineeID) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const queryResult = await request.query(
      `update Trainee set active = 0 where TraineeID = '${TraineeID}'`
    );

    if (queryResult.rowsAffected[0] === 0) {
      throw new Error("No records found!");
    }

    return queryResult;
  } catch (error) {
    console.error("Error while deleting candidate:", error);
    throw error;
  }
}

router.post("/getInterviewList", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    // const traineeID = '20742';
    const traineeID = req.body.TraineeID;

    const query =
      "SELECT CONVERT(NVARCHAR, TI.InterviewDate, 101) AS Date, CONCAT(T1.FirstName, ' ', T1.LastName) AS Marketer, ISNULL(TI.Assistedby, '') AS Assigned,TI.TraineeInterviewID, TI.InterviewMode, ISNULL(TI.Notes, '') AS Notes, ISNULL(TI.ClientName, '') AS Client, ISNULL(TI.VendorName, '') AS Vendor, ISNULL(TI.SubVendor, '') AS SubVendor, ISNULL(TI.TypeofAssistance, '') AS TypeofAssistance,TI.CreateTime FROM TraineeInterview TI LEFT JOIN Trainee T1 ON T1.TraineeID = TI.RecruiterID WHERE TI.active = 1 AND TI.TraineeID = " +
      traineeID +
      " ORDER BY TI.CreateTime DESC;";

    console.log(query);
    const result = await pool.request().query(query);

    res.json({
      flag: 1,
      result: result.recordset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred." });
  }
});

router.post("/insertTraineeInterview", async function (req, res) {
  try {
    var TraineeInterviewID = await generateTraineeInterviewID();

    var interviewQuery =
      "IF NOT EXISTS(SELECT * FROM TraineeInterview WHERE TraineeInterviewID = '" +
      TraineeInterviewID +
      "') " +
      "BEGIN " +
      "INSERT INTO [dbo].[TraineeInterview] " +
      "([TraineeInterviewID], [TraineeID], [RecruiterID], [InterviewDate], [InterviewTimeZone], " +
      "[InterviewMode], [InterviewStatus], [Notes], [Rating], [Active], [CreateTime], " +
      "[CreateBy], [LastUpdateTime], [LastUpdateBy], [IsTraineeUpdate], [JobID], " +
      "[InterviewStatusUpdateTime], [InviteEmail], [SubVendor], [Assistedby], [TypeofAssistance], " +
      "[VendorName], [ClientName]) " +
      "VALUES " +
      "('" +
      TraineeInterviewID +
      "', " +
      formatValue(req.body.traineeID) +
      ", " +
      formatValue(req.body.recruiterID) +
      ", " +
      formatValue(req.body.interviewDate) +
      ", " +
      formatValue(req.body.interviewTimeZone) +
      ", " +
      formatValue(req.body.interviewMode) +
      ", " +
      formatValue(req.body.InterviewStatus) +
      ", " +
      formatValue(req.body.interviewInfo) +
      ", " +
      "'', " +
      "1, " +
      "GETDATE(), " +
      formatValue(req.body.recruiteremail) +
      ", " +
      "GETDATE(), " +
      formatValue(req.body.recruiteremail) +
      ", " +
      "'', " +
      "'', " +
      "GETDATE(), " +
      "'', " +
      formatValue(req.body.subVendor) +
      ", " +
      formatValue(req.body.assistedBy) +
      ", " +
      formatValue(req.body.typeOfAssistance) +
      ", " +
      formatValue(req.body.vendor) +
      ", " +
      formatValue(req.body.client) +
      ") END";

    console.log(interviewQuery);

    // Perform the database insertion using the constructed query
    // await sql.connect(config);
    // var request = new sql.Request();
    // var result = await request.query(interviewQuery);

    await sql.connect(config);
    var request = new sql.Request();
    var result = await request.query(interviewQuery);

    const data = {
      flag: 1,
      message: "Trainee Interview Data Fetched",
    };

    res.send(data);
  } catch (error) {
    const data = {
      flag: 1,
      message: "Internal Server Error",
    };
    res.status(500).send(data);
  }
});

async function generateTraineeInterviewID() {
  try {
    await sql.connect(config);
    var request = new sql.Request();

    var query =
      "SELECT TOP 1 TraineeInterviewID FROM TraineeInterview ORDER BY TraineeInterviewID DESC";

    var recordset = await request.query(query);

    if (recordset.recordset.length > 0) {
      return recordset.recordset[0].TraineeInterviewID + 1;
    } else {
      return 1;
    }
  } catch (error) {
    console.error("Error generating TraineeInterviewID:", error);
    throw error;
  }
}

router.post("/insertTraineeCandidate", async function (req, res) {
  try {
    var TraineeID = await generateTraineeID();

    var query =
      "IF NOT EXISTS(SELECT * FROM Trainee WHERE UserName = '" +
      req.body.email +
      "' AND UserOrganizationID = '" +
      req.body.orgID +
      "') " +
      "BEGIN " +
      "INSERT INTO Trainee (TraineeID, username, firstName, phonenumber, middleName, lastName, legalStatus, candidateStatus, gender, notes, recruiterName, ReferredBy_external, locationConstraint, marketerName,Active,Accountstatus,profilestatus,role,createtime,userorganizationid,createby,FollowUpon, CurrentLocation ) " +
      "VALUES (" +
      `'${TraineeID}',` +
      ` ${formatValue(req.body.email || "")},` +
      ` ${formatValue(req.body.firstName || "")},` +
      ` ${formatValue(req.body.phone || "")},` +
      ` ${formatValue(req.body.middleName || "")},` +
      ` ${formatValue(req.body.lastName || "")},` +
      ` ${formatValue(req.body.LegalStatus || "")},` +
      ` ${formatValue(req.body.candidateStatus || "")},` +
      ` ${formatValue(req.body.gender || "")},` +
      ` ${formatValue(req.body.notes || "")},` +
      ` ${formatValue(req.body.recruiterName || "")},` +
      ` ${formatValue(req.body.referralType || "")},` +
      ` ${formatValue(req.body.locationConstraint || "")},` +
      ` ${formatValue(req.body.marketerName || "")},` +
      " 1," +
      " 'ACTIVE'," +
      " 'READY'," +
      " 'TRESUMEUSER', " +
      " GETDATE(), " +
      ` ${formatValue(req.body.orgID || "")},` +
      ` ${formatValue(req.body.creeateby || "")},` +
      ` ${formatValue(req.body.followupon || "")},` +
      ` ${formatValue(req.body.currentLocation || "")}` +
      ") END";

    console.log(query);

    await sql.connect(config);
    var request = new sql.Request();
    var result = await request.query(query);

    //   res.status(200).send("Data Fetched");
    // } catch (error) {
    //   console.error("Error:", error);
    //   res.status(500).send("Internal Server Error");
    // }
    const data = {
      flag: 1,
      message: "Trainee Candidate Data Fetched",
    };

    res.send(data);
  } catch (error) {
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

router.post("/deleteinterviewdata", async (req, res) => {
  try {
    const interviewdata = await deactivateinterviewdata(
      req.body.TraineeInterviewID
    );
    if (interviewdata) {
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
    console.error("Error deleting interviewdata:", error);
    const result = {
      flag: 0,
      error: "An error occurred while deleting the interviewdata!",
    };
    res.status(500).send(result);
  }
});

async function deactivateinterviewdata(TraineeInterviewID) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const queryResult = await request.query(
      "UPDATE TraineeInterview SET Active = 0 WHERE TraineeInterviewID = " +
        TraineeInterviewID
    );

    if (queryResult.rowsAffected[0] === 0) {
      throw new Error("No records found!");
    }

    return true;
  } catch (error) {
    console.error("Error while deleting interviewdata:", error);
    throw error;
  }
}

// Placement - Table - List

router.post("/getPlacementList", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const traineeID = req.body.TraineeID;

    const query = `
    SELECT
    P.PID,
    ISNULL(P.Notes, '') AS Notes,
    ISNULL(P.CurrentPlacement, '1') AS CurrentPlacement,
    ISNULL(P.BillRate, '') AS BillRate,
    ISNULL(P.BillType, '') AS BillType,
    CONCAT(T.FirstName, ' ', T.LastName) AS MarketerFirstName,
    ISNULL(P.ClientState, '') AS ClientState,
    ISNULL(CONVERT(NVARCHAR(10), P.StartDate, 101), '') AS StartDate1,
    ISNULL(CONVERT(NVARCHAR(10), P.EndDate, 101), '') AS EndDate1,
    ISNULL(CONVERT(NVARCHAR(10), P.PlacedDate, 101), '') AS PlacedDate,
    ISNULL(P.PositionTitle, '') AS PositionTitle,
    ISNULL(P.CandidateEmailId, '') AS CandidateEmailId,
    ISNULL(P.ClientName, '') AS ClientName,
    ISNULL(CONVERT(NVARCHAR(10), P.POStartDate, 101), '') AS POStartDate,
    ISNULL(CONVERT(NVARCHAR(10), P.POEndDate, 101), '') AS POEndDate,
    ISNULL(P.ClientManagerName, '') AS ClientManagerName,
    ISNULL(P.ClientEmail, '') AS ClientEmail,
    ISNULL(P.ClientPhoneNumber, '') AS ClientPhoneNumber,
    ISNULL(P.ClientAddress, '') AS ClientAddress,
    ISNULL(P.VendorName, '') AS VendorName,
    ISNULL(P.VendorContactName, '') AS VendorContactName,
    ISNULL(P.VendorEmail, '') AS VendorEmail,
    ISNULL(P.VendorPhone, '') AS VendorPhone,
    ISNULL(P.VendorAddress, '') AS VendorAddress,
    ISNULL(P.SubVendorName, '') AS SubVendorName,
    ISNULL(P.SubVendorContactName, '') AS SubVendorContactName,
    ISNULL(P.SubVendorEmail, '') AS SubVendorEmail,
    ISNULL(P.SubVendorPhone, '') AS SubVendorPhone,
    ISNULL(P.SubVendorAddress, '') AS SubVendorAddress,
    CONCAT(T.FirstName, ' ', T.LastName) AS Name,
    P.PrimaryPlacement,
    P.CreatedTime
FROM
    Placements P
LEFT JOIN
    Trainee T ON T.TraineeID = P.MarketerName
LEFT JOIN
    Currentstatus cs ON cs.CsID = T.CandidateStatus
WHERE
    P.TraineeID = '${traineeID}' AND P.Active = 1
ORDER BY
    P.StartDate DESC
    `;

    const result = await pool.request().query(query);
    res.json({
      flag: 1,
      result: result.recordset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred." });
  }
});

router.post("/deleteplacementdata", async (req, res) => {
  try {
    const placementdata = await deactivateplacementdata(req.body.PID);
    console.log(placementdata);
    if (placementdata) {
      const result = {
        flag: 1,
      };
      res.send(result);
    } else {
      const result = {
        flag: 1,
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error deleting Placementdata:", error);
    const result = {
      flag: 0,
      error: "An error occurred while deleting the Placementdata!",
    };
    res.status(500).send(result);
  }
});

async function deactivateplacementdata(PID) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    var query = "UPDATE Placements SET Active = 0 WHERE PID =" + PID;
    const queryResult = await request.query(query, {});

    if (queryResult.rowsAffected[0] === 0) {
      throw new Error("No records found!");
    }

    return queryResult;
  } catch (error) {
    console.error("Error while deactivating PlacementData:", error);
    throw error;
  }
}

router.post("/deleteinterviewdata", async (req, res) => {
  try {
    const interviewdata = await deactivateinterviewdata(
      req.body.TraineeInterviewID
    );
    if (interviewdata) {
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
    console.error("Error deleting interviewdata:", error);
    const result = {
      flag: 0,
      error: "An error occurred while deleting the interviewdata!",
    };
    res.status(500).send(result);
  }
});

//SUBMISSION DELETE

router.post("/deletesubmissiondata", async (req, res) => {
  try {
    const submissiondata = await deactivatesubmissiondata(
      req.body.submissionid
    );
    if (submissiondata) {
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
    console.error("Error deleting submissiondata:", error);
    const result = {
      flag: 0,
      error: "An error occurred while deleting the submissiondata!",
    };
    res.status(500).send(result);
  }
});

async function deactivatesubmissiondata(submissionid) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    var query =
      "UPDATE Submission set Active = 0 where submissionid =" + submissionid;
    console.log(query);
    const queryResult = await request.query(query);

    if (queryResult.rowsAffected[0] === 0) {
      throw new Error("No records found!");
    }

    return queryResult;
  } catch (error) {
    console.error("Error while deleting submissiondata:", error);
    throw error;
  }
}

router.post("/getCandidateInfo", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = new sql.Request();
    const query =
      "select t.FTCNotes,t.FirstName ,t.LastName ,t.MiddleName,CONVERT(NVARCHAR(10),t.DOB,101) AS DOB,T.PhoneNumber,(t.FirstName + ' '+t.LastName) as Name,t.UserName,Cs.CSName,T.Candidatestatus,d.Value,t.division,t.SSn,T.RecruiterName,t.marketername,T.ReferredBy,T.DealOffered,t.DuiFelonyInfo,T.EmergConName,t.EmergConPhone,t.EmergConemail,t.ReferredBy_external,t.PassportNumber,t.Address,t.addressline2,t.validateNumber, CONVERT(NVARCHAR(10),t.statusdate,101) AS statusdate,CONVERT(NVARCHAR(10),t.LegalStatusValidFrom,101) AS Legalstartdate, CONVERT(NVARCHAR(10),t.LegalStatusValidTo,101) AS Legalenddate,CONVERT(NVARCHAR(10),t.PassValidityEndDate,101) AS Passvalidateenddate,CONVERT(NVARCHAR(10),t.PassvalidityStartDate,101) AS PassvalidateStartdate,CONVERT(NVARCHAR(10),t.validateEnddate,101) AS ValidateEndDate,CONVERT(NVARCHAR(10),t.EmploymentStartDate,101) AS EmploymentStartDate,CONVERT(NVARCHAR(10),t.EmploymentEndDate,101) AS EmploymentEndDate,t.Title,t.Skill,t.Country,t.state,t.City,t.Zipcode,t.AddressType,t.Notes,t.LegalStatus,  t.FinancialNotes,t.Salary,t.State,t.Perdeium,t.MaritalStatus,t.LCARate,t.FState,t.GCWages,t.StateTaxAllowance,t.StateTaxExemptions,t.FederalTaxAllowance,t.HealthInsurance,t.LifeInsurance,t.FederalTaxAdditionalAllowance,t.Bank1Name,t.Bank1AccountType,t.Bank1AccountNumber,t.Bank1RoutingNumber,t.SalaryDepositType,t.HowMuch,t.Bank2Name,t.Bank2AccountType,t.Bank2AccountNumber,t.Bank2RoutingNumber,CONVERT(NVARCHAR(10),t.Lcadate,101) AS Lcadate,CONVERT(NVARCHAR(10),t.Gcdate,101) AS Gcdate from Trainee t LEFT Join Currentstatus cs On cs.CsID=T.Candidatestatus LEFT Join Department d On d.DepartmentID = T.Division   left Join Phone p On p.PhoneID=(select TOP 1 PhoneID from TraineePhone where TraineeID='" +
      req.body.TraineeID +
      "'AND Active = 1) AND p.Active = 1  where TraineeID = '" +
      req.body.TraineeID +
      "' and t.Active=1";

    console.log(query);

    const recordset = await request.query(query);

    // Fetch data from tresume and tresumenodetype tables
    const tresumeQuery = `
      SELECT tn.* 
      FROM tresume tr
      JOIN tresumenode tn ON tn.TresumeID = tr.TresumeID
      WHERE tr.traineeid = '${req.body.TraineeID}' AND tr.active = 1 AND tn.active = 1
    `;
    console.log(tresumeQuery);
    const tresumeRecordset = await request.query(tresumeQuery);

    const result = {
      flag: 1,
      result: recordset.recordsets[0],
      tresumeInfo: tresumeRecordset.recordsets[0],
    };
    res.send(result);
  } catch (error) {
    console.error("Error fetching candidates data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching candidates data!",
    };
    res.status(500).send(result);
  }
});

router.post("/getSubmissionList", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = new sql.Request();
    // const candidateID = '20742';
    const query = `SELECT S.submissionid,S.Title, S.SubmissionDate, CONCAT(MT.FirstName, ' ', MT.LastName) AS MarketerName, S.VendorName, S.ClientName, S.Note, S.Rate, S.CreateBy, S.CreateTime, S.Active, S.TraineeID, S.LastUpdateBy, S.LastUpdateTime
      FROM Submission S
      INNER JOIN Trainee T ON S.TraineeID = T.TraineeID
      Left JOIN Trainee MT ON MT.TraineeID = S.MarkerterID
      WHERE T.TraineeID = ${req.body.TraineeID} AND S.Active = 1`;
    console.log(query);

    const recordset = await request
      .input("candidateID", sql.VarChar, req.body.candidateID)
      .query(query);

    const result = {
      flag: 1,
      result: recordset.recordset,
    };
    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching candidates data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching candidates data!",
    };
    res.status(500).send(result);
  }
});

router.post("/insertSubmissionInfo", async (req, res) => {
  try {
    // const pool = await sql.connect(config);
    // const request = new sql.Request();
    // var SubmissionID = await generateSubmission();
    var query = `
    INSERT INTO Submission (
        Title,
        SubmissionDate,
        MarkerterID,
        VendorName,
        ClientName,
        Note,
        Rate,
        CreateBy,
        CreateTime,
        Active,
        TraineeID,
        LastUpdateBy,
        LastUpdateTime
    ) VALUES (
        '${req.body.title}',
        '${req.body.submissionDate}',
        '${req.body.MarketerID}',
        '${req.body.vendorName}',
        '${req.body.clientName}',
        '${req.body.notes}',
        '${req.body.rate}',
        '${req.body.recruiteremail}',
        CURRENT_TIMESTAMP, 
        1,
        ${req.body.CandidateID},
        '${req.body.recruiteremail}',
        CURRENT_TIMESTAMP 
    );
`;
    console.log(query);
    // res.send("Data Fetched");

    // Execute the SQL query
    const pool = await sql.connect(config);
    const request = new sql.Request(pool);
    const recordset = await request.query(query);

    const result = {
      flag: 1,
      message: "Submission data inserted successfully!",
    };
    res.status(200).json(result);
  } catch (error) {
    console.error("Error inserting submission data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while inserting submission data!",
    };
    res.status(500).json(result);
  }
});

async function generateSubmission() {
  try {
    const pool = await sql.connect(config);
    var request = new sql.Request(pool);

    var query =
      "SELECT TOP 1 SubmissionID FROM Submission ORDER BY SubmissionID DESC";

    var recordset = await request.query(query);

    if (recordset.recordset.length > 0) {
      return recordset.recordset[0].SubmissionID + 1;
    } else {
      return 1;
    }
  } catch (error) {
    console.error("Error generating SubmissionID:", error);
    throw error;
  }
}

// router.post('/DownloadSubmission', async (req, res) => {
//   try {
//     const pool = await sql.connect(config);
//     const request = new sql.Request();
//     const query = `SELECT
//                       S.submissionid,
//                       S.Title,
//                       S.SubmissionDate,
//                       CONCAT(T.FirstName, ' ', T.LastName) AS MarketerName,
//                       S.VendorName,
//                       S.ClientName,
//                       S.Note,
//                       S.Rate,
//                       S.CreateBy,
//                       S.CreateTime,
//                       S.Active,
//                       S.CandidateID,
//                       S.LastUpdateBy,
//                       S.LastUpdateTime
//                   FROM
//                       Submission S
//                   INNER JOIN
//                       Trainee T ON S.CandidateID = T.TraineeID
//                   WHERE
//                       T.TraineeID = ${req.body.TraineeID} AND S.Active = 1`;

//     console.log(query);

//     const recordset = await request.query(query);

//     const result = {
//       flag: 1,
//       result: recordset.recordset,
//     };
//     res.status(200).send(result);

//   } catch (error) {
//     console.error("Error fetching candidates data:", error);
//     const result = {
//       flag: 0,
//       error: "An error occurred while fetching candidates data!",
//     };
//     res.status(500).send(result);
//   }
// });

router.get("/downloadcandidatesubmission", async (req, res) => {
  console.log("Received request to /downloadcandidatesubmission");
  console.log("TraineeID:", req.query.TraineeID);

  const pool = await sql.connect(config);
  const request = new sql.Request();

  try {
    var query = `
      SELECT 
        S.submissionid,
        S.Title,
        S.SubmissionDate,
        CONCAT(T.FirstName, ' ', T.LastName) AS MarketerName,
        S.VendorName,
        S.ClientName,
        S.Note,
        S.Rate,
        S.CreateBy,
        S.CreateTime,
        S.Active,
        S.TraineeID,
        S.LastUpdateBy,
        S.LastUpdateTime
      FROM 
        Submission S
      INNER JOIN 
        Trainee T ON S.TraineeID = T.TraineeID
      WHERE 
        T.TraineeID = ${req.query.TraineeID} AND S.Active = 1
    `;

    const recordset = await request.query(query);
    var data = recordset.recordset;
    console.log(data);

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Submissions");

    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=submissions.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/downloadcandidatePlacement", async (req, res) => {
  console.log("Received request to /downloadcandidatePlacement");
  console.log("TraineeID:", req.query.TraineeID);

  const pool = await sql.connect(config);
  const request = new sql.Request();

  try {
    var query = `
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
      TI.Active = 1 AND TI.TraineeID = ${req.query.TraineeID}
    `;

    const recordset = await request.query(query);
    var data = recordset.recordset;
    console.log(data);

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Placement");

    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=Placement.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/downloadcandidateInterview", async (req, res) => {
  console.log("Received request to /downloadcandidateInterview");
  console.log("TraineeID:", req.query.TraineeID);

  const pool = await sql.connect(config);
  const request = new sql.Request();

  try {
    var query = `
      SELECT 
        CONVERT(NVARCHAR, TI.InterviewDate, 101) AS Date,
        CONCAT(T1.FirstName, ' ', T1.LastName) AS Marketer,
        ISNULL(TI.Assistedby, '') AS Assigned,
        TI.TraineeInterviewID,
        TI.InterviewMode,
        ISNULL(TI.Notes, '') AS Notes,
        ISNULL(TI.ClientName, '') AS Client,
        ISNULL(TI.VendorName, '') AS Vendor,
        ISNULL(TI.SubVendor, '') AS SubVendor,
        ISNULL(TI.TypeofAssistance, '') AS TypeofAssistance,
        TI.TraineeID
      FROM 
        TraineeInterview TI
      LEFT JOIN 
        Trainee T1 ON T1.TraineeID = TI.RecruiterID
      WHERE 
        TI.Active = 1 AND TI.TraineeID = ${req.query.TraineeID}
    `;

    const recordset = await request.query(query);
    var data = recordset.recordset;

    if (data.length > 0) {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet("Interview");

      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      data.forEach((row) => {
        worksheet.addRow(Object.values(row));
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Interview.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      console.log("No data found");
      res.status(404).send("No data found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/updateFinancial", async function (req, res) {
  try {
    //   var updateQuery = "UPDATE Trainee SET " +
    // "ReferredBy = " + formatValue(req.body.ReferredBy) +
    // ", DealOffered = " + formatValue(req.body.DealOffered) +
    // ", division = " + formatValue(req.body.division) +
    // ", dob = " + formatValue(req.body.dob) +
    // ", duiFelonyInfo = " + formatValue(req.body.duiFelonyInfo) +
    // ", firstName = " + formatValue(req.body.firstName) +
    // ", ftcNotes = " + formatValue(req.body.ftcNotes) +
    // ", generalEmail = " + formatValue(req.body.generalEmail) +
    // ", lastName = " + formatValue(req.body.lastName) +
    // ", legalStatusVal = " + formatValue(req.body.legalStatusVal) +
    // ", legalStatusValend = " + formatValue(req.body.legalStatusValend) +
    // ", middleName = " + formatValue(req.body.middleName) +
    // ", otherNotes = " + formatValue(req.body.otherNotes) +
    // ", phoneNumberG = " + formatValue(req.body.phoneNumberG) +
    // ", recruiterName = " + formatValue(req.body.recruiterName) +
    // ", refered = " + formatValue(req.body.refered) +
    // ", selectedLegalStatus = " + formatValue(req.body.selectedLegalStatus) +
    // ", statusDate = " + formatValue(req.body.statusDate) +
    // " WHERE TraineeID = " + formatValue(req.body.TraineeID);

    var query =
      "UPDATE Trainee SET " +
      "FinancialNotes = '" +
      req.body.FinancialNotes +
      "', Salary = '" +
      req.body.Salary +
      "', Perdeium = '" +
      req.body.Perdeium +
      "', LegalStatus = '" +
      req.body.selectedLegalStatus +
      "', MaritalStatus = '" +
      req.body.MaritalStatus +
      "', StateTaxAllowance = '" +
      req.body.StateTaxAllowance +
      "', StateTaxExemptions = '" +
      req.body.StateTaxExemptions +
      "', FederalTaxAllowance = '" +
      req.body.FederalTaxAllowance +
      "', FederalTaxAdditionalAllowance = '" +
      req.body.FederalTaxAdditionalAllowance +
      "', LCARate = '" +
      req.body.LCARate +
      "', Lcadate = '" +
      req.body.Lcadate +
      "', GCWages = '" +
      req.body.GCWages +
      "', Gcdate = '" +
      req.body.Gcdate +
      "', state = '" +
      req.body.state +
      "', Bank1Name = '" +
      req.body.Bank1Name +
      "', Bank2Name = '" +
      req.body.Bank2Name +
      "', Bank1AccountType = '" +
      req.body.Bank1AccountType +
      "', Bank2AccountType = '" +
      req.body.Bank2AccountType +
      "', Bank1AccountNumber = '" +
      req.body.Bank1AccountNumber +
      "', Bank2AccountNumber = '" +
      req.body.Bank2AccountNumber +
      "', Bank1RoutingNumber = '" +
      req.body.Bank1RoutingNumber +
      "', Bank2RoutingNumber = '" +
      req.body.Bank2RoutingNumber +
      "', SalaryDepositType = '" +
      req.body.SalaryDepositType +
      "', HowMuch = '" +
      req.body.HowMuch +
      "' WHERE TraineeID = " +
      formatValue(req.body.TraineeID);

    console.log(query);

    // Uncomment the following lines when you are ready to execute the query
    await sql.connect(config);
    var request = new sql.Request();
    var result = await request.query(query);

    const data = {
      flag: 1,
      message: "Data Updated",
    };

    res.send(data);
  } catch (error) {
    const data = {
      flag: 1,
      message: "Internal Server Error",
    };
    res.status(500).send(data);
  }
});
router.post("/updateGeneral", async function (req, res) {
  try {
    var query =
      "UPDATE Trainee SET " +
      "  ReferredBy = " +
      formatValue(req.body.ReferredBy) +
      ", DealOffered = " +
      formatValue(req.body.DealOffered) +
      ", Division = " +
      formatValue(req.body.division) +
      ", DOB = " +
      formatValue(req.body.dob) +
      ", DuiFelonyInfo = " +
      formatValue(req.body.duiFelonyInfo) +
      ", FirstName = " +
      formatValue(req.body.firstName) +
      ", FTCNotes = " +
      formatValue(req.body.ftcNotes) +
      ", UserName = " +
      formatValue(req.body.generalEmail) +
      ", LastName = " +
      formatValue(req.body.lastName) +
      ", LegalStatusValidFrom = " +
      formatValue(req.body.legalStatusVal) +
      ", LegalStatusValidTo = " +
      formatValue(req.body.legalStatusValend) +
      ", MiddleName = " +
      formatValue(req.body.middleName) +
      ", Notes = " +
      formatValue(req.body.otherNotes) +
      ", PhoneNumber = " +
      formatValue(req.body.phoneNumberG) +
      ", RecruiterName = " +
      formatValue(req.body.recruiterName) +
      ", ReferredBy_external = " +
      formatValue(req.body.ReferredBy_external) +
      ", LegalStatus = " +
      formatValue(req.body.selectedLegalStatus) +
      ", statusdate = " +
      formatValue(req.body.statusDate) +
      ", EmergConName = " +
      formatValue(req.body.EmergencyCname) +
      ", EmergConPhone = " +
      formatValue(req.body.EmergencyPhone) +
      ", EmergConemail = " +
      formatValue(req.body.EmergencyEmail) +
      ", PassportNumber = " +
      formatValue(req.body.PassportNumber) +
      ", Address = " +
      formatValue(req.body.AddressLine1) +
      ", addressline2 = " +
      formatValue(req.body.AddressLine2) +
      ", country = " +
      formatValue(req.body.Country) +
      ", state = " +
      formatValue(req.body.State) +
      ", City = " +
      formatValue(req.body.City) +
      ", Zipcode = " +
      formatValue(req.body.Zipcode) +
      ", SSn = " +
      formatValue(req.body.ssn) +
      ", AddressType = " +
      formatValue(req.body.AddressType) +
      ", Candidatestatus = " +
      formatValue(req.body.selectedcurrentstatus) +
      " WHERE " +
      "  TraineeID = " +
      formatValue(req.body.TraineeID);

    console.log(query);

    await sql.connect(config);
    var request = new sql.Request();
    var result = await request.query(query);

    const data = {
      flag: 1,
      message: "Data Updated",
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

router.post("/updateTrainee", async function (req, res) {
  try {
    var query =
      "UPDATE Trainee SET " +
      "  ReferredBy = " +
      formatValue(req.body.ReferredBy) +
      ", assistedBy = " +
      formatValue(req.body.assistedBy) +
      ", division = " +
      formatValue(req.body.division) +
      ", dob = " +
      formatValue(req.body.dob) +
      ", duiFelonyInfo = " +
      formatValue(req.body.duiFelonyInfo) +
      ", firstName = " +
      formatValue(req.body.firstName) +
      ", ftcNotes = " +
      formatValue(req.body.ftcNotes) +
      ", generalEmail = " +
      formatValue(req.body.generalEmail) +
      ", lastName = " +
      formatValue(req.body.lastName) +
      ", legalStatusVal = " +
      formatValue(req.body.legalStatusVal) +
      ", legalStatusValend = " +
      formatValue(req.body.legalStatusValend) +
      ", middleName = " +
      formatValue(req.body.middleName) +
      ", otherNotes = " +
      formatValue(req.body.otherNotes) +
      ", phoneNumberG = " +
      formatValue(req.body.phoneNumberG) +
      ", recruiterName = " +
      formatValue(req.body.recruiterName) +
      ", refered = " +
      formatValue(req.body.refered) +
      ", selectedLegalStatus = " +
      formatValue(req.body.selectedLegalStatus) +
      ", statusDate = " +
      formatValue(req.body.statusDate) +
      " WHERE TraineeID = " +
      formatValue(req.body.TraineeID);

    console.log(query);

    // Uncomment the following lines when you are ready to execute the query
    // await sql.connect(config);
    // var request = new sql.Request();
    // var result = await request.query(query);

    res.status(200).send("Data Updated");
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

// Endpoint to check if email exists
router.post("/checkEmail", async function (req, res) {
  const email = req.body.email;
  const orgID = req.body.orgID;

  try {
    await sql.connect(config);
    const result =
      await sql.query`SELECT * FROM Trainee WHERE Active = 1 AND userOrganizationID =${orgID}  AND userName = ${email}`;

    if (result.recordset.length > 0) {
      const data = {
        flag: 2,
        message:
          "The candidate is already under " + result.recordset[0].CreateBy,
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
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await sql.close();
  }
});

// Email Tracker Trail

// Function to send email
// async function sendEmail(attachment,type) {
//   const transporter = nodemailer.createTransport({
//       port: 465,
//       host: "smtp.mail.yahoo.com",
//       auth: {
//         user: "support@tresume.us",
//         pass: "xzkmvglehwxeqrpd",
//       },
//       secure: true,
//     });

// const today = new Date();
// const month = String(today.getMonth() + 1).padStart(2, '0');
// const day = String(today.getDate()).padStart(2, '0');
// const year = today.getFullYear();

// const formattedDate = `${month}/${day}/${year}`;

// if(type == 1){
// var subject = 'DSR Report for '+formattedDate
// var text = 'Please find the attached DSR report for '+formattedDate
// var filename = 'DSRreport.xlsx';
// }
// if(type == 2){
//   var subject = 'Last Week Interview Report'
//   var text = 'Please find the attached Interview report for last week'
//   var filename = 'Interview.xlsx'
// }
// if(type == 3){
//   var subject = 'Last Month Placement Report'
//   var text = 'Please find the attached Placement report for last Month'
//   var filename = 'Placement.xlsx'
// }
// const mailOptions = {
//   from: 'support@tresume.us',
//   to: 'tul@astacrs.com',
//   bcc:'wilson.am@tresume.us',
//   subject: subject,
//   text: text,
//   attachments: [
//     {
//       filename: filename,
//       content: attachment
//     }
//   ]
// };

// try {
//   await transporter.sendMail(mailOptions);
//   console.log('Email sent successfully!');
// } catch (err) {
//   throw new Error(err);
// }
// }

// router.get('/generate-placement-report', async (req, res) => {
//   try {
//     const data = await executePlacementQuery();
//     const excelBuffer = await generateExcel(data);
//     await sendEmail(excelBuffer,3);
//     res.send('Excel report generated and email sent!');
//   } catch (err) {
//     res.status(500).send('Error generating report or sending email.');
//   }
// });

// async function executePlacementQuery() {
//   try {
//     await sql.connect(config);
//     const result = await sql.query(`
//     SELECT
//     TI.TraineeInterviewID,
//     CONCAT(T.FirstName, ' ', T.LastName) AS CandidateName,
//     CONCAT(R.FirstName, ' ', R.LastName) AS Recruiter,
//     TI.InterviewDate,
//     TI.InterviewStatus,
//     TI.Assistedby,
//     TI.TypeofAssistance,
//     TI.VendorName,
//     TI.ClientName,
//     TI.Notes,
//     TI.CreateTime
// FROM
//     TraineeInterview TI
// INNER JOIN
//     Trainee T ON TI.TraineeID = T.TraineeID
// INNER JOIN
//     Trainee R ON TI.RecruiterID = R.TraineeID
// WHERE
//     TI.Active = 1
//     AND TI.InterviewDate >= DATEADD(WEEK, DATEDIFF(WEEK, 0, GETDATE()) - 1, 0)
//     AND TI.InterviewDate < DATEADD(WEEK, DATEDIFF(WEEK, 0, GETDATE()), 0)
//     AND R.OrganizationID = 9
//     `);
//     return result.recordset;
//   } catch (err) {
//     throw new Error(err);
//   }
// }

// async function generatePlacementExcel(data) {
//   const workbook = new exceljs.Workbook();
//   const worksheet = workbook.addWorksheet('Placement Report');

//   const columns = Object.keys(data[0]);
//   worksheet.columns = columns.map(column => ({ header: column, key: column }));

//   data.forEach(row => {
//     worksheet.addRow(row);
//   });

//   const buffer = await workbook.xlsx.writeBuffer();
//   return buffer;
// }

// async function sendPlacementEmail(attachment, userEmail) {
//   const transporter = nodemailer.createTransport({
//     port: 465,
//     host: "smtp.mail.yahoo.com",
//     auth: {
//       user: "support@tresume.us",
//       pass: "xzkmvglehwxeqrpd",
//     },
//     secure: true,
//   });

//   const today = new Date();
//   const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

//   const subject = 'Placement Report for ' + formattedDate;
//   const text = 'Please find the attached Placement report for ' + formattedDate;
//   const filename = 'PlacementReport.xlsx';

//   const mailOptions = {
//     from: 'support@tresume.us',
//     to: userEmail,
//     bcc: 'wilson.am@tresume.us',
//     subject: subject,
//     text: text,
//     attachments: [
//       {
//         filename: filename,
//         content: attachment,
//       },
//     ],
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Placement Email sent successfully!');
//   } catch (err) {
//     throw new Error(err);
//   }
// }

// router.get('/emailplacementtracker', async (req, res) => {
//   try {
//     const placementData = await executePlacementQuery();
//     const placementExcelBuffer = await generatePlacementExcel(placementData);

//     // Get the user email from the request (you need to pass the user email somehow)
//     const userEmail = req.query.email; // Example: req.query.email

//     await sendPlacementEmail(placementExcelBuffer, userEmail);
//     res.send('Placement Excel report generated and email sent!');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error generating Placement report or sending email.');
//   }
// });

// async function executePlacementQuery() {
//   try {
//     await sql.connect(config);
//     const result = await sql.query(`
//       SELECT
//         TI.TraineeInterviewID,
//         CONCAT(T.FirstName, ' ', T.LastName) AS CandidateName,
//         CONCAT(R.FirstName, ' ', R.LastName) AS Recruiter,
//         TI.InterviewDate,
//         TI.InterviewStatus,
//         TI.Assistedby,
//         TI.TypeofAssistance,
//         TI.VendorName,
//         TI.ClientName,
//         TI.Notes,
//         TI.CreateTime
//       FROM
//         TraineeInterview TI
//       INNER JOIN
//         Trainee T ON TI.TraineeID = T.TraineeID
//       INNER JOIN
//         Trainee R ON TI.RecruiterID = R.TraineeID
//       WHERE
//         TI.Active = 1
//         AND TI.InterviewDate >= DATEADD(WEEK, DATEDIFF(WEEK, 0, GETDATE()) - 1, 0)
//         AND TI.InterviewDate < DATEADD(WEEK, DATEDIFF(WEEK, 0, GETDATE()), 0)
//         AND R.OrganizationID = 9
//     `);
//     return result.recordset;
//   } catch (err) {
//     throw new Error(err);
//   }
// }

router.post("/candidatestatus", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query("SELECT * FROM CurrentStatus", function (err, recordset) {
      if (err) console.log(err);
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(recordset.recordsets[0]);
    });
  });
});

router.post("/divisiondropdown", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query("select * from division ", function (err, recordset) {
      if (err) console.log(err);
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(recordset.recordsets[0]);
    });
  });
});

router.post("/getLegalStatus", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);

    var request = new sql.Request();
    request.query(
      "select * from legalstatus where active = 1",
      function (err, recordset) {
        if (err) console.log(err);

        var result = { flag: 1, result: recordset.recordsets[0] };

        res.send(recordset.recordsets[0]);
      }
    );
  });
});

router.post("/fetchrecruiter", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      // "select traineeid,firstname,lastname from trainee where organizationid = "+req.body.orgID+" and active = 1",
      "SELECT DISTINCT traineeid, firstname, lastname FROM trainee WHERE organizationid = " +
        req.body.orgID +
        " AND active = 1 AND role='recruiter' ORDER BY firstname ASC, lastname ASC",

      function (err, recordset) {
        if (err) console.log(err);
        var result = { flag: 1, result: recordset.recordsets[0] };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

router.post("/getLocation", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = new sql.Request();
    // const query = "SELECT DISTINCT state FROM usazipcodenew";
    const query =
      "select distinct state from usazipcodenew order by state asc;";

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
        error: "No Location found! ",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching Location:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching Location!",
    };
    res.status(500).send(result);
  }
});

router.post("/hrmsupdateSelected", async (req, res) => {
  try {
    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect();
    await poolConnect;

    const traineeID = req.body.traineeid;
    const followupon = req.body.followupon;

    const query =
      "UPDATE trainee SET followupon = @followupon WHERE traineeid = @traineeid";

    const request = new sql.Request(pool);
    request.input("followupon", sql.VarChar, followupon);
    request.input("traineeid", sql.Int, traineeID);

    const recordset = await request.query(query);

    if (recordset && recordset.rowsAffected && recordset.rowsAffected[0] > 0) {
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
    console.error("Error updating data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while updating data!",
    };
    res.status(500).send(result);
  }
});

router.post("/MoveToTalentBench", async (req, res) => {
  try {
    await sql.connect(config);

    // Update Trainee table to set TalentPool = 1
    const updateQuery = ` UPDATE Trainee SET TalentPool = 1 WHERE TraineeID = '${req.body.TraineeID}';
      `;

    // Execute the update query
    await sql.query(updateQuery);

    // SQL query to insert data into TalentBench
    const insertQuery = ` INSERT INTO [dbo].[TalentBench] ([TraineeID], [Name], [ReferredBy], [Currency], [BillRate], [PayType], [TaxTerm],  [ConsultantType], [JobTitle], [LocationPreference], [BenchStatus], [Availability],  [txtComments], [Active], [CreateBy], [CreateTime], [GroupID], [IsNew]) VALUES ('${req.body.TraineeID}', '${req.body.Name}', '${req.body.ReferredBy}', '${req.body.Currency}', '${req.body.BillRate}', '${req.body.PayType}', '${req.body.TaxTerm}',  '${req.body.ConsultantType}', '${req.body.JobTitle}', '${req.body.LocationPreference}', '${req.body.BenchStatus}', '${req.body.Availability}',  '${req.body.txtComments}', '1', '${req.body.CreateBy}', GETDATE(), '1', '1');
      `;

    console.log(insertQuery);

    // Execute the insert query
    await sql.query(insertQuery);

    // Close connection
    await sql.close();

    // Send success response
    res.status(200).json({
      success: true,
      message: "Data moved to TalentBench successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while moving data to TalentBench",
    });
  }
});

router.post("/addTresumeNode", async (req, res) => {
  try {
    // Establish a SQL connection
    await sql.connect(config);

    var TresumeID = req.body.TresumeID;
    var TresumeNodeID = await generateTresumeNodeID();
    console.log(TresumeID);

    // Perform the SQL operation
    if (!TresumeID) {
      TresumeID = await generateTresumeID();
      var Tresumeinsertquery = `INSERT INTO [dbo].[Tresume]([TresumeID] ,[TraineeID] ,[Summary] ,[URL] ,[Active] ,[CreateTime] ,[CreateBy] ,[LastUpdateTime] ,[LastUpdateBy] ,[Certified] ,[IsRChilliUsed] ,[IsJsonResume])
VALUES ('${TresumeID}' ,'${req.body.TraineeID}' ,'' ,'' ,1 ,GETDATE() ,'${req.body.username}' ,GETDATE() ,'${req.body.username}' ,'' ,'' ,'')`;
      console.log(TresumeID);
      console.log(Tresumeinsertquery);
      await sql.query(Tresumeinsertquery);
    }

    var query = `INSERT INTO [dbo].[TresumeNode] ([TresumeNodeID] ,[TresumeID] ,[ParentTresumeNodeID] ,[NodeDate] ,[Title] ,[Description] ,[TresumeNodeTypeID] ,[SortOrder] ,[Active] ,[CreateTime] ,[CreateBy] ,[LastUpdateTime] ,[LastUpdateBy] ,[NodeDateTo] ,[Org] ,[Location] ,[Tools] ,[Skill])
         VALUES ('${TresumeNodeID}' ,'${TresumeID}' ,'' ,GETDATE() ,'' ,'' ,'${req.body.type}' ,'' ,1 ,GETDATE() ,'${req.body.username}' ,GETDATE() ,'${req.body.username}' ,GETDATE() ,'' ,'${req.body.Location}' ,'' ,'')`;
    
         console.log(query);
    await sql.query(query);

    await sql.close();
    const result = {
      TresumeID: TresumeID,
      TresumeNodeID: TresumeNodeID,
      flag: 1,
    };
    res.send(result);
  } catch (error) {
    console.error("Error adding TresumeNode:", error);
    res.status(500).send({ error: "Error adding TresumeNode" });
  }
});

async function generateTresumeID() {
  try {
    // Establish a SQL connection
    await sql.connect(config);

    var request = new sql.Request();

    var query = "SELECT TOP 1 TresumeID FROM Tresume ORDER BY TresumeID DESC";

    var recordset = await request.query(query);

    if (recordset.recordset.length > 0) {
      return recordset.recordset[0].TresumeID + 1;
    } else {
      return 1;
    }
  } catch (error) {
    console.error("Error generating TresumeID:", error);
    throw error;
  }
}

async function generateTresumeNodeID() {
  try {
    // Establish a SQL connection
    await sql.connect(config);

    var request = new sql.Request();

    var query =
      "SELECT TOP 1 TresumeNodeID FROM TresumeNode ORDER BY TresumeNodeID DESC";

    var recordset = await request.query(query);

    if (recordset.recordset.length > 0) {
      return recordset.recordset[0].TresumeNodeID + 1;
    } else {
      return 1;
    }
  } catch (error) {
    console.error("Error generating TresumeNodeID:", error);
    throw error;
  }
}

router.post("/UpdateTresumeNode", async (req, res) => {
  try {
    await sql.connect(config);

    // Extract data properties and handle empty strings
    const title = req.body.data.Title ? `'${req.body.data.Title}'` : "NULL";
    const org = req.body.data.Org ? `'${req.body.data.Org}'` : "NULL";
    const nodeDate = req.body.data.NodeDate
      ? `'${req.body.data.NodeDate}'`
      : "NULL";
    const nodeDateTo = req.body.data.NodeDateTo
      ? `'${req.body.data.NodeDateTo}'`
      : "NULL";
    const skill = req.body.data.Skill ? `'${req.body.data.Skill}'` : "NULL";
    const Location = req.body.data.Location ? `'${req.body.data.Location}'` : "NULL";

    var query = `UPDATE TresumeNode 
                 SET Title = ${title}, Org = ${org}, NodeDate = ${nodeDate}, 
                     NodeDateTo = ${nodeDateTo}, Skill = ${skill}, Location = ${Location}
                 WHERE TresumeNodeID = ${req.body.data.TresumeNodeID}`;

    await sql.query(query);
    await sql.close();

    const result = {
      TresumeNodeID: req.body.data.TresumeNodeID,
      flag: 1,
    };
    res.send(result);
  } catch (error) {
    console.error("Error updating TresumeNode:", error);
    res.status(500).send({ error: "Error updating TresumeNode" });
  }
});

router.post("/DeleteTresumeNode", async (req, res) => {
  try {
    await sql.connect(config);
    const query = `DELETE FROM TresumeNode WHERE TresumeNodeID = ${req.body.TresumeNodeID}`;
    await sql.query(query);
    await sql.close();
    const result = {
      TresumeNodeID: req.body.TresumeNodeID,
      flag: 1,
    };
    res.send(result);
  } catch (error) {
    console.error("Error deleting TresumeNode:", error);
    res.status(500).send({ error: "Error deleting TresumeNode" });
  }
});

// Email Tracker - Venkat ( Start )

async function emailPlacementTracker(candidateID, OrgID, placementList, useremails) {
  try {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Placement Data');
    
    const headers = ['Work Start Date', 'Work End Date', 'Position Title', 'Marketer', 'End Client Name', 'Vendor', 'End Client Address'];

    worksheet.addRow(headers);

    placementList.forEach(placement => {
      const rowData = [
        placement.POStartDate,
        placement.POEndDate,
        placement.PositionTitle,
        placement.MarketerFirstName,
        placement.ClientName,
        placement.VendorName,
        placement.ClientAddress
      ];
      worksheet.addRow(rowData);
    });

    const tempFilePath = './placement_data.xlsx';
    await workbook.xlsx.writeFile(tempFilePath);

    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.mail.yahoo.com",
      auth: {
        user: "support@tresume.us",
        pass: "xzkmvglehwxeqrpd",
      },
      secure: true,
    });

    for (const useremail of useremails) {
      const mailOptions = {
        from: 'support@tresume.us',
        to: useremail,
        subject: 'Marketers Placement Tracker',
        html: '<p><em>This is to notify that a candidate has been placed.</em></p>',
        attachments: [
          {
            filename: 'placement_data.xlsx',
            path: tempFilePath
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      console.log(`Placement email sent successfully to ${useremail}.`);
    }

    fs.unlinkSync(tempFilePath);
  } catch (error) {
    console.error("Error while sending placement email:", error);
    throw error;
  }
}

router.post("/Sendplacementmail", async (req, res) => {
  try {
    const { candidateID, OrgID, placementList } = req.body;

    console.log("OrgID:", OrgID);
    var query = "SELECT useremail FROM memberdetails WHERE ',' + accessorg + ',' LIKE '%,"+OrgID+",%' and WFID in (1,4,5,6,7) and active = 1";

    console.log(query);
    const useremailsResult = await pool.query(query);

    console.log("SQL Query Result:", useremailsResult.recordset);

    if (useremailsResult && Array.isArray(useremailsResult.recordset)) {
      if (useremailsResult.recordset.length > 0) {
        const useremails = useremailsResult.recordset.map(result => result.useremail);
        
        await emailPlacementTracker(candidateID, OrgID, placementList, useremails);
        
        res.status(200).json({ success: true, message: 'Placement notification email sent successfully' });
      } else {
        console.error("Error handling placement notification: No matching records found");
        res.status(404).json({ success: false, message: 'No matching records found in the database' });
      }
    } else {
      console.error("Error handling placement notification: Invalid SQL query result");
      res.status(500).json({ success: false, message: 'Invalid SQL query result' });
    }
  } catch (error) {
    console.error("Error handling placement notification:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

async function emailFinancialTracker(candidateID, OrgID, financialData, useremails) { 
  try {
    for (const useremail of useremails) {
      const mailOptions = {
        from: 'support@tresume.us',
        to: useremail,
        subject: 'Financial Tracker',
        html: '<p><em>This is to notify you that the payroll process for the candidate can now commence as their financial details have been securely stored within the HRMS.</em></p>',
        attachments: [{
          filename: 'financial_details.xlsx',
          content: financialData 
        }]
      };

      await transporter.sendMail(mailOptions);
      console.log(`Financial email sent successfully to ${useremail}.`);
    }
  } catch (error) {
    console.error("Error while sending Financial Tracker email:", error);
    throw error;
  }
}

router.post("/insertRecruitmentTracker", async (req, res) => {
  try {
    const { candidateID, OrgID } = req.body;
    const financialData = await generateExcel(req.body);

    console.log("OrgID:", OrgID);
    var query = "SELECT useremail FROM memberdetails WHERE ',' + accessorg + ',' LIKE '%,"+OrgID+",%' and WFID in (1,4,6) and active = 1";
    const useremailsResult = await pool.query(query);

    const useremails = useremailsResult.recordset.map(record => record.useremail);

    console.log("SQL Query Result:", useremailsResult.recordset);
    console.log(query);

    await emailFinancialTracker(candidateID, OrgID, financialData, useremails);

    res.status(200).json({ success: true, message: 'Financial-Data notification email sent successfully' });
  } catch (error) {
    console.error("Error handling Financial notification:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post("/FetchProfileVideo", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) throw err;

      var request = new sql.Request();
      var query = "select profilevideoPath,videouploadDate from trainee where traineeid=" + req.body.traineeid;
      request.query(query, function (err, recordset) {
        if (err) throw err;

        var result = { flag: 1, result: recordset.recordsets[0] };

        res.send(result);
      });
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send({ error: "An error occurred while fetching profile video" });
  }
});



router.post("/ProfileVideoUpload", upload.single('Profilevideo'), async (req, res) => {
  try {
    let filename = '';
    let TraineeID = req.body.traineeid;

    if (req.file) {
      filename = '/Content/ProfileVideo/' + req.file.filename;
    }

    const pool = await sql.connect(config);
    const request = pool.request();
    var query = `update Trainee set profilevideoPath ='${filename}',videouploadDate = GETDATE() where TraineeID = '${TraineeID}'`;
    console.log(query);
    const queryResult = await request.query(query);

    let result = {
      flag: 1,
      message: 'Profile Video Uploaded Successfully',
      filename: filename,
      TraineeID: TraineeID
    }
    res.send(result);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send({ error: "An error occurred while uploading profile video" });
  }
});



async function generateExcel(data) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Financial Details');

  const transposedData = Object.keys(data).map(key => [key, data[key]]);

  transposedData.forEach(row => {
    worksheet.addRow(row);
  });

  return await workbook.xlsx.writeBuffer();
}

function formatValue(value) {
  return typeof value === 'string' ? `'${value}'` : value;
}
// Email Tracker - Venkat ( End )

module.exports = router;
