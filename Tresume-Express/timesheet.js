

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
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

module.exports = router;

// router.post("/getAllTimeList", async (req, res) => {
//   sql.connect(config, function (err) {
//     if (err) console.log(err);
//     var request = new sql.Request();

//     var query =
//       "SELECT t.firstname,t.lastname,TM.fromdate, TM.todate, TM.totalhrs, TM.approvalstatus, TM.comments FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid WHERE T.timesheet_admin ='" + req.body.traineeID + "' ";

//     console.log(query);
//     request.query(query, function (err, recordset) {
//       if (err) console.log(err);

//       var result = {
//         flag: 1,
//         result: recordset.recordsets[0],
//       };

//       res.send(result);
//     });
//   });
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/inetpub/vhosts/tresume.us/httpdocs/Content/Timesheet/');
  },
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueFilename + fileExtension);
  }
});

const upload = multer({ storage: storage });

router.post("/getTimesheetReport", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();
      //     var query = `SELECT 
      //     CONCAT(t.FirstName, ' ', t.LastName) AS TraineeName,
      //     tm.*, -- Selecting all columns from timesheet_master
      //     o.organizationname
      // FROM 
      //     Memberdetails md
      // JOIN 
      //     timesheet_master tm ON md.traineeid = tm.traineeid
      // JOIN 
      //     organization o ON tm.orgid IN (SELECT value FROM STRING_SPLIT(md.accessorg, ','))
      // JOIN 
      //     Trainee t ON tm.traineeid = t.traineeid
      // WHERE 
      //     md.useremail = 'kumarsaravana1821@gmail.com'`;

      var query = '';

      if(req.body.timesheetrole == 2){
        query = `SELECT 
                      t1.*, 
                      CONCAT(t2.FirstName, ' ', t2.LastName) AS TraineeName
                  FROM 
                      timesheet_master AS t1
                  JOIN 
                      Trainee AS t2 ON t1.TraineeID = t2.TraineeID
                  WHERE 
                      t1.orgid = '${req.body.OrgID}' AND t2.timesheet_admin = '${req.body.TraineeID}' AND t1.status IN (1,2,3)`
              if (req.body.candidateid) {
                query += ` AND t1.traineeid = '${req.body.candidateid}'`
              }
              // Check if startdate and enddate are provided
              if (req.body.startdate && req.body.enddate) {
                query += ` AND t1.fromdate BETWEEN '${req.body.startdate}' AND '${req.body.enddate}'`
              }
      } else{
            query = `SELECT 
            t1.*, 
            CONCAT(t2.FirstName, ' ', t2.LastName) AS TraineeName
            FROM 
                timesheet_master AS t1
            JOIN 
                Trainee AS t2 ON t1.TraineeID = t2.TraineeID
            WHERE 
                t1.orgid = '${req.body.OrgID}' AND t1.status IN (1,2,3)`;
        if (req.body.candidateid) {
          query += ` AND t1.traineeid = '${req.body.candidateid}'`;
        }
        // Check if startdate and enddate are provided
        if (req.body.startdate && req.body.enddate) {
          query += ` AND t1.fromdate BETWEEN '${req.body.startdate}' AND '${req.body.enddate}'`;
        }
      }



    
      console.log(query);
      request.query(query, function (err, recordset) {
        if (err) {
          console.log(err);
          throw err;
        }

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      });
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});



router.post("/getPendingTimesheetResult", async (req, res) => {
  try {
    const timesheetrole = parseInt(req.body.timesheetrole);
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();
      if (timesheetrole === 1) {
        var query =
          "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM  INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN  memberdetails MD ON TM.orgid = MD.orgid INNER JOIN timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.status = 1;";
      } else if (timesheetrole === 2) {
        var query =
          "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM  INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN  memberdetails MD ON TM.orgid = MD.orgid INNER JOIN timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.status = 1 AND TM.admin ='"+req.body.admin+"';";
      } else if (timesheetrole === 3) {
        query = "SELECT  TM.id,  CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM  Timesheet_Master TM INNER JOIN  Trainee T ON TM.traineeid = T.traineeid INNER JOIN  Timesheet_Project TP ON TM.projectid = TP.projectid WHERE  T.username = '" + req.body.username + "'  AND TM.status = 1;";
      }
      console.log(query);
      request.query(query, function (err, recordset) {
        if (err) {
          console.log(err);
          throw err;
        }

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      });
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

router.post("/getRejectedTimesheetResult", async (req, res) => {
  try {
    const timesheetrole = parseInt(req.body.timesheetrole);

    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();
      if (timesheetrole === 1) {
        var query =
          "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN memberdetails MD ON TM.orgid = MD.orgid INNER JOIN Timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.status = 2;";
      }else if (timesheetrole === 2) {
        var query =
          "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM  INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN  memberdetails MD ON TM.orgid = MD.orgid INNER JOIN timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.status = 2 AND TM.admin ='"+req.body.admin+"';";
      } else if (timesheetrole === 3) {
        query = "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN Timesheet_Project TP ON TM.projectid = TP.projectid WHERE T.username = '" + req.body.username + "' AND TM.status = 2";
      }

      console.log(query);
      request.query(query, function (err, recordset) {
        if (err) {
          console.log(err);
          throw err;
        }

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      });
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

router.post("/getCompletedTimesheetResult", async (req, res) => {
  try {

    const timesheetrole = parseInt(req.body.timesheetrole);


    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();
      if (timesheetrole === 1) {
        var query =
          "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN memberdetails MD ON TM.orgid = MD.orgid INNER JOIN Timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.status = 3";
      }else if (timesheetrole === 2) {
        var query =
          "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM  INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN  memberdetails MD ON TM.orgid = MD.orgid INNER JOIN timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.status = 3 AND TM.admin ='"+req.body.admin+"';";
      } else if (timesheetrole === 3) {

        query = "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN Timesheet_Project TP ON TM.projectid = TP.projectid WHERE T.username = '" + req.body.username + "' AND TM.status = 3";

      }
      console.log(query);
      request.query(query, function (err, recordset) {
        if (err) {
          console.log(err);
          throw err;
        }

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      });
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

router.post("/getNonBillableTimesheetResult", async (req, res) => {
  try {

    const timesheetrole = parseInt(req.body.timesheetrole);


    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query;
      if (timesheetrole === 1) {
        query = "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN memberdetails MD ON TM.orgid = MD.orgid INNER JOIN Timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.isBillable = 0 AND TM.status IN (1, 2, 3)";
      } else if (timesheetrole === 2) {
        var query =
          "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM  INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN  memberdetails MD ON TM.orgid = MD.orgid INNER JOIN timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.isBillable = 0 AND TM.status IN (1, 2, 3) AND TM.admin ='"+req.body.admin+"';";
      }else if (timesheetrole === 3) {
        query = "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid LEFT JOIN Timesheet_Project TP ON TM.projectid = TP.projectid  WHERE T.username = '" + req.body.username + "' AND TM.isBillable = 0 AND TM.status IN (1, 2, 3)";
      }

      console.log(query);
      request.query(query, async function (err, recordset) {
        if (err) {
          console.log(err);
          throw err;
        }

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      });
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

router.post("/getBillableTimesheetResult", async (req, res) => {
  try {

    const timesheetrole = parseInt(req.body.timesheetrole);


    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query;
      if (timesheetrole === 1) {
        query = "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN memberdetails MD ON TM.orgid = MD.orgid INNER JOIN Timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.isBillable = 1 AND TM.status IN (1, 2, 3)";
      } else if (timesheetrole === 2) {
        var query =
          "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM  INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN  memberdetails MD ON TM.orgid = MD.orgid INNER JOIN timesheet_Project TP ON TM.projectid = TP.projectid WHERE MD.useremail = '" + req.body.username + "' AND TM.isBillable = 1 AND TM.status IN (1, 2, 3) AND TM.admin ='"+req.body.admin+"';";
      }else if (timesheetrole === 3) {
        query = "SELECT TM.id, CONCAT(T.firstname, ' ', T.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details, TP.projectname FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid LEFT JOIN Timesheet_Project TP ON TM.projectid = TP.projectid  WHERE T.username = '" + req.body.username + "' AND TM.isBillable = 1 AND TM.status IN (1, 2, 3)";
      }

      console.log(query);
      request.query(query, async function (err, recordset) {
        if (err) {
          console.log(err);
          throw err;
        }

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      });
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("An error occurred while processing your request.");
  }
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

router.post("/insertTimesheetTraineeCandidate", async function (req, res) {
  try {
    var TraineeID = await generateTraineeID();

    var query =
      "IF NOT EXISTS(SELECT * FROM Trainee WHERE UserName = @username AND UserOrganizationID = @userorganizationid) " +
      "BEGIN " +
      "INSERT INTO Trainee (TraineeID, username, firstName, lastName, phonenumber, Active, createtime, userorganizationid, CreateBy, CurrentLocation, timesheet_role, istimesheet, Title, IsOrganic, AccountStatus, ProfileStatus, isInserted, Role, password) " +
      "VALUES (@TraineeID, @username, @firstName, @lastName, @phonenumber, 1, GETDATE(), @userorganizationid, @createby, @currentLocation, 3, 1, 'RECRUITER', 1, 'ACTIVE', 'READY', 1, 'TRESUMEUSER', '6e061ece3e7b1ec2147b95212b5afa24de00143dc68e1a82631bb2b1883ce0bb') " +
      "END";

    console.log(query);

    await sql.connect(config);
    var request = new sql.Request();
    request.input('TraineeID', TraineeID);
    request.input('username', req.body.email || ""); // Bind username to email from request body
    request.input('firstName', req.body.firstName || "");
    request.input('phonenumber', req.body.phone || "");
    request.input('lastName', req.body.lastName || "");
    request.input('userorganizationid', req.body.orgID || "");
    request.input('createby', req.body.userName || ""); // Bind createby to userName from cookie
    request.input('currentLocation', req.body.currentLocation || "");

    var result = await request.query(query);

    const data = {
      flag: 1,
      message: "Trainee Candidate Data Inserted",
      result:result
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


router.post("/Candidateviewdetails", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query = "SELECT TM.id, TM.lastUpdated_by AS updatedBy, TM.admincomment, TM.billableamt, TM.fromdate, TM.todate, " +
        "CONCAT(T.firstname, ' ', T.lastname) AS Candidate, TM.projectid, TM.day1, TM.day2, TM.day3, TM.day4, " +
        "TM.day5, TM.day6, TM.day7, TM.totalamt, TM.totalhrs, TM.status, TM.details, TM.clientapproved " +
        "FROM Timesheet_Master TM " +
        "INNER JOIN Trainee T ON TM.traineeid = T.traineeid " +
        "WHERE TM.id = '" + req.body.tid + "'";



      console.log(query);
      request.query(query, function (err, recordset) {
        if (err) {
          console.log(err);
          throw err;
        }

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      });
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

// router.post("/createTimesheet", async (req, res) => {
//   const timesheetData = req.body.timesheetData;
//   sql.connect(config, async function (err) {
//     if (err) {
//       console.log(err);
//       return res
//         .status(500)
//         .send({ flag: 0, error: "Database connection error" });
//     }

//     try {
//       const pool = await sql.connect(config);
//       const transaction = new sql.Transaction(pool);
//       await transaction.begin();

//       try {
//         const request = new sql.Request(transaction);

//         for (const data of timesheetData) {
//           request.input("traineeID", sql.VarChar, req.body.traineeID);
//           request.input("project", sql.VarChar, data.project);
//           request.input("fromdate", sql.Date, data.fromdate);
//           request.input("todate", sql.Date, data.todate);
//           request.input("totalhrs", sql.Decimal(18, 2), data.totalhrs);
//           request.input("approvalstatus", sql.VarChar, data.approvalstatus);
//           request.input("comments", sql.VarChar, data.comments);

//           const query = `INSERT INTO Timesheet_Master (traineeid, projectid, fromdate, todate, totalhrs, approvalstatus, comments) VALUES (@traineeID, @project, @fromdate, @todate, @totalhrs, @approvalstatus, @comments)`;

//           await request.query(query);
//         }

//         await transaction.commit();
//         res
//           .status(200)
//           .send({ flag: 1, message: "Timesheet data inserted successfully" });
//       } catch (err) {
//         console.log(err);
//         await transaction.rollback();
//         res
//           .status(500)
//           .send({ flag: 0, error: "Error inserting timesheet data" });
//       }
//     } catch (err) {
//       console.log(err);
//       res.status(500).send({ flag: 0, error: "Database connection error" });
//     }
//   });
// });

router.post("/fetchtimesheetusers", async (req, res) => {
  try {
    const organizationid = req.body.OrgID;
    if (!organizationid) {
      return res.status(400).json({ error: "organizationid is required" });
    }
    await sql.connect(config, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database connection error" });
      }
      const query =
        "SELECT traineeid, firstname, lastname from trainee where active = 1 and role='RECRUITER'and organizationid =" +
        organizationid;
      console.log(query);
      const request = new sql.Request();
      request.query(query, (err, result) => {
        if (err) {
          console.error(err);
          sql.close();
          return res.status(500).json({ error: "Database query error" });
        }
        sql.close();
        console.log(result);
        var result = {
          flag: 1,
          result: result.recordset,
        };
        res.send(result);
      });
    });
  } catch (err) {
    var result = {
      flag: 2,
    };
    res.send(result);
  }
});

router.post("/addtimesheetadmin", async (req, res) => {
  try {
    const traineeid = req.body.TraineeID;

    if (!traineeid) {
      return res.status(400).json({ error: "traineeid is required" });
    }

    await sql.connect(config, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database connection error" });
      }

      const query =
        "UPDATE Trainee SET timesheet_role = 2 WHERE traineeid =" + traineeid;

      console.log(query);
      const request = new sql.Request();
      request.query(query, (err, result) => {
        if (err) {
          console.error(err);
          sql.close();
          return res.status(500).json({ error: "Database query error" });
        }
        sql.close();
        console.log(result);
        var result = {
          flag: 1,
        };

        res.send(result);
      });
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/fetchtimesheetadmins", async (req, res) => {
  try {
    const OrgID = req.body.OrgID;

    if (!OrgID) {
      return res.status(400).json({ error: "organizationid is required" });
    }

    await sql.connect(config, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database connection error" });
      }

      const query =
        "SELECT traineeid, firstname, lastname FROM trainee WHERE organizationid =" +
        OrgID +
        " AND timesheet_role = 2";

      console.log(query);
      const request = new sql.Request();
      // request.input('organizationid', sql.Int, organizationid);
      request.query(query, (err, result) => {
        if (err) {
          console.error(err);
          sql.close();
          return res.status(500).json({ error: "Database query error" });
        }
        sql.close();
        console.log(result);
        var result = {
          flag: 1,
          result: result.recordset,
        };

        res.send(result);
      });
    });
  } catch (err) {
    var result = {
      flag: 2,
    };

    res.send(result);
  }
});

router.post("/deletetimesheetadmin", async (req, res) => {
  try {
    const traineeid = req.body.TraineeID;

    if (!traineeid) {
      return res.status(400).json({ error: "traineeid is required" });
    }

    await sql.connect(config);
    const query =
      "UPDATE Trainee SET timesheet_role = 0 WHERE traineeid =" + traineeid;

    const request = new sql.Request();
    request.input("traineeid", sql.Int, traineeid);
    const result = await request.query(query);

    await sql.close();

    res.json({ message: "Admin role Removed successfully" });
  } catch (err) {
    return next(err);
  }
});

router.post("/fetchtimesheetcandidate", async (req, res) => {
  try {
    const organizationid = req.body.OrgID;

    if (!organizationid) {
      return res.status(400).json({ error: "organizationid is required" });
    }

    await sql.connect(config, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database connection error" });
      }

      const query =
        "SELECT traineeid, firstname, lastname FROM trainee WHERE userorganizationid = " +
        organizationid;

      console.log(query);
      const request = new sql.Request();
      // request.input('organizationid', sql.Int, organizationid);
      request.query(query, (err, result) => {
        if (err) {
          console.error(err);
          sql.close();
          return res.status(500).json({ error: "Database query error" });
        }
        sql.close();
        console.log(result);
        var result = {
          flag: 1,
          result: result.recordset,
        };

        res.send(result);
      });
    });
  } catch (err) {
    var result = {
      flag: 2,
    };

    res.send(result);
  }
});

router.post("/fetchtimesheetallcandidate", async (req, res) => {
  try {
    const organizationid = req.body.OrgID;

    if (!organizationid) {
      return res.status(400).json({ error: "organizationid is required" });
    }

    await sql.connect(config, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database connection error" });
      }

      const query =
        "SELECT t.traineeid, t.firstname AS TraineeFirstName, t.lastname AS TraineeLastName,ta.firstname AS AdminFirstName,ta.lastname AS AdminLastName,tp.projectname FROM  trainee t JOIN  timesheet_project tp ON t.timesheetproject = tp.projectid LEFT JOIN trainee ta ON t.timesheet_admin = ta.traineeid WHERE t.collab=1 and t.userorganizationid = " + organizationid;

      console.log(query);
      const request = new sql.Request();
      // request.input('organizationid', sql.Int, organizationid);
      request.query(query, (err, result) => {
        if (err) {
          console.error(err);
          sql.close();
          return res.status(500).json({ error: "Database query error" });
        }
        sql.close();
        console.log(result);
        var result = {
          flag: 1,
          result: result.recordset,
        };

        res.send(result);
      });
    });
  } catch (err) {
    var result = {
      flag: 2,
    };

    res.send(result);
  }
});

router.post("/fetchtimesheetprojects", async (req, res) => {
  try {
    const organizationid = req.body.OrgID;

    if (!organizationid) {
      return res.status(400).json({ error: "organizationid is required" });
    }

    await sql.connect(config, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database connection error" });
      }

      const query =
        "SELECT * FROM timesheet_project WHERE status=1 AND orgid = " +
        organizationid;

      console.log(query);
      const request = new sql.Request();
      // request.input('organizationid', sql.Int, organizationid);
      request.query(query, (err, result) => {
        if (err) {
          console.error(err);
          sql.close();
          return res.status(500).json({ error: "Database query error" });
        }
        sql.close();
        console.log(result);
        var result = {
          flag: 1,
          result: result.recordset,
        };

        res.send(result);
      });
    });
  } catch (err) {
    var result = {
      flag: 2,
    };

    res.send(result);
  }
});

router.post("/assignproject", async (req, res) => {
  try {
    const timesheetadmin = req.body.timesheetadmin;
    const timesheetproject = req.body.timesheetproject;
    const candidateid = req.body.candidateid;

    if (!candidateid) {
      return res.status(400).json({ error: "candidateid is required" });
    }

    await sql.connect(config, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database connection error" });
      }

      const query =
        "UPDATE Trainee SET timesheet_admin = '" + timesheetadmin + "',timesheetproject='" + timesheetproject + "' WHERE traineeid =" +
        candidateid;

      console.log(query);
      const request = new sql.Request();
      // request.input('organizationid', sql.Int, organizationid);
      request.query(query, (err, result) => {
        if (err) {
          console.error(err);
          sql.close();
          return res.status(500).json({ error: "Database query error" });
        }
        sql.close();
        console.log(result);
        var result = {
          flag: 1,
        };

        res.send(result);
      });
    });
  } catch (err) {
    var result = {
      flag: 2,
    };

    res.send(result);
  }
});

router.post('/getInvoiceClientList', async (req, res) => {
  try {
    // const request = new sql.Request();
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "SELECT tp.projectid AS projectid, tp.projectname AS ProjectName, c.clientid AS ClientID, c.clientname AS ClientName, c.PaymentTerms, c.emailid AS EmailID, c.Address AS Address FROM timesheet_project AS tp JOIN clients AS c ON tp.clientid = c.clientid WHERE tp.orgid = '" + req.body.orgID + "' AND tp.status = 1";

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

router.post('/getTimesheetCandidateList', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const query = `SELECT traineeid, CONCAT(firstname, ' ', lastname) AS name FROM trainee WHERE userorganizationid = '${req.body.organizationid}' AND timesheet_role = 3`;

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
        error: "No active candidates found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching candidate data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching candidate data!",
    };
    res.status(500).send(result);
  }
});

router.post('/getTimesheetClientList', async (req, res) => {
  try {
    // const request = new sql.Request();
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "SELECT s.ClientID, s.ClientName FROM clients s INNER JOIN Trainee t ON s.PrimaryOwner = t.TraineeID  WHERE s.Active = 1 AND	s.istimesheet = 1 AND t.OrganizationID = '" + req.body.OrgID + "'";

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

router.post('/createtimesheetproject', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const {
      ProjectName,
      Billable,
      ClientName,
      Candidates,
      SelectedCandidate,
      StartDate,
      EndDate,
      TraineeID,
      orgID
    } = req.body;

    const query = `INSERT INTO timesheet_project (Projectname, clientid, netterms, status, createdby, createdate, orgid, billableamt, startdate, enddate, candidate) VALUES ('${req.body.Projectname}', '${req.body.clientid}', '','1','${req.body.createdby}',(SELECT CAST(GETDATE() AS DATE)), '${req.body.orgid}', '${req.body.billableamt}', '${req.body.startdate}', '${req.body.enddate}','${req.body.candidate}')`;

    console.log(query);
    const recordset = await request.query(query);
    if (recordset && recordset.rowsAffected && recordset.rowsAffected[0] > 0) {
      const result = {
        flag: 1,
        result: 'Project created successfully!',
      };
      res.send(result);
    } else {
      const result = {
        flag: 0,
        error: 'Failed to create the project!',
      };
      res.send(result);
    }
  } catch (error) {
    console.error('Error creating project:', error);
    const result = {
      flag: 0,
      error: 'An error occurred while creating the project!',
    };
    res.status(500).send(result);
  }
});

router.post('/getProjectList', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const query = "SELECT tp.projectid, tp.Projectname, c.ClientName, tp.startdate, tp.enddate FROM timesheet_project tp JOIN clients c ON tp.clientid = c.ClientID WHERE tp.orgid = '" + req.body.orgid + "' AND tp.status = 1;";

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
        error: "No active projects found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching project data!",
    };
    res.status(500).send(result);
  }
});

router.post("/deleteProject", async (req, res) => {
  try {

    await sql.connect(config);
    const query =
      "UPDATE timesheet_project SET status = 0 WHERE projectid =  '" + req.body.projectid + "' ";

    const request = new sql.Request();

    const result = await request.query(query);

    await sql.close();

    res.json({ message: "Project Removed Successfully" });
  } catch (err) {
    return next(err);
  }
});


// router.post('/getTimesheetCandidatetList', async (req, res) => {
//   try {
//     const pool = await sql.connect(config);
//     const request = pool.request();

//     const query =  "select * from Trainee where Active = 1 and isTimeSheet = 1 AND userorganizationid = '" + req.body.OrgID + "' and Role = 'TRESUMEUSER'";


//     console.log("Query Results:", recordset);

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
//         error: "No active results found!",
//       };
//       res.send(result);
//     }
//   } 
//   catch (error) {
//     console.error("Error fetching candidate data:", error);
//     const result = {
//       flag: 0,
//       error: "An error occurred while fetching candidate data!",
//     };
//     res.status(500).send(result);
//   }

// });
router.post('/getTimesheetCandidatetList', async (req, res) => {
  let recordset; // Declare recordset outside the try block

  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // const query = "SELECT trainee.* FROM trainee INNER JOIN memberdetails ON trainee.userorganizationid IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(memberdetails.accessorg, ',')) WHERE trainee.istimesheet = 1 AND trainee.Role = 'TRESUMEUSER' AND memberdetails.useremail = '" + req.body.username + "' AND trainee.active = 1";

    const query = "SELECT * from trainee where active=1 and timesheet_admin ="+req.body.traineeid;

    console.log(query);

    recordset = await request.query(query);

    if (recordset && recordset.recordsets && recordset.recordsets.length > 0) {
      const result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    } else {
      const result = {
        flag: 0,
        error: "No active results found!",
      };
      res.send(result);
    }
  }
  catch (error) {
    console.error("Error fetching candidate data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching candidate data!",
    };
    res.status(500).send(result);
  }
});

router.post('/reportCandidatetList', async (req, res) => {
  let recordset; // Declare recordset outside the try block

  try {
    const pool = await sql.connect(config);
    const request = pool.request();
//1 and 3 as per status
let query = ''
if(req.body.timesheetrole == '2'){
  query = `
  SELECT traineeid, CONCAT(firstname, ' ', lastname) AS name 
  FROM trainee 
  WHERE istimesheet = 1 
    AND active = 1 
    AND timesheet_role = 3 
    AND userorganizationid = '${req.body.OrgId}' 
    AND timesheet_admin = '${req.body.TraineeID}'
  ORDER BY name;
`;
}else{
  query = `
      SELECT traineeid, CONCAT(firstname, ' ', lastname) AS name 
      FROM trainee 
      WHERE istimesheet = 1 
        AND active = 1 
        AND timesheet_role = 3 
        AND userorganizationid = '${req.body.OrgId}' 
      ORDER BY name;
    `;
}
     


    console.log(query);

    recordset = await request.query(query);

    if (recordset && recordset.recordsets && recordset.recordsets.length > 0) {
      const result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    } else {
      const result = {
        flag: 0,
        error: "No active results found!",
      };
      res.send(result);
    }
  }
  catch (error) {
    console.error("Error fetching candidate data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching candidate data!",
    };
    res.status(500).send(result);
  }
});

router.post('/invoiceCandidatetList', async (req, res) => {
  let recordset; // Declare recordset outside the try block

  try {
    const pool = await sql.connect(config);
    const request = pool.request();
//1 and 3 as per status
let query = ''
if(req.body.timesheetrole == '2'){
  query = `
  SELECT DISTINCT im.clientid, im.orgid, c.ClientName
  FROM invoice_master im
  JOIN clients c ON im.clientid = c.clientid
  WHERE im.orgid = '${req.body.OrgId}';
`;
}else{
  query = `
  SELECT DISTINCT im.clientid, im.orgid, c.ClientName
  FROM invoice_master im
  JOIN clients c ON im.clientid = c.clientid
  WHERE im.orgid = '${req.body.OrgId}';
    `;
}
     


    console.log(query);

    recordset = await request.query(query);

    if (recordset && recordset.recordsets && recordset.recordsets.length > 0) {
      const result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    } else {
      const result = {
        flag: 0,
        error: "No active results found!",
      };
      res.send(result);
    }
  }
  catch (error) {
    console.error("Error fetching candidate data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching candidate data!",
    };
    res.status(500).send(result);
  }
});


router.post('/getCreateProjectList', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // const query =  "select * from timesheet_project where projectname like '%value%' and orgID = this.orgID and active = 1";
    const query = "select projectname,projectid from timesheet_project where orgid='" + req.body.OrgID + "' and status = 1";

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
        error: "No active projects found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching project data!",
    };
    res.status(500).send(result);
  }
});


router.post('/getPayItemList', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // const query = "Select Text from PayType";
    const query = "SELECT Text FROM PayType WHERE Text IN ('Hourly', 'Daily')";

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
        error: "No active projects found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching project data!",
    };
    res.status(500).send(result);
  }
});


router.post('/getLocationList', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const query = "select distinct CONCAT(state,' - ',stateAbbr) as state from usazipcodenew ORDER BY state ASC";

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
        error: "No active projects found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching project data!",
    };
    res.status(500).send(result);
  }
});

router.post('/deletetimesheetdata', async (req, res) => {
  try {
    const interviewdata = await deactivateinterviewdata(req.body.TraineeInterviewID);
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
    console.error("Error deleting timesheet:", error);
    const result = {
      flag: 0,
      error: "An error occurred while deleting the timesheet data!",
    };
    res.status(500).send(result);
  }
})

router.post('/createTimesheet', upload.single('file1'), async (req, res) => {
  try {
    const { id, traineeid, totalhrs, comments, projectid, details, approvalstatus, statusreport, clientapproved, approvedby, processdate, admincomment, fromdate, todate, isBillable, payterm, service, location, billableamt, day1, day2, day3, day4, day5, day6, day7, totalamt, admin, orgid, create_by } = req.body;
    let filename = '';

    // const isBillableBool = isBillable === '1' ? true : false;

    if (req.file) {
      filename = req.file.filename;
    }

    const pool = await sql.connect(config);

    let query;
    let inputParams = {
      'traineeid': sql.Int,
      'projectid': sql.Int,
      'totalhrs': sql.Float,
      'details': sql.Text,
      'clientapproved': sql.VarChar(sql.MAX),
      'created_at': sql.DateTime,
      'status': sql.Int,
      'fromdate': sql.DateTime,
      'todate': sql.DateTime,
      'isBillable': sql.Int,
      'payterm': sql.VarChar(20),
      'service': sql.VarChar(20),
      'location': sql.VarChar(50),
      'billableamt': sql.VarChar(50),
      'day1': sql.VarChar(10),
      'day2': sql.VarChar(10),
      'day3': sql.VarChar(10),
      'day4': sql.VarChar(10),
      'day5': sql.VarChar(10),
      'day6': sql.VarChar(10),
      'day7': sql.VarChar(10),
      'totalamt': sql.Float,
      'admin': sql.Int,
      'orgid': sql.Int,
      'create_by': sql.VarChar(50)
    };

    if (id) {
      query = `UPDATE [dbo].[timesheet_Master] SET traineeid = @traineeid, projectid= @projectid, totalhrs = @totalhrs, details = @details, clientapproved = '${filename}', created_at =GETDATE(), status = @status, fromdate = @fromdate, todate = @todate, isBillable = @isBillable, payterm = @payterm, service = @service, location = @location, billableamt = @billableamt, day1 = @day1, day2 = @day2, day3 = @day3, day4 = @day4, day5 = @day5, day6 = @day6, day7 = @day7, totalamt = @totalamt, admin = @admin, orgid = @orgid, lastUpdated_by = @create_by,lastUpdated_at = GETDATE() OUTPUT inserted.id WHERE id = @id`;

      inputParams['id'] = sql.Int;
    } else {
      query = `INSERT INTO [dbo].[timesheet_Master] (traineeid,projectid,totalhrs, details, clientapproved, created_at, status, fromdate, todate, isBillable, payterm, service, location, billableamt, day1, day2, day3, day4, day5, day6, day7, totalamt, admin, orgid, create_by,lastUpdated_by,lastUpdated_at) OUTPUT inserted.id VALUES (@traineeid,@projectid, @totalhrs, @details, '${filename}', GETDATE(), @status, @fromdate, @todate, @isBillable, @payterm, @service, @location, @billableamt, @day1, @day2, @day3, @day4, @day5, @day6, @day7, @totalamt, @admin, @orgid, @create_by,@create_by,GETDATE())`;

      inputParams['id'] = sql.Int;
    }
    console.log(query)
    const request = pool.request();

    for (const paramName in inputParams) {
      // if (req.body.hasOwnProperty(paramName)) {
      request.input(paramName, inputParams[paramName], req.body[paramName]);
      // }
    }

    const result = await request.query(query);

    const createdTimesheetId = result.recordset[0].id; // Assuming your ID column is named 'id'

    res.status(200).json({ id: createdTimesheetId, message: id ? 'Timesheet Updated successfully' : 'Timesheet Created successfully', filename });
  } catch (error) {
    console.error('Error creating/updating timesheet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// router.post('/createTimesheet', upload.single('file1'), async (req, res) => {
//   try {
//     const { id, traineeid, totalhrs, comments, projectid, details, approvalstatus, statusreport, clientapproved, approvedby, processdate, admincomment, fromdate, todate, isBillable, payterm, service, location, billableamt, day1, day2, day3, day4, day5, day6, day7, totalamt, admin, orgid, create_by } = req.body;
//     let filename = '';

//     // const isBillableBool = isBillable === '1' ? true : false;

//     if (req.file) {
//       filename = req.file.filename;
//     }

//     const pool = await sql.connect(config);

//     let query;
//     let inputParams = {
//       'traineeid': sql.Int,
//       'projectid': sql.Int,
//       'totalhrs': sql.Float,
//       'details': sql.Text,
//       'clientapproved': sql.VarChar(sql.MAX),
//       'created_at': sql.DateTime,
//       'status': sql.Int,
//       'fromdate': sql.DateTime,
//       'todate': sql.DateTime,
//       'isBillable': sql.Int,
//       'payterm': sql.VarChar(20),
//       'service': sql.VarChar(20),
//       'location': sql.VarChar(50),
//       'billableamt': sql.VarChar(50),
//       'day1': sql.VarChar(10),
//       'day2': sql.VarChar(10),
//       'day3': sql.VarChar(10),
//       'day4': sql.VarChar(10),
//       'day5': sql.VarChar(10),
//       'day6': sql.VarChar(10),
//       'day7': sql.VarChar(10),
//       'totalamt': sql.Float,
//       'admin': sql.Int,
//       'orgid': sql.Int,
//       'create_by': sql.VarChar(50)
//     };

//     if (id) {
//       query = `UPDATE [dbo].[timesheet_Master] SET traineeid = @traineeid, projectid= @projectid, totalhrs = @totalhrs, details = @details, clientapproved = '${filename}', created_at =GETDATE(), status = @status, fromdate = @fromdate, todate = @todate, isBillable = @isBillable, payterm = @payterm, service = @service, location = @location, billableamt = @billableamt, day1 = @day1, day2 = @day2, day3 = @day3, day4 = @day4, day5 = @day5, day6 = @day6, day7 = @day7, totalamt = @totalamt, admin = @admin, orgid = @orgid, lastUpdated_by = @create_by,lastUpdated_at = GETDATE() WHERE id = @id`;

//       inputParams['id'] = sql.Int;
//     } else {
//       query = `INSERT INTO [dbo].[timesheet_Master] (traineeid,projectid,totalhrs, details, clientapproved, created_at, status, fromdate, todate, isBillable, payterm, service, location, billableamt, day1, day2, day3, day4, day5, day6, day7, totalamt, admin, orgid, create_by,lastUpdated_by,lastUpdated_at) VALUES (@traineeid,@projectid, @totalhrs, @details, '${filename}', GETDATE(), @status, @fromdate, @todate, @isBillable, @payterm, @service, @location, @billableamt, @day1, @day2, @day3, @day4, @day5, @day6, @day7, @totalamt, @admin, @orgid, @create_by,@create_by,GETDATE())`;
//     }
//     console.log(query)
//     const request = pool.request();

//     for (const paramName in inputParams) {
//       // if (req.body.hasOwnProperty(paramName)) {
//       request.input(paramName, inputParams[paramName], req.body[paramName]);
//       // }
//     }

//     const result = await request.query(query);

//     res.status(200).json({ message: id ? 'Timesheet Updated successfully' : 'Timesheet Created successfully', filename });
//   } catch (error) {
//     console.error('Error creating/updating timesheet:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// router.post('/createTimesheet', upload.single('file1'), async (req, res) => {
//   try {

//     const { traineeid, totalhrs, comments, projectid, details, approvalstatus, statusreport, clientapproved, approvedby, processdate, admincomment, fromdate, todate, isBillable, payterm, service, location, billableamt, day1, day2, day3, day4, day5, day6, day7, totalamt, admin, orgid, create_by } = req.body;
//     let filename = '';

//     const isBillableBool = isBillable === 'true' ? true : false;

//     if (req.file) {
//       filename = req.file.filename;
//     }

//     const pool = await sql.connect(config);

//     await pool.request()
//       .input('traineeid', sql.Int, traineeid)
//       .input('totalhrs', sql.Float, parseFloat(totalhrs))
//       .input('comments', sql.Text, '')
//       .input('projectid', sql.Int, projectid)
//       .input('details', sql.Text, details)
//       .input('approvalstatus', sql.Int, '1')
//       .input('statusreport', sql.VarChar(sql.MAX), '')
//       .input('clientapproved', sql.VarChar(sql.MAX), filename)
//       .input('approvedby', sql.Int, '')
//       .input('admincomment', sql.Text, '')
//       .input('created_at', sql.DateTime, new Date())
//       .input('status', sql.Int, 1)
//       .input('fromdate', sql.DateTime, fromdate)
//       .input('todate', sql.DateTime, todate)
//       .input('isBillable', sql.Bit, isBillableBool)
//       .input('payterm', sql.Int, payterm)
//       .input('service', sql.Int, service)
//       .input('location', sql.Int, '1')
//       .input('billableamt', sql.VarChar(50), billableamt)
//       .input('day1', sql.VarChar(10), day1)
//       .input('day2', sql.VarChar(10), day2)
//       .input('day3', sql.VarChar(10), day3)
//       .input('day4', sql.VarChar(10), day4)
//       .input('day5', sql.VarChar(10), day5)
//       .input('day6', sql.VarChar(10), day6)
//       .input('day7', sql.VarChar(10), day7)
//       .input('totalamt', sql.Float, parseFloat(totalamt))
//       .input('admin', sql.Int, admin)
//       .input('orgid', sql.Int, orgid)
//       .input('create_by', sql.VarChar(50), create_by)
//       .query(`INSERT INTO [dbo].[timesheet_Master] (traineeid, totalhrs, projectid, details, clientapproved,created_at,status, fromdate, todate, isBillable, payterm, service, location, billableamt, day1, day2, day3, day4, day5, day6, day7, totalamt, admin, orgid, create_by) VALUES (@traineeid, @totalhrs, @projectid, @details, @clientapproved, @created_at, @status, @fromdate, @todate, @isBillable, @payterm, @service, @location, @billableamt, @day1, @day2, @day3, @day4, @day5, @day6, @day7, @totalamt, @admin, @orgid, @create_by)`);


//     res.status(200).json({ message: 'Timesheet Created successfully', filename });
//   } catch (error) {
//     console.error('Error creating timesheet:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


router.post('/gettimesheetrole', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    const query = "select TraineeID, OrganizationID,timesheet_role as timesheetrole, CONCAT(FirstName,' ', LastName) as Name from trainee where traineeID='" + req.body.traineeID + "'";

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
        error: "No active projects found!",
      };
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching project data!",
    };
    res.status(500).send(result);
  }
});





router.post("/deleteTimesheet", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "UPDATE timesheet_Master SET status = 0 WHERE id = '" + req.body.Id + "'";



    // request.input('Id', sql.Int, req.body.Id);

    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      const response = {
        flag: 1,
      };
      res.send(response);
    } else {
      const response = {
        flag: 0,
        error: "No records were deleted.",
      };
      res.send(response);
    }
  } catch (error) {
    console.error("Error Deleteing Timesheet:", error);
    const response = {
      flag: 0,
      error: "An error occurred while Deleting Timesheet!",
    };
    res.status(500).send(response);
  }
});



router.post("/UpdateAcceptStatus", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    // const query = "UPDATE timesheet_Master SET comments = '"+req.body.comments+"', status = 3 WHERE traineeId = '"+req.body.traineeID+"' AND id = '"+req.body.id+"';"
    // request.input('Id', sql.Int, req.body.Id);
    const query = "UPDATE timesheet_Master SET comments = '" + req.body.comments + "', status = 3 WHERE id = '" + req.body.id + "';"
    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      const response = {
        flag: 1,
      };
      res.send(response);
    } else {
      const response = {
        flag: 0,
        error: "No records were Updated.",
      };
      res.send(response);
    }
  } catch (error) {
    console.error("Error Update Status:", error);
    const response = {
      flag: 0,
      error: "An error occurred while Update Status!",
    };
    res.status(500).send(response);
  }
});

router.post("/UpdateRejectStatus", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    // const query = "UPDATE timesheet_Master SET comments = '"+req.body.comments+"', status = 2 WHERE traineeId = '"+req.body.traineeID+"' AND id = '"+req.body.id+"';"
    // request.input('Id', sql.Int, req.body.Id);

    const query = "UPDATE timesheet_Master SET comments = '" + req.body.comments + "', status = 2 WHERE  id = '" + req.body.id + "';"

    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      const response = {
        flag: 1,
      };
      res.send(response);
    } else {
      const response = {
        flag: 0,
        error: "No records were Updated.",
      };
      res.send(response);
    }
  } catch (error) {
    console.error("Error Update status:", error);
    const response = {
      flag: 0,
      error: "An error occurred while Update!",
    };
    res.status(500).send(response);
  }
});

// router.post("/updatetimesheet", async (req, res) => {
//   try {
//     const pool = await sql.connect(config);
//     const request = pool.request();
//     var data = req.body.rowdata;
//     let successCount = 0;

//     for (var i = 0; i < data.length; i++) {
//       const query = "UPDATE timesheet_Master SET lastUpdated_by= '" + data[i].username + "', totalhrs = '" + data[i].totalhrs + "', comments ='" + data[i].comments + "', day1 = '" + data[i].day1 + "',  day2 = '" + data[i].day2 + "', day3 = '" + data[i].day3 + "',  day4 = '" + data[i].day4 + "', day5 = '" + data[i].day5 + "', day6 = '" + data[i].day6 + "', day7 = '" + data[i].day7 + "', totalamt = '" + data[i].totalamt + "'  WHERE id = '" + data[i].id + "' AND projectid = '" + data[i].projectid + "';";

//       const result = await request.query(query);
//       if (result.rowsAffected[0] > 0) {
//         successCount++;
//       }
//     }

//     if (successCount === data.length) {
//       const response = {
//         flag: 1,
//       };
//       res.send(response);
//     } else {
//       const response = {
//         flag: 0,
//         error: "Some records were not updated.",
//       };
//       res.send(response);
//     }

//     console.log(query);
//   } catch (error) {
//     console.error("Error Update status:", error);
//     const response = {
//       flag: 0,
//       error: "An error occurred while Update!",
//     };
//     res.status(500).send(response);
//   }
// });

// router.post("/updatetimesheet", async (req, res) => {
//   try {
//     const pool = await sql.connect(config);
//     const request = pool.request();
//     const data = req.body.rowdata;
//     let successCount = 0;

//     for (let i = 0; i < data.length; i++) {
//       const query = `
//         UPDATE timesheet_Master 
//         SET 
//           lastUpdated_by = @username,
//           totalhrs = @totalhrs,
//           comments = @comments,
//           day1 = @day1,
//           day2 = @day2,
//           day3 = @day3,
//           day4 = @day4,
//           day5 = @day5,
//           day6 = @day6,
//           day7 = @day7,
//           totalamt = @totalamt
//         WHERE 
//           id = @id AND projectid = @projectid;
//       `;

//       const result = await request
//         .input('username', data[i].username)
//         .input('totalhrs', data[i].totalhrs)
//         .input('comments', data[i].comments)
//         .input('day1', data[i].day1)
//         .input('day2', data[i].day2)
//         .input('day3', data[i].day3)
//         .input('day4', data[i].day4)
//         .input('day5', data[i].day5)
//         .input('day6', data[i].day6)
//         .input('day7', data[i].day7)
//         .input('totalamt', data[i].totalamt)
//         .input('id', data[i].id)
//         .input('projectid', data[i].projectid)
//         .query(query);

//       if (result.rowsAffected[0] > 0) {
//         successCount++;
//       }
//     }

//     if (successCount === data.length) {
//       res.send({ flag: 1 });
//     } else {
//       res.send({ flag: 0, error: "Some records were not updated." });
//     }
//   } catch (error) {
//     console.error("Error updating timesheet:", error);
//     res.status(500).send({ flag: 0, error: "An error occurred while updating timesheet." });
//   }
// });
router.post("/updatetimesheet", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const data = req.body.rowdata;
    let successCount = 0;

    for (let i = 0; i < data.length; i++) {
      const query = `
        UPDATE timesheet_Master 
        SET 
          lastUpdated_by = @username,
          totalhrs = @totalhrs,
          comments = @comments,
          day1 = @day1,
          day2 = @day2,
          day3 = @day3,
          day4 = @day4,
          day5 = @day5,
          day6 = @day6,
          day7 = @day7,
          totalamt = @totalamt
        WHERE 
          id = @id AND projectid = @projectid;
      `;

      const result = await request
        .input('username', req.body.username) // Use req.body.username as the value for lastUpdated_by
        .input('totalhrs', data[i].totalhrs)
        .input('comments', data[i].comments)
        .input('day1', data[i].day1)
        .input('day2', data[i].day2)
        .input('day3', data[i].day3)
        .input('day4', data[i].day4)
        .input('day5', data[i].day5)
        .input('day6', data[i].day6)
        .input('day7', data[i].day7)
        .input('totalamt', data[i].totalamt)
        .input('id', data[i].id)
        .input('projectid', data[i].projectid)
        .query(query);

      if (result.rowsAffected[0] > 0) {
        successCount++;
      }
    }

    if (successCount === data.length) {
      res.send({ flag: 1 });
    } else {
      res.send({ flag: 0, error: "Some records were not updated." });
    }
  } catch (error) {
    console.error("Error updating timesheet:", error);
    res.status(500).send({ flag: 0, error: "An error occurred while updating timesheet." });
  }
});



router.post('/autofillDetails', async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const fromDate = new Date(req.body.fromdate).toISOString().split('T')[0];
    const toDate = new Date(req.body.fromdate);
    toDate.setDate(toDate.getDate() + 1);
    const toDateFormatted = toDate.toISOString().split('T')[0];
    const query = `SELECT TM.*,TP.projectname from timesheet_Master TM LEFT JOIN timesheet_project TP ON TP.projectid = TM.projectid
    WHERE fromdate between '${fromDate}' and '${toDateFormatted}' and traineeid = '${req.body.traineeID}' and TM.status in (1,3)`;

    console.log(query);
    const result = await request.query(query);

    res.json({
      flag: 1,
      result: result.recordset,
    });
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

router.post('/sendEmail', async (req, res) => {
  const { tableData, projectName, weekStartDate, weekEndDate , timesheet_role,CandidateNumber,TotalHours,Project,candidateName, timesheetId} = req.body;

  const approveLink = `http://localhost:4200/update-timesheet/:${timesheetId}/2`;

  // Check if tableData is defined
  if (!tableData) {
    return res.status(400).send('Table data is missing in the request.');
  }

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
  var tableHtml = '';

  if (timesheet_role == 3) {
    var tableHtml = `
    <p>Candidate id: ${CandidateNumber}</p>
    <p>Week Start Date: ${weekStartDate}</p>
    <p>Week End Date: ${weekEndDate}</p>
    <br>
    <table border="0" style="border-collapse: collapse; width: 100%; margin-top: 20px;">
    <thead style="background-color: #e5d6f3;">
      <tr>
        <th style="padding: 8px; border: 1px solid #ddd;">Candidate Name</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Project Name</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Mon</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Tue</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Wed</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Thu</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Fri</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Sat</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Sun</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Total Hours</th>
      </tr>
    </thead>
    <tbody>
    `;
  
    tableData.forEach((row, index) => {
      const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f2f2f2'; 
      tableHtml += `
        <tr style="background-color: ${backgroundColor};">
          <td style="padding: 8px; border: 1px solid #ddd;">${candidateName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${projectName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.mon}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.tues}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.wed}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.thu}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.fri}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.sat}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.sun}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${TotalHours}</td>
        </tr>
      `;
    });
  
    tableHtml += `
    </tbody>
  </table>
  <br>
  <a href=${approveLink} target="_blank" style="color:green;font-size:20px;cursor:pointer;margin-left: 15px;margin-right: 15px;"><b>Approve</b></a>
  <a href="https://www.tresume.us" target="_blank" style="color:red;font-size:20px;cursor:pointer;margin-left: 15px;margin-right: 15px;"><b>Reject</b></a>
  `;
  
  } else if (timesheet_role == 2) {
    var tableHtml = `
    <h3><i> Updated the timesheet data.<i> </h3>
    <br>
    <p>Candidate Name: ${candidateName}</p>
    <p>Project Name: ${projectName}</p>
    <p>Week Start Date: ${weekStartDate}</p>
    <p>Week End Date: ${weekEndDate}</p>
    <br>
    <table border="0" style="border-collapse: collapse; width: 100%; margin-top: 20px;">
    <thead style="background-color: #e5d6f3;">
      <tr>
        <th style="padding: 8px; border: 1px solid #ddd;">Candidate ID</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Project Name</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Mon</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Tue</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Wed</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Thu</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Fri</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Sat</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Sun</th>
        <th style="padding: 8px; border: 1px solid #ddd;">Total Hours</th>
      </tr>
    </thead>
    <tbody>
    `;
  
    tableData.forEach((row, index) => {
      const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f2f2f2';
      tableHtml += `
        <tr style="background-color: ${backgroundColor};">
          <td style="padding: 8px; border: 1px solid #ddd;">${row.id}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${projectName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.mon}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.tues}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.wed}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.thu}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.fri}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.sat}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.sun}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${row.totalHours}</td>
        </tr>
      `;
    });
  
    tableHtml += `
      </tbody>
    </table> `;
  }
  
  const mailOptions = {
    from: 'support@tresume.us',
    to: 'venkat@tresume.us',
    subject: 'Table Data',
    html: tableHtml
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    let data = {
      flag:1,
      Message:'Email sent successfully'
    }
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send email');
  }
});

router.get('/update-timesheet/:timesheetid', async (req, res) => {
  try {
      const pool = await sql.connect(config);
      const request = pool.request();
      
      const timesheetId = 445;
      const status = '2';

      const query = `UPDATE timesheet_Master SET status = ${status} WHERE id = ${timesheetId}`;

      const result = await request.query(query);

      setTimeout(() => {
          res.send('Successfully Approved');
      }, 5000);
  } catch (err) {
      console.error(err);
      return res.status(500).send('Error updating timesheet status');
  }
});

// router.get('/update-timesheet/:timesheetid', (req, res) => {
//   const timesheetId = 445;
//   const status = '2'; 

//   db.query('UPDATE timesheet_master SET status = ? WHERE id = ?', [status, timesheetId], (err, result) => {
//       if (err) {
//           console.error(err);
//           return res.status(500).send('Error updating timesheet status');
//       }

//       // Assuming the query executed successfully
//       setTimeout(() => {
//           res.send('Successfully Approved');
//       }, 5000); 
//   });
// });


// const approveLink = `http://www.tresume.us/update-timesheet/:timesheetid/2`;

// router.get('/approve', (req, res) => {
//   const { projectId, approvalAction } = req.query;
//   res.send(`Project ${projectId} ${approvalAction}d successfully.`);
// });

// router.get('/update-timesheet/:timesheetid/:status', (req, res) => {
//   const timesheetId = req.params.timesheetid;
//   const status = req.params.status;

//   // Your database query to update the timesheet status
//   db.query('UPDATE timesheet_master SET status = ? WHERE id = ?', [status, timesheetId], (err, result) => {
//       if (err) {
//           console.error(err);
//           return res.status(500).send('Error updating timesheet status');
//       }

//       // Assuming the query executed successfully
//       setTimeout(() => {
//           res.send('Successfully Approved');
//       }, 5000); 
//   });
// });

// http://www.tresume.us/update-timesheet/:timesheetid/:status

// 2 reject 
// 3 accepted