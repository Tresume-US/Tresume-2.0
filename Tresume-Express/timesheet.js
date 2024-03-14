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
      var query = `SELECT 
      CONCAT(t.FirstName, ' ', t.LastName) AS TraineeName,
      tm.*, -- Selecting all columns from timesheet_master
      o.organizationname
  FROM 
      Memberdetails md
  JOIN 
      timesheet_master tm ON md.traineeid = tm.traineeid
  JOIN 
      organization o ON tm.orgid IN (SELECT value FROM STRING_SPLIT(md.accessorg, ','))
  JOIN 
      Trainee t ON tm.traineeid = t.traineeid
  WHERE 
      md.useremail = 'karthik@tresume.us'`;
      
      
      
      // `SELECT 
      //                 t1.*, 
      //                 CONCAT(t2.FirstName, ' ', t2.LastName) AS TraineeName
      //             FROM 
      //                 timesheet_master AS t1
      //             JOIN 
      //                 Trainee AS t2 ON t1.TraineeID = t2.TraineeID
      //             WHERE 
      //                 t1.orgid = '${req.body.OrgID}'`;

      // Check if startdate and enddate are provided
      if (req.body.startdate && req.body.enddate) {
        query += ` AND fromdate BETWEEN '${req.body.startdate}' AND '${req.body.enddate}'`;
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
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query =
        "SELECT TM.id, CONCAT(t.firstname, ' ', t.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN memberdetails MD ON TM.orgid = MD.orgid WHERE MD.useremail = '"+req.body.username+"' AND TM.status = 1";

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
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err; 
      }
      var request = new sql.Request();

      var query =
        "SELECT TM.id, CONCAT(t.firstname, ' ', t.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN memberdetails MD ON TM.orgid = MD.orgid WHERE MD.useremail = '"+req.body.username+"' AND TM.status = 2";

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
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query =
        "SELECT TM.id, CONCAT(t.firstname, ' ', t.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN memberdetails MD ON TM.orgid = MD.orgid WHERE MD.useremail = '"+req.body.username+"' AND TM.status = 3";

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
    sql.connect(config, async function (err) {
      if (err) {
        console.log(err);
        throw err; 
      }
      var request = new sql.Request();

      // var query =
      //   "SELECT CONCAT(t.firstname, ' ', t.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid WHERE T.timesheet_admin ='" + req.body.traineeID + "'";

//Its the correct query
        var query =
        "SELECT TM.id, CONCAT(t.firstname, ' ', t.lastname) as Candidate, TM.fromdate, TM.todate, TM.totalhrs, TM.created_at, TM.status, TM.comments, TM.details FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid INNER JOIN memberdetails MD ON TM.orgid = MD.orgid WHERE MD.useremail = '"+req.body.username+"' AND TM.isBillable = 0";

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
      "IF NOT EXISTS(SELECT * FROM Trainee WHERE UserName = @UserName AND UserOrganizationID = @UserOrganizationID) " +
      "BEGIN " +
      "INSERT INTO Trainee (TraineeID, username, firstName, phonenumber, lastName,Active,createtime,userorganizationid,CreateBy, CurrentLocation,timesheet_role,istimesheet ) " +
      "VALUES (@TraineeID, @username, @firstName, @phonenumber, @lastName, 1, GETDATE(), @userorganizationid, @createby, @currentLocation, 3, 1) " +
      "END";

    console.log(query);

    await sql.connect(config); 
    var request = new sql.Request();
    request.input('TraineeID', TraineeID);
    request.input('username', req.body.email || "");
    request.input('firstName', req.body.firstName || "");
    request.input('phonenumber', req.body.phone || "");
    request.input('lastName', req.body.lastName || "");
    request.input('userorganizationid', req.body.orgID || "");
    request.input('createby', req.body.createby || "");
    request.input('currentLocation', req.body.currentLocation || "");

    var result = await request.query(query);
    
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

      var query = "SELECT TM.id,TM.admincomment, CONCAT(T.firstname, ' ', T.lastname) as Candidate, TM.projectid, TM.day1, TM.day2, TM.day3, TM.day4, TM.day5, TM.day6, TM.day7, TM.totalamt, TM.details,TM.clientapproved FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid WHERE TM.id='"+req.body.tid+"' AND TM.status=1";


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
        "SELECT t.traineeid, t.firstname AS TraineeFirstName, t.lastname AS TraineeLastName,ta.firstname AS AdminFirstName,ta.lastname AS AdminLastName,tp.projectname FROM  trainee t JOIN  timesheet_project tp ON t.timesheetproject = tp.projectid LEFT JOIN trainee ta ON t.timesheet_admin = ta.traineeid WHERE t.userorganizationid = " +organizationid;

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
    const query = "SELECT tp.projectid AS projectid, tp.projectname AS ProjectName, c.clientid AS ClientID, c.clientname AS ClientName, c.emailid AS EmailID, c.Address AS Address FROM timesheet_project AS tp JOIN clients AS c ON tp.clientid = c.clientid WHERE tp.orgid = '"+req.body.orgID+"' AND tp.status = 1";

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
    
    const query =  "SELECT tp.projectid, tp.Projectname, c.ClientName, tp.startdate, tp.enddate FROM timesheet_project tp JOIN clients c ON tp.clientid = c.ClientID WHERE tp.orgid = '"+req.body.orgid+ "' AND tp.status = 1;";

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
      "UPDATE timesheet_project SET status = 0 WHERE projectid =  '"+req.body.projectid+"' ";

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
  
    const query = "SELECT trainee.* FROM trainee INNER JOIN memberdetails ON trainee.userorganizationid IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(memberdetails.accessorg, ',')) WHERE trainee.istimesheet = 1 AND trainee.Role = 'TRESUMEUSER' AND memberdetails.useremail = '"+req.body.username+"' AND trainee.active = 1";

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
    const query =  "select projectname,projectid from timesheet_project where orgid='"+req.body.OrgID+"' and status = 1";

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
    
    const query =  "Select Text from PayType";

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
    // Extracting data from FormData and request body
    const { traineeid, totalhrs, comments, projectid, details, approvalstatus, statusreport, clientapproved, approvedby, processdate, admincomment, fromdate, todate, isBillable, payterm, service, location, billableamt, day1, day2, day3, day4, day5, day6, day7, totalamt, admin, orgid, create_by } = req.body;
    const filename = req.file.filename;

    // Create a new SQL connection pool
    const pool = await sql.connect(config);

    // Execute the INSERT query
    await pool.request()
      .input('traineeid', sql.Int, traineeid)
      .input('totalhrs', sql.Int, totalhrs)
      .input('comments', sql.Text, '')
      .input('projectid', sql.Int, projectid)
      .input('details', sql.Text, details)
      .input('approvalstatus', sql.Int, '1')
      .input('statusreport', sql.VarChar(sql.MAX), '')
      .input('clientapproved', sql.VarChar(sql.MAX), filename)
      .input('approvedby', sql.Int, '')
      .input('admincomment', sql.Text, '')
      .input('created_at', sql.DateTime, new Date()) // Current datetime
      .input('status', sql.Int, 1) // Assuming default status
      .input('fromdate', sql.DateTime, fromdate)
      .input('todate', sql.DateTime, todate)
      .input('isBillable', sql.Bit, isBillable)
      .input('payterm', sql.Int, payterm)
      .input('service', sql.Int, service)
      .input('location', sql.Int, '1')
      .input('billableamt', sql.VarChar(50), billableamt)
      .input('day1', sql.VarChar(10), day1)
      .input('day2', sql.VarChar(10), day2)
      .input('day3', sql.VarChar(10), day3)
      .input('day4', sql.VarChar(10), day4)
      .input('day5', sql.VarChar(10), day5)
      .input('day6', sql.VarChar(10), day6)
      .input('day7', sql.VarChar(10), day7)
      .input('totalamt', sql.VarChar(50), totalamt)
      .input('admin', sql.Int, admin)
      .input('orgid', sql.Int, orgid)
      .input('create_by', sql.VarChar(50), create_by)
      .query(`INSERT INTO [dbo].[timesheet_Master] (traineeid, totalhrs, projectid, details, clientapproved,created_at,status, fromdate, todate, isBillable, payterm, service, location, billableamt, day1, day2, day3, day4, day5, day6, day7, totalamt, admin, orgid, create_by) VALUES (@traineeid, @totalhrs, @projectid, @details, @clientapproved, @created_at, @status, @fromdate, @todate, @isBillable, @payterm, @service, @location, @billableamt, @day1, @day2, @day3, @day4, @day5, @day6, @day7, @totalamt, @admin, @orgid, @create_by)`);

    // Respond with success message
    res.status(200).json({ message: 'Timesheet Created successfully', filename });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// router.post('/createTimesheet', async (req, res) => {
//   sql.connect(config, function (err) {
//     if (err) console.log(err);
//     var request = new sql.Request();
//     var query = "SELECT t.firstname,t.lastname,TM.fromdate, TM.todate, TM.totalhrs, TM.approvalstatus, TM.comments FROM Timesheet_Master TM INNER JOIN Trainee T ON TM.traineeid = T.traineeid WHERE T.timesheet_admin ='" + req.body.traineeID +"' ";
//     console.log(query);
//     request.query(query,
//       function (err, recordset) {
//         if (err) console.log(err);

//         var result = {
//           flag: 1,
//           result: recordset.recordsets[0],
//         };
//         res.send(result);
//       }
//     );
//   });
// })

// router.post('/deleteUserAccount', async (req, res) => {
//   const email = req.body.email;
//   try {
//     const dtrainee = await deactivatetrainee(email);
//     const dmemberdetails = await deactivatememberdetails(email);

//     if (dtrainee && dmemberdetails) {
//       const result = {
//         flag: 1,
//       };
//       res.send(result);
//     } else {
//       const result = {
//         flag: 0,
//       };
//       res.send(result);
//     }
//   } catch (error) {
//     const result = {
//       flag: 0,
//     };
//     res.send(result);
//   }

// })

// async function deactivatetrainee(email){
//   const pool = await sql.connect(config);
//   const request = pool.request();
//   const queryResult = await request.query(
//     `update trainee set active = 0 where username = '${email}'`
//   );
//   return queryResult;
// }

// async function deactivatememberdetails(email){
//   const pool = await sql.connect(config);
//   const request = pool.request();
//   const queryResult = await request.query(
//     `update memberdetails set active = 0 where  useremail ='${email}'`
//   );
//   return queryResult;
// }

router.post('/gettimesheetrole', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    
       const query = "select TraineeID, OrganizationID,timesheet_role as timesheetrole from trainee where traineeID='"+req.body.traineeID+"'";

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