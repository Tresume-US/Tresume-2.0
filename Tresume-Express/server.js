const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
var mime = require('mime');
const app = express();
const axios = require('axios');
const qs = require('querystring');
var sql = require("mssql");
var sql1 = require("mssql");
const multer = require('multer')
require('dotenv').config();
var savePath = './uploads/';
const fs = require('fs');
const nodemailer = require('nodemailer');
const request = require('request');
const cookieParser = require("cookie-parser");
const session = require('express-session')
app.use(bodyparser.json({ limit: '100mb' }));
app.use(bodyparser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));
const FormData = require('form-data');
const environment = process.env.NODE_ENV || 'prod';
const envconfig = require(`./config.${environment}.js`);
const apiUrl = envconfig.apiUrl;
const port = envconfig.port;
var cors = require('cors');
app.use(cors())

const cron = require('node-cron');

const onboardRoutes = require('./onboarding-routes');
const candidateRoutes = require('./candidate-routes');
const adobesignRoutes = require('./adobe-sign');
const harvestRoutes = require('./harvest-routes');
const ssoRoutes = require('./sso-routes');
const optRoutes = require('./optnation');
const userRoles = require('./user-roles');
const vendors = require('./vendors');
const clients = require('./clients');
const jobposting = require('./jobposting');
const talentbench = require('./talentbench');
const timesheet = require('./timesheet');
const hrms = require('./hrms-routes');
const assignrole = require('./assignrole');
const projects = require('./project');
const jobBoardAccount = require('./jobBoardAccount');
const leadenquiry = require('./enquiry');
const jobapplication = require('./jobapplication');
const submittedcandidates = require('./submittedcandidates');
const Invoice = require('./Invoice');


app.use('/', onboardRoutes);
app.use('/', candidateRoutes);
app.use('/', adobesignRoutes);
app.use('/', harvestRoutes);
app.use('/', ssoRoutes);
app.use('/', optRoutes);
app.use('/', userRoles);
app.use('/', vendors);
app.use('/', clients);
app.use('/', jobposting);
app.use('/', talentbench);
app.use('/', timesheet);
app.use('/', hrms);
app.use('/', assignrole);
app.use('/', projects);
app.use('/', jobBoardAccount);
app.use('/', leadenquiry);
app.use('/', jobapplication);
app.use('/', Invoice);
app.use('/', submittedcandidates);



app.use(session({
  secret: 'Tresume@123',
  resave: false,
  saveUninitialized: false,
}));

app.use("/", onboardRoutes);
app.use("/", candidateRoutes);

const route = express.Router();
const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.mail.yahoo.com",
  auth: {
    user: "support@tresume.us",
    pass: "xzkmvglehwxeqrpd",
  },
  secure: true,
});

// function formatValue(value) {
//   return value !== undefined ? `'${value}'` : '';
// }

// module.exports = {
//   formatValue: formatValue,
// };

function checkTimeSheetSubmission(fromDate, toDate, recordSet) {
  const frequencyCounter = {};
  const resultArray = [];
  var start = new Date(fromDate);
  var finish = new Date(toDate);
  var resultDays = getDaysBetweenDates(start, finish, "Sun");

  recordSet.forEach((record) => {
    frequencyCounter[record["UserID"]] =
      (frequencyCounter[record["UserID"]] || 0) + 1;
  });

  for (let item in frequencyCounter) {
    if (frequencyCounter[item] == resultDays.length) {
      resultArray.push(Number(item)); // returns array of user IDs
    }
  }

  return resultArray.length > 0 ? resultArray.toString() : "0";
}

function getDaysBetweenDates(start, end, dayName) {
  var result = [];
  var days = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  var day = days[dayName.toLowerCase().substr(0, 3)];
  // Copy start date
  var current = new Date(start);
  // Shift to next of required days
  current.setDate(current.getDate() + ((day - current.getDay() + 7) % 7));
  // While less than end date, add dates to result array
  while (current < end) {
    result.push(new Date(+current));
    current.setDate(current.getDate() + 7);
  }
  return result;
}

app.post("/text-mail", (req, res) => {
  const { to, subject, text } = req.body;
  const mailData = {
    from: "support@tresume.us",
    to: to,
    subject: subject,
    html: text,
  };

  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.status(200).send({ message: "Mail send", message_id: info.messageId });
  });
});

// config for your database
var config = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "Tresume_Beta",
  trustServerCertificate: true,
};

var config1 = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "TimesheetDB",
  trustServerCertificate: true,
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.path.includes("/uploadReqOnboardDocument")) {
      //const path = `D:/` + req.params.onboardID;
      const path =
        `//Ns1001833/MSSQLSERVER/OnboardingDocsDir/OnboardingDocsDir/` +
        req.params.onboardID +
        `/request`;
      console.log("path", path);
      fs.mkdirSync(path, { recursive: true });
      cb(null, path);
    } else if (req.path.includes("/uploadOnboardDocument")) {
      //const path = `D:/` + req.params.onboardID;
      const path =
        `//Ns1001833/MSSQLSERVER/OnboardingDocsDir/OnboardingDocsDir/` +
        req.params.onboardID;
      console.log("path", path);
      fs.mkdirSync(path, { recursive: true });
      cb(null, path);
    } else {
      const path =
        `C:/inetpub/vhosts/tresume.us/httpdocs/Content/Resume/` +
        req.params.traineeID;
      console.log("path", path);
      fs.mkdirSync(path, { recursive: true });
      cb(null, path);
    }
  },
  filename: (req, file, cb) => {
    if (req.params.traineeID != undefined) {
      var filename = file.originalname.split(".")[0];
      var fileExtension = file.originalname.split(".")[1];
      cb(null, filename + "-" + Date.now() + "." + fileExtension);
    } else {
      var filename = file.originalname.split(".")[0];
      var fileExtension = file.originalname.split(".")[1];
      //cb(null, filename + "." + fileExtension);
      cb(null, filename + "-" + Date.now() + "." + fileExtension);
    }
  },
});

const upload1 = multer({
  storage,
  limits: { fileSize: 100000000 },
}).single("file");

app.get(
  "/adminBenchByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      if (err) console.log(err);

      var request = new sql.Request();

      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
        req.params.traineeId,
        function (err, recordset) {
          if (err) console.log(err);

          var OrgID = recordset.recordsets[0][0].OrganizationID;
          var startDate = req.params.startDate;
          var endDate = req.params.endDate;

          request.query(
            "select (t.FirstName + ' ' + t.LastName) as MarketerName, (SELECT COUNT(cs.TBID) FROM TalentBench cs WHERE cs.Active=1 AND cs.CreateBy=t.UserName AND (cs.CreateTime BETWEEN '" +
            startDate +
            "' AND '" +
            endDate +
            "')) as BenchCount from MemberDetails md JOIN Trainee t ON t.UserName=md.UserEmail  AND t.OrganizationID =  " +
            OrgID +
            "WHERE md.OrgId=" +
            OrgID +
            " AND md.Active=1 AND t.Active=1 ORDER BY BenchCount desc ",
            function (err, recordset) {
              if (err) console.log(err);

              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };

              res.send(result);
            }
          );
        }
      );
    });
  }
);

app.get(
  "/adminPlacementByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      if (err) console.log(err);

      var request = new sql.Request();

      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
        req.params.traineeId,
        function (err, recordset) {
          if (err) console.log(err);

          var OrgID = recordset.recordsets[0][0].OrganizationID;
          var startDate = req.params.startDate;
          var endDate = req.params.endDate;

          request.query(
            "select (t.FirstName + ' ' + t.LastName) as MarkerterName, (SELECT COUNT(cs.PID) FROM Placements cs WHERE cs.Active=1 AND cs.RecuiterID=t.TraineeID AND (cs.CreatedTime BETWEEN '" +
            startDate +
            "' AND '" +
            endDate +
            "')) as PlacemntCount from MemberDetails md JOIN Trainee t ON t.UserName=md.UserEmail  AND t.OrganizationID =  " +
            OrgID +
            "WHERE md.OrgId=" +
            OrgID +
            " AND md.Active=1 AND t.Active=1 ORDER BY PlacemntCount desc",
            function (err, recordset) {
              if (err) console.log(err);

              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };

              res.send(result);
            }
          );
        }
      );
    });
  }
);

app.get(
  "/adminInterviewByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      if (err) console.log(err);

      var request = new sql.Request();

      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
        req.params.traineeId,
        function (err, recordset) {
          if (err) console.log(err);

          var OrgID = recordset.recordsets[0][0].OrganizationID;
          var startDate = req.params.startDate;
          var endDate = req.params.endDate;

          request.query(
            "select (t.FirstName + ' ' + t.LastName) as MarkerterName, (SELECT COUNT(cs.TraineeInterviewID) FROM TraineeInterview cs WHERE cs.Active=1 AND cs.RecruiterID=t.TraineeID AND (cs.CreateTime BETWEEN '" +
            startDate +
            "' AND '" +
            endDate +
            "')) as PlacemntCount from MemberDetails md JOIN Trainee t ON t.UserName=md.UserEmail  AND t.OrganizationID =  " +
            OrgID +
            "WHERE md.OrgId=" +
            OrgID +
            " AND md.Active=1 AND t.Active=1 ORDER BY PlacemntCount desc",
            function (err, recordset) {
              if (err) console.log(err);

              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };

              res.send(result);
            }
          );
        }
      );
    });
  }
);

app.get(
  "/adminSubmissionByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      if (err) console.log(err);

      var request = new sql.Request();

      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
        req.params.traineeId,
        function (err, recordset) {
          if (err) console.log(err);

          var OrgID = recordset.recordsets[0][0].OrganizationID;
          var startDate = req.params.startDate;
          var endDate = req.params.endDate;

          request.query(
            "select (t.FirstName + ' ' + t.LastName) as MarketerName, (SELECT COUNT(cs.SubmissionID) FROM Submission cs WHERE cs.Active=1 AND cs.CreateBy=t.UserName AND (cs.CreateTime BETWEEN '" +
            startDate +
            "' AND '" +
            endDate +
            "')) as BenchCount from MemberDetails md JOIN Trainee t ON t.UserName=md.UserEmail  AND t.OrganizationID =  " +
            OrgID +
            "WHERE md.OrgId=" +
            OrgID +
            " AND md.Active=1 AND t.Active=1 ORDER BY BenchCount desc ",
            function (err, recordset) {
              if (err) console.log(err);

              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };

              res.send(result);
            }
          );
        }
      );
    });
  }
);

app.get(
  "/adminFtcByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      if (err) console.log(err);

      var request = new sql.Request();

      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
        req.params.traineeId,
        function (err, recordset) {
          if (err) console.log(err);

          var OrgID = recordset.recordsets[0][0].OrganizationID;
          var startDate = req.params.startDate;
          var endDate = req.params.endDate;

          request.query(
            "select (t.FirstName + ' ' + t.LastName) as RecruiterName, (SELECT COUNT(cs.TraineeID) FROM Trainee cs WHERE cs.Active=1 AND cs.CreateBy=t.UserName AND cs.Collab=1 AND cs.RecruiterName=t.TraineeID AND cs.UserOrganizationID=t.OrganizationID AND (cs.CreateTime BETWEEN '" +
            startDate +
            "' AND '" +
            endDate +
            "')) as FTCCount from MemberDetails md JOIN Trainee t ON t.UserName=md.UserEmail  AND t.OrganizationID = " +
            OrgID +
            " WHERE md.OrgId=" +
            OrgID +
            " AND md.Active=1 AND t.Active=1 ORDER BY FTCCount desc  ",
            function (err, recordset) {
              if (err) console.log(err);

              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };

              res.send(result);
            }
          );
        }
      );
    });
  }
);

app.get("/getTraineeDetails/:traineeId", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select * from Trainee (nolock) where TraineeID = '" +
      req.params.traineeId +
      "' and Active = 1",
      function (err, recordset) {
        if (err) console.log(err);

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      }
    );
  });
});

app.get("/getLegalStatus/:traineeId", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.params.traineeId,
      function (err, recordset) {
        if (err) console.log(err);

        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.query(
          "SELECT b.LegalText AS LegalStatus, COUNT(TraineeID) AS Total, b.LegalStatusID FROM Trainee a JOIN LegalStatus b ON b.LegalValue=a.LegalStatus WHERE a.Active=1 AND a.UserOrganizationID=" +
          OrgID +
          "  AND a.CandidateStatus IN (2,4,6,7,13) GROUP BY b.LegalText, b.LegalStatusID",
          function (err, recordset) {
            if (err) console.log(err);

            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };

            res.send(result);
          }
        );
      }
    );
  });
});

app.get("/getAllRecruiters/:traineeId", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.params.traineeId,
      function (err, recordset) {
        if (err) console.log(err);

        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.query(
          "SELECT distinct r.TraineeID, r.FirstName + ' ' + ISNULL(r.LastName, '') as Name FROM MemberDetails orgR (nolock) JOIN Trainee r (nolock) ON r.UserName=orgR.UserEmail WHERE r.Active=1 AND orgR.Active=1 AND orgR.OrgID=" +
          OrgID,
          function (err, recordset) {
            if (err) console.log(err);

            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };

            res.send(result);
          }
        );
      }
    );
  });
});

app.post("/getFTCReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.fromDate);
        request.input("endDate", sql.VarChar, req.body.toDate);
        request.input("recruiterId", sql.VarChar, req.body.recruiterId);
        request.input("candidateStatus", sql.VarChar, req.body.candidateStatus);
        request.execute("getFTCReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getCandidateDocuments", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    let query = `SELECT CD.CandidateDocumentID,CD.TraineeID,CONVERT(NVARCHAR(10),CD.CreateTime,101) AS CreateTime,Cd.DocumentName,
        CD.DocumentPath,CD.Active,DT.DocTypeName,CONVERT(NVARCHAR(10),CD.DocStartDate,101) AS StartDate,CONVERT(NVARCHAR(10),CD.DocExpiryDate,101) AS ExpiryDate,
        CD.OtherInfo, CD.PlacementID from CandidateDocument_New CD LEFT JOIN DocType DT  ON DT.DTID = CD.DocumentTypeID
        WHERE CD.Active = 1 AND DT.Active = 1 AND CD.TraineeID = ${req.body.traineeID}`;
    if (req.body.docTypeID) {
      query += ` AND CD.DocumentTypeID = ${req.body.docTypeID}`;
    }
    console.log(query);
    request.query(query, function (err, recordset) {
      if (err) console.log(err);
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };

      res.send(result);
    });
  });
});

app.post("/getLoggedUser", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select TraineeID from Trainee (nolock) where Username = '" +
      req.body.userName +
      "' and Active = 1",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.get("/deleteDocument/:docId", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "UPDATE CandidateDocument_New SET Active = 0 WHERE CandidateDocumentID =" +
      req.params.docId,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      }
    );
  });
});

app.post("/uploadDocument/:traineeID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    upload1(req, res, function (err) {
      if (err) {
        return res.json(err);
      }
      let FileName = req.file.originalname.split(".")[0];
      console.log("FileName", FileName);
      let FilePath = req.file.path;
      console.log("FilePath", FilePath);

      var request = new sql.Request();
      request.query(
        "Select UserName from Trainee where TraineeID=" + req.body.loggedUserId,
        function (err, recordset) {
          if (err) console.log(err);
          var loggedUserEmail = recordset.recordsets[0][0].UserName;
          var result = {
            flag: 1,
            loggedUserEmail: loggedUserEmail,
            FileName: FileName,
            FilePath: FilePath,
          };
          res.send(result);
          console.log("result", result);
        }
      );
    });
  });
});

app.post("/uploadinsert", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var otherinfo = Object.values(req.body.otherInfo).join(",");
    request.query(
      "INSERT INTO CandidateDocument_New(TraineeID,DocumentName,DocumentPath,Active,CreateTime,CreateBy,LastUpdateTime,LastUpdateBy,DocumentTypeID,DocStartDate,DocExpiryDate,OtherInfo) VALUES (" +
      req.body.loggedUserId +
      ",'" +
      req.body.FileName +
      "','" +
      req.body.FilePath +
      "',1,GETUTCDATE(),'" +
      req.body.loggedUserEmail +
      "',NULL,NULL," +
      req.body.docType +
      ",'" +
      req.body.startDate +
      "','" +
      req.body.expiryDate +
      "','" +
      otherinfo +
      "' )",
      function (err, recordset) {
        if (err) console.log(err);
      }
    );
    res.json(true);
  });
});

app.get("/sitevisit/:traineeID", async function (req, res) {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    request.input("TraineeID", sql.VarChar, req.params.traineeID);

    const recordset = await request.execute("GetTraineeDetails");

    const result = {
      flag: 1,
      result: recordset.recordsets[0],
    };

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ flag: 0, error: "Internal Server Error" });
  } finally {
    // Make sure to close the SQL connection in the finally block
    sql.close();
  }
});

app.post("/updateJobDuties", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "UPDATE Placements SET JobDuties='" +
      req.body.jd +
      "' WHERE TraineeID=" +
      req.body.traineeID,
      function (err, recordset) {
        if (err) console.log(err);
      }
    );
    res.json(true);
  });
});

app.get("/getEducationDetails/:traineeID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input("TraineeID", sql.VarChar, req.params.traineeID);
    request.execute("GetTraineeEduDetails", function (err, recordset) {
      if (err) console.log(err);
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    });
  });
});

app.post("/getResumes", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);

        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.VarChar, OrgID);
        request.input("Keyword", sql.VarChar, req.body.keyword);
        request.input("Location", sql.VarChar, req.body.location);
        request.execute("GetJBResumes", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getResumes1", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);

        var OrgID = recordset.recordsets[0][0].OrganizationID;
        var sql =
          `SELECT TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy, YearsOfExpInMonths,
            ISNULL(YearsOfExpInMonths,0) [YRSEXP],
            LegalStatus, UserOrganizationID, CurrentLocation, Title as [TraineeTitle], ISNULL(LegalStatus,'') ,
            ISNULL(CONVERT(NVARCHAR(10),CreateTime,101), '1900-01-01T00:00:00') as LastUpdateTime,
            ISNULL(YearsOfExpInMonths,0), Source, Collab, Notes,
            ( SELECT TOP 1 (R.FirstName + ' ' + R.LastName) FROM Trainee R WHERE R.UserName = T.CreateBy) AS Recruiter
            FROM Trainee T (NOLOCK)
            WHERE (T.Talentpool IS NULL OR T.Talentpool = 0) AND T.UserOrganizationID = '`+ OrgID + `' AND T.active =1
            AND T.Role='TRESUMEUSER' AND T.ProfileStatus = 'READY'
            AND (T.Skill LIKE '%` +
          req.body.keyword +
          `%' OR T.Title LIKE '%` +
          req.body.keyword +
          `%')`;
        if (req.body.location) {
          sql +=
            `AND ((CurrentLocation IN (Select distinct Stateabbr FROM USAZipCodeNew WHERE State ='` +
            req.body.location +
            `' OR City = '` +
            req.body.location +
            `' OR ZipCode = '` +
            req.body.location +
            `')) OR (CurrentLocation IN (Select distinct State FROM USAZipCodeNew WHERE State = '` +
            req.body.location +
            `' OR City = '` +
            req.body.location +
            `' OR ZipCode = '` +
            req.body.location +
            `')))`;
        }
        sql += `ORDER BY ISNULL(T.CreateTime, '1900-01-01T00:00:00') DESC`;

        console.log(sql)
        request.query(sql, function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getResumeDetails", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select HtmlResume from Trainee (nolock) where TraineeID = '" +
      req.body.traineeID +
      "' and Active = 1",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

// app.post("/getOnboardingList", function (req, res) {
//   sql.connect(config, function (err) {
//     if (err) console.log(err);
//     var request = new sql.Request();
//     request.input("OrgID", sql.VarChar, req.body.OrgID);
//     request.input("startDate", sql.VarChar, req.body.startDate);
//     request.input("endDate", sql.VarChar, req.body.endDate);
//     request.execute("getCurrentOnboardingList", function (err, recordset) {
//       // request.query("select ISNULL(CONVERT(NVARCHAR(10),createdate,101), '1900-01-01T00:00:00') as Date, FirstName + ' ' + LastName as 'Employee Name', ISNULL(CONVERT(NVARCHAR(10), startdate,101), '1900-01-01T00:00:00') as 'Start Date', status, PercentComplete as Completed, ID from CurrentOnboardings where OrgID = '" + req.body.OrgID + "' and Active = 1 Order by createdate desc", function (err, recordset) {
//       if (err) console.log(err);
//       var result = {
//         flag: 1,
//         result: recordset.recordsets[0],
//       };
//       res.send(recordset.recordsets[0]);
//     });
//   });
// });

app.post("/getOnboardingList", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.status(500).send("Error connecting to database");
      return;
    }

    var useremail = req.body.useremail;

    var query = `SELECT ISNULL(CONVERT(NVARCHAR(10), CO.createdate, 101), '1900-01-01T00:00:00') AS Date,
                        CO.FirstName + ' ' + CO.LastName AS 'EmployeeName', 
                        ISNULL(CONVERT(NVARCHAR(10), CO.startdate, 101), '1900-01-01T00:00:00') AS 'StartDate',
                        CO.status,
                        CO.PercentComplete AS Completed,
                        CO.ID
                 FROM CurrentOnboardings CO
                 INNER JOIN Memberdetails M ON CHARINDEX(',' + CAST(CO.OrgID AS VARCHAR) + ',', ',' + M.accessorg + ',') > 0
                 INNER JOIN Organization O ON CO.OrgID = O.organizationid
                 WHERE M.useremail = '${useremail}' 
                   AND CO.Active = 1 
                   AND CO.CreateDate BETWEEN '2020-01-01' AND '2024-03-01'
                 ORDER BY CO.createdate DESC;`;

    console.log("Query:", query);

    var request = new sql.Request();
    request.query(query, function (err, recordset) {
      if (err) {
        console.log(err);
        res.status(500).send("Error executing query");
        return;
      }
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    });
  });
});


// app.post("/getCandidatesbyStatus", function (req, res) {
//   sql.connect(config, function (err) {
//     if (err) console.log(err);
//     var request = new sql.Request();
//     request.query(
//       "select FirstName, LastName, (FirstName + ' ' + LastName) as CandidateName, TraineeID from Trainee where (CandidateStatus=7 or CandidateStatus=6) and UserOrganizationID=" +
//       req.body.OrgID +
//       " and TraineeID NOT IN (Select TraineeID from CurrentOnboardings)",
//       function (err, recordset) {
//         if (err) console.log(err);
//         var result = {
//           flag: 1,
//           result: recordset.recordsets[0],
//         };
//         res.send(recordset.recordsets[0]);
//       }
//     );
//   });
// });

app.post("/getCandidatesbyStatus", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.status(500).send("Error connecting to database");
      return;
    }

    var useremail = req.body.useremail;

    var query = `SELECT T.FirstName, 
                        T.LastName, 
                        (T.FirstName + ' ' + T.LastName) as CandidateName, 
                        T.TraineeID,
                        O.Organizationname
                 FROM Trainee T
                 INNER JOIN Memberdetails M ON CHARINDEX(',' + CAST(T.userorganizationid AS VARCHAR) + ',', ',' + M.accessorg + ',') > 0
                 INNER JOIN Organization O ON T.userorganizationid = O.organizationid
                 WHERE M.useremail = '${useremail}'
                 AND (T.CandidateStatus = 7 OR T.CandidateStatus = 6) 
                 AND T.TraineeID NOT IN (SELECT TraineeID FROM CurrentOnboardings);`;

    console.log("Query:", query); 

    var request = new sql.Request();
    request.query(query, function (err, recordset) {
      if (err) {
        console.log(err);
        res.status(500).send("Error executing query");
        return;
      }
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(recordset.recordsets[0]);
    });
  });
});



app.post("/getChecklists", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select CL.ListID, CL.OrgID, CL.ListName, CL.ListType, CL.DocTypeID, CL.Position, DT.DocTypeName from Checklists CL JOIN DocType DT on CL.DocTypeID=DT.DTID where CL.OrgID = '" +
      req.body.OrgID +
      "'",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.get("/getDocTypes", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select DTID, DocTypeName from DocType where Active=1",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.get("/getNewChecklistID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select isnull(max(ListID),0) + 1 as ID from Checklists",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/saveChecklist", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "insert into Checklists (ID,ListID,OrgID,ListName,ListType,DocTypeID,Position) values((select isnull(max(ID),0) + 1 from Checklists), " +
      req.body.ListID +
      ", " +
      req.body.OrgID +
      ", '" +
      req.body.ListName +
      "', 'Employee', " +
      req.body.docTypeID +
      "," +
      req.body.Position +
      ")",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.get("/deleteChecklist/:ID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "delete from Checklists where ListID=" + req.params.ID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.get("/getChecklistNames/:OrgID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select distinct ListID, ListName  from Checklists where OrgID=" +
      req.params.OrgID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/getWizardSteps", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select a.ListID,a.ListName,a.ListType,a.DocTypeID,a.Position,b.DocTypeName from Checklists a inner join DocType b on a.DocTypeID=b.DTID where a.OrgID=" +
      req.body.OrgID +
      " and a.ListID=" +
      req.body.ListID +
      " order by a.Position",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/createOnboarding", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "Insert into CurrentOnboardings (ID,OrgID,CreateDate,TraineeID,FirstName,LastName, StartDate, Status,PercentComplete,Active) OUTPUT Inserted.ID Values((select isnull(max(ID),0) + 1 from CurrentOnboardings)," +
      req.body.OrgID +
      ",(SELECT CAST(GETDATE() AS DATE))," +
      req.body.traineeID +
      ",'" +
      req.body.FirstName +
      "','" +
      req.body.LastName +
      "',(SELECT CAST(GETDATE() AS DATE)),1,0,1)",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/uploadOnboardDocument/:onboardID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    upload1(req, res, function (err) {
      if (err) {
        return res.json(err);
      }
      let FileName = req.file.originalname.split(".")[0];
      console.log("FileName", FileName);
      let FilePath = req.file.path;
      console.log("FilePath", FilePath);

      var request = new sql.Request();
      request.query(
        "Select UserName from Trainee where TraineeID=" + req.body.loggedUserId,
        function (err, recordset) {
          if (err) console.log(err);
          var loggedUserEmail = recordset.recordsets[0][0].UserName;
          var result = {
            flag: 1,
            loggedUserEmail: loggedUserEmail,
            FileName: FileName,
            FilePath: FilePath,
          };
          res.send(result);
          console.log("result", result);
        }
      );
    });
  });
});

app.post("/uploadReqOnboardDocument/:onboardID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    upload1(req, res, function (err) {
      if (err) {
        return res.json(err);
      }
      let FileName = req.file.originalname.split(".")[0];
      console.log("FileName", FileName);
      let FilePath = req.file.path;
      console.log("FilePath", FilePath);
      if (err) console.log(err);
      var result = {
        flag: 1,
        FileName: FileName,
        FilePath: FilePath,
      };
      res.send(result);
      console.log("result", result);
    });
  });
});

app.get("/getOnboardingDetails/:ID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select * from CurrentOnboardings where ID=" + req.params.ID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.get("/getOnboardingRequest/:ID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select * from OnboardingDocRequest where OnboardID=" +
      req.params.ID +
      "and isRequested=1",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/saveOnboardingRequest", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input("FileName", sql.VarChar, req.body.fileName);
    request.input("OnBoardID", sql.Int, req.body.onboardID);
    request.input("DocTypeName", sql.VarChar, req.body.docTypeName);
    request.input("DocTypeID", sql.Int, req.body.docTypeID);
    request.input("isRequested", sql.Int, req.body.requested);
    request.input("DocNotes", sql.VarChar, req.body.docNote);
    request.execute("InsertOnboardingDocRequest", function (err, recordset) {
      if (err) console.log(err);
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(recordset.recordsets[0]);
    });
  });
});

app.get("/updateOnboardStatus/:ID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "update CurrentOnboardings set Status=2 where ID=" + req.params.ID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.get("/updateOnboardStatus1/:ID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "update CurrentOnboardings set Status=0 where ID=" + req.params.ID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.get("/onboardSession/:ID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select * from OnboardingSession where SessionID='" +
      req.params.ID +
      " ' ",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/approveFiles", function (req, res) {
  const path =
    `C:/inetpub/vhosts/tresume.us/httpdocs/Content/Resume/` +
    req.body.traineeID;
  fs.mkdirSync(path, { recursive: true });
  fs.copyFile(req.body.oldPath, req.body.newPath, function (err) {
    if (err) throw err;
    sql.connect(config, function (err) {
      if (err) console.log(err);
      var request = new sql.Request();
      var otherinfo = Object.values(req.body.otherInfo).join(",");
      request.query(
        "INSERT INTO CandidateDocument_New(TraineeID, DocumentName, DocumentPath, Active, CreateTime, CreateBy, LastUpdateTime, LastUpdateBy, DocumentTypeID, DocStartDate, DocExpiryDate, OtherInfo) VALUES(" +
        req.body.traineeID +
        ", '" +
        req.body.FileName +
        "', '" +
        req.body.FilePath +
        "', 1, GETUTCDATE(), '" +
        req.body.loggedUserEmail +
        "', NULL, NULL, " +
        req.body.docType +
        ", '" +
        req.body.startDate +
        "', '" +
        req.body.expiryDate +
        "', '" +
        otherinfo +
        "')",
        function (err, recordset) {
          if (err) console.log(err);
          var request = new sql.Request();
          request.query(
            "update OnboardingDocRequest set Status=1 where OnboardID=" +
            req.body.onboardID +
            " and DocTypeID=" +
            req.body.docType,
            function (err, recordset) {
              if (err) console.log(err);
              res.send("Success");
            }
          );
        }
      );
    });
  });
});

app.post("/generateonboardSession", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input("OnBoardID", sql.Int, req.body.onboardID);
    request.input("OrgID", sql.Int, req.body.orgID);
    request.input("TraineeID", sql.Int, req.body.traineeID);
    request.execute("GenerateOnboardingSession", function (err, recordset) {
      if (err) console.log(err);
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(recordset.recordsets[0]);
    });
  });
});

app.post("/getDocPath", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select filepath from OnboardingDocRequest where OnboardID=" +
      req.body.onboardID +
      "and DocTypeID=" +
      req.body.docTypeID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post('/insertUploadFilepath', function (req, res) {

  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    let filepath = req.body.filepath ? req.body.filepath : ''
    request.query("insert into OnboardingDocRequest (ID,OnboardID,DocTypeName,DocTypeID,isRequested,Status,isViewed,isUpload,filepath,DocNotes,AdditionalChecklistID,AdditionalChecklistName) Values ((select isnull(max(ID),0) + 1 from OnboardingDocRequest)," + req.body.onboardID + ",'" + req.body.docTypeName + "'," + req.body.docTypeID + "," + req.body.requested + ",0,0,0,'" + filepath + "','" + req.body.docNote + "','" + req.body.additionalChecklistID + "','" + req.body.additionalChecklistName + "')",
      function (err, recordset) {
        if (err) console.log(err)
        var result = {
          flag: 1,
          result: recordset.recordsets[0]
        }
        res.send(recordset.recordsets[0]);
      });

  });
});

app.get("/download/:ID/:DocID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select filepath from OnboardingDocRequest where OnboardID=" +
      req.params.ID +
      "and DocTypeID=" +
      req.params.DocID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        let formattedPath = recordset.recordsets[0][0].filepath.replace(
          /\\/g,
          "/"
        );

        var file = formattedPath;
        var filename = path.basename(file);
        var mimetype = mime.getType(file);

        res.setHeader(
          "Content-disposition",
          "attachment; filename=" + filename
        );
        res.setHeader("Content-type", mimetype);

        var filestream = fs.createReadStream(file);
        filestream.pipe(res);
      }
    );
  });
});

app.get("/reviewdownload/:ID/:DocID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select SignedFilepath from OnboardingDocRequest where OnboardID=" +
      req.params.ID +
      "and DocTypeID=" +
      req.params.DocID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        console.log('result', result)
        let formattedPath = recordset.recordsets[0][0].SignedFilepath.replace(
          /\\/g,
          "/"
        );
        var file = formattedPath;
        var filename = path.basename(file);
        var mimetype = mime.getType(file);

        res.setHeader(
          "Content-disposition",
          "attachment; filename=" + filename
        );
        res.setHeader("Content-type", mimetype);

        var filestream = fs.createReadStream(file);
        filestream.pipe(res);
      }
    );
  });
});

app.get("/reviewFile/:ID/:DocID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select SignedFilepath from OnboardingDocRequest where OnboardID=" +
      req.params.ID +
      "and DocTypeID=" +
      req.params.DocID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        let formattedPath = recordset.recordsets[0][0].SignedFilepath.replace(
          /\\/g,
          "/"
        );
        var file = formattedPath;
        var filename = path.basename(file);
        var mimetype = mime.getType(file);

        res.setHeader(
          "Content-disposition",
          "attachment; filename=" + filename
        );
        res.setHeader("Content-type", mimetype);

        var buffer = fs.readFileSync(file);
        const blob = new Blob([buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        res.send(url);
      }
    );
  });
});

app.post("/updateDocStatus", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "update OnboardingDocRequest set isUpload=1 where OnboardID=" +
      req.body.onboardID +
      "and DocTypeID=" +
      req.body.docTypeID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        var request = new sql.Request();
        request.input("OnBoardID", sql.Int, req.body.onboardID);
        request.execute("setOnboardingPercent", function (err, recordset) { });
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/updateSignFilepath", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "update OnboardingDocRequest set SignedFilePath='" +
      req.body.filepath +
      "' where OnboardID=" +
      req.body.onboardID +
      " and DocTypeID=" +
      req.body.docTypeID,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/getInterviewsReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getInterviewsReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getBenchTrackerReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getBenchTrackerReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getPlacementsReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getPlacementsReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getLegalStatusReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getLegalStatusReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getH1BExpiryReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getH1BExpiryReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getBillableEmployeeReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getBillableEmployeeReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getNonH1BReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getNonH1BReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getDSRReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getDSRReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });

      });
  })
});

app.post('/getSiteVistReport', function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query("select OrganizationID from Trainee where TraineeID=" + req.body.traineeId, function (err, recordset) {
      if (err) console.log(err)
      var OrgID = recordset.recordsets[0][0].OrganizationID;
      request.input('OrgID', sql.Int, OrgID);
      request.execute('GetTraineeDetailsCopy',
        function (err, recordset) {
          if (err) console.log(err)
          var result = {
            flag: 1,
            result: recordset.recordsets[0]
          }
          res.send(result);
        });
    });
  });
});

app.post("/getPFAReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.execute("GetPFAReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getDocumentExpiryReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("GetDocumentExpiryReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/checkIfJobSeekerResumeExists", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      " select * from Trainee (nolock) where Username = '" +
      req.body.emailID +
      "' and Active = 1",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result.result);
      }
    );
  });
});

app.post("/createJobSeekerDetails", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    console.log("select OrganizationID, UserName from Trainee where TraineeID=" + req.body.traineeId);
    request.query(
      "select OrganizationID, UserName from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        console.log(recordset)
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        var UserName = recordset.recordsets[0][0].UserName;
        var skillsString = '';
        if (req.body.source == 'OptNation') {
          skillsString = req.body.skills;
        } else {
          skillsString = req.body.skills.join(",");
        }
        request.input("EmailID", sql.VarChar, req.body.emailID);
        request.input("FirstName", sql.VarChar, req.body.firstName);
        request.input("LastName", sql.VarChar, req.body.lastName);
        request.input("Title", sql.VarChar, req.body.title);
        request.input("CurrentLocation", sql.VarChar, req.body.currentLocation);
        request.input(
          "YearsOfExpInMonths",
          sql.VarChar,
          req.body.yearsOfExpInMonths
        );
        request.input("Skills", sql.VarChar, skillsString);
        request.input("HtmlResume", sql.VarChar, req.body.htmlResume);
        request.input("Source", sql.VarChar, req.body.source);
        request.input("ATSID", sql.VarChar, req.body.ATSID);
        request.input("UserOrganizationID", sql.Int, OrgID);
        request.input("CreateBy", sql.VarChar, UserName);
        request.input("harvest", sql.VarChar, '');
        request.input("ats_md5email", sql.VarChar, req.body.ATSID);
        request.execute("CreateJobSeekerProfile", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            // result: recordset.recordsets[0]
          };
          res.send(result);
        });
      });
  });
});

app.post("/checkIfProfileMigrated", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select ATSID,MigrateProfileID,CreateBy,CreateTime from Trainee (nolock) where Role='TRESUMEUSER' AND Source='" +
      req.body.source +
      "' AND UserOrganizationID=(Select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId +
      ") AND Active=1 order by CreateTime desc; ",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result.result);
      }
    );
  });
});

/* app.post("/getCBAuthToken", function (req, res) {
  axios
    .post("https://auth.careerbuilder.com/connect/token", {
      grant_type: "refresh_token",
      client_id: "C8b18a43c",
      client_secret:
        "reMVgeKh9WNEMmeZrF2RUhqLQa8WrZF/ye7zButWAe9EFGs2oTxShTRSQIXa9q+lo7n3Tt0giOTxuHZyowwswQ==",
      refresh_token:
        "B98E9CDE88F53EB35F4FDE0E5423220F6DB9A96313BAC3CFB4FB2FC2BD3B0787-1",
      scope:"offline_access"
    })
    .then((result) => {
      res.send(result.data);
    })
    .catch((error) => {
      res.send(error);
    });
}); */

app.post("/getCBAuthToken", function (req, res) {
  const requestData = {
    grant_type: "refresh_token",
    client_id: "Cd2543bf6",
    client_secret: "mmYQ7+pkLk1VQq+to5Pc1t+4agJ8f/WhyhSccR5yHdhfZhdFgYdI6mLyZhmNmWZCxg6D7PAWXuS5VaJENtlVvw==",
    refresh_token: "puseyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkExMjhHQ00ifQ.Xb8EU7DMn_4M0ygsU4pGvvHqxpC5ykXZV2fizJbajC3erFuzR5waTmJ6hDD9XQgBJOl78rPj2JYkjDtVXP0ScgKUo3PiCpMGfyFislpDNzs8-3SeGMW1-rFwRRdY0HSm0W8jwRaxSnI4pUV04MyILiP2zGvCtnQwp0JHiUNaoyVzC1-1ksop44EcYTV5whx5UdGVrdg7dM_2LCyX4QGuUIo7WFeaQ_xwwieIWV2H-BszX94NJkX8OntK2k9MpWxCQn2WVQC8v1ix3MNrCh4hPA_CT_RbOYryAnn5kqHWCfrWs2u5AEU_KMCb8GNJogvwqOcDFjTWofNCTzcN9qHcKg.vRMRoQKU5lnpyJRF.XBMvHL1l_RDPsHmfrpY_rsYBh-0jQrTyprbhSPJ7CHhzWi5iYjGF5tOF30-l2MFP_cMFqy1Ra2s2ewZzUT7jw_fxs2ALc_ApCios9WV2K63uyhXOR5WzSzJKOV352qn5z6w9alzdVmeuqXZjgvGOO6Sukptxaj5xGjls4H1A7SpZ0S31wJ0rLE2YICJrLAZxySmpZLjP1fdCVKPXUl3pHmGL7efnRUKrjPeTkH-YA4d61nENv7MiUwJ6QUw5nKZoT4WCU8LK_O_qDfz7sqk6n-F8DTMQS_lCuJf_sSh18MvD92hJSDxBcrEB8cScvzpLLBPWKlb6HLC1E7zY3eZpPH4.5HD_XVfaiR9x--fEZpaLRA",
    scope: "offline_access"
  };

  const formData = qs.stringify(requestData);

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  axios
    .post("https://api.careerbuilder.com/oauth/token", formData, config)
    .then((result) => {
      res.send(result.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.post("/CBSearch", function (req, res) {
  let response = null;
  const options = {
    url: "https://api.careerbuilder.com/consumer/edge/search",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-US,en;q=0.8",
      "content-encoding": "gzip",
      Authorization: `Bearer ${req.body.token}`,
    },
    qs: {
      Query: req.body.query,
      Page: req.body.page,
      ResultsPerPage: req.body.resultsPerPage,
      Locations: req.body.locations,
      LocationRadius: req.body.locationRadius,
      JobTitle: req.body.jobTitle,
      Filter: req.body.filters,
      FacetFilter: req.body.facetFilter,
    },
    gzip: true,
  };

  request(options, (err, res1, body) => {
    if (err) {
      return console.log(err);
    }
    response = JSON.parse(res1.body);
    res.send(response);
  });
});

app.post("/GetCBProfileDetails", function (req, res) {
  let response = null;
  const options = {
    url:
      "https://api.careerbuilder.com/consumer/edge/profiles?EdgeID=" +
      req.body.edgeID,
    method: "GET",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-US,en;q=0.8",
      "content-encoding": "gzip",
      Authorization: `Bearer ${req.body.token}`,
    },
    gzip: true,
  };
  request(options, (err, res1, body) => {
    if (err) {
      return console.log(err);
    }
    response = JSON.parse(res1.body);
    res.send(response.data);
  });
});

app.post("/GetCBResumePreview", function (req, res) {
  let response = null;
  const options = {
    url:
      "https://api.careerbuilder.com/consumer/edge/profiles/" +
      req.body.edgeID +
      "/Resumes",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-US,en;q=0.8",
      "content-encoding": "gzip",
      Authorization: `Bearer ${req.body.token}`,
    },
    gzip: true,
  };

  request(options, (err, res1, body) => {
    if (err) {
      return console.log(err);
    }
    response = JSON.parse(res1.body);
    console.log(response);
    if (response.data) {
      const options2 = {
        url:
          "https://api.careerbuilder.com/consumer/edge/profiles/" +
          req.body.edgeID +
          "/Resumes/RDB/" +
          response.data[0].ResumeDID +
          "/Preview",
        method: "GET",
        headers: {
          Accept: "text/html",
          /* 'Access-Control-Allow-Origin': "*",
                    "accept-encoding": 'gzip, deflate',
                    'accept-language': 'en-US,en;q=0.8',
                    'content-encoding': 'gzip', */
          Authorization: `Bearer ${req.body.token}`,
        },
        gzip: true,
      };
      request(options2, (err2, res2, body) => {
        if (err) {
          return console.log(err2);
        }
        res.send({ text: res2.body });
      });
    }
  });
});

app.post("/downloadCBResume", function (req, res) {
  let response = null;
  const options = {
    url:
      "https://api.careerbuilder.com/consumer/edge/profiles/" +
      req.body.edgeID +
      "/Resumes",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-US,en;q=0.8",
      "content-encoding": "gzip",
      Authorization: `Bearer ${req.body.token}`,
    },
    gzip: true,
  };

  request(options, (err, res1, body) => {
    if (err) {
      return console.log(err);
    }
    response = JSON.parse(res1.body);
    if (response.data) {
      const options2 = {
        url:
          "https://api.careerbuilder.com/consumer/edge/profiles/" +
          req.body.edgeID +
          "/Resumes/RDB/" +
          response.data[0].ResumeDID +
          "/Document",
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${req.body.token}`,
        },
        gzip: true,
      };
      request(options2, (err2, res2, body) => {
        if (err) {
          return console.log(err2);
        }
        response = JSON.parse(res2.body);
        const base64File = response.data.Content;
        const buffer = Buffer.from(base64File, "base64");
        //fs.writeFile('D:/Code/SV Report/' + response.data.Filename, buffer, (error) => {
        fs.writeFile(
          "C:/inetpub/vhosts/tresume.us/httpdocs/Content/" +
          response.data.Filename,
          buffer,
          (error) => {
            if (error) {
              console.error(error);
              res.status(500).send("Error saving file");
              return;
            }
          }
        );
        sql.connect(config, function (err) {
          var request = new sql.Request();
          request.input("FileName", sql.VarChar, response.data.Filename);
          request.input(
            "FileLocation",
            sql.VarChar,
            "Content/" + response.data.Filename
          );
          request.input("UserName", sql.VarChar, req.body.userName);
          request.input("Email", sql.VarChar, req.body.emailID);
          request.execute("InsertJobBoardResume", function (err, recordset) {
            if (err) console.log(err);
            res.send(response.data);
          });
        });
      });
    }
  });
});

app.post("/saveResume", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input("FileName", sql.VarChar, req.body.Filename);
    request.input("FileLocation", sql.VarChar, "Content/" + req.body.Filename);
    request.input("UserName", sql.VarChar, req.body.userName);
    request.input("Email", sql.VarChar, req.body.emailID);
    request.execute("InsertJobBoardResume", function (err, recordset) {
      const base64File = req.body.Content;
      const buffer = Buffer.from(base64File, "base64");
      const writeStream = fs.createWriteStream(
        "C:/inetpub/vhosts/tresume.us/httpdocs/Content/" + req.body.Filename
      );
      writeStream.write(buffer);
      writeStream.end();
      if (err) console.log(err);
    });
  });
});

app.post("/jobBoardAuditLog", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    let filepath = req.body.filepath ? req.body.filepath : "";
    request.query(
      "insert into JobBoardAudit (JobBoardSource,Query,DateLogged,UserName) Values ('" +
      req.body.jobBoard +
      "','" +
      req.body.query +
      "','" +
      req.body.dateTime +
      "','" +
      req.body.userName +
      "')",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      }
    );
  });
});

app.post("/getJobBoardAuditReport", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      "select OrganizationID from Trainee where TraineeID=" +
      req.body.traineeId,
      function (err, recordset) {
        if (err) console.log(err);
        var OrgID = recordset.recordsets[0][0].OrganizationID;
        request.input("OrgID", sql.Int, OrgID);
        request.input("startDate", sql.VarChar, req.body.startDate);
        request.input("endDate", sql.VarChar, req.body.endDate);
        request.execute("getJobBoardAuditReport", function (err, recordset) {
          if (err) console.log(err);
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        });
      }
    );
  });
});

app.post("/getJobBoards", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input("TraineeID", sql.Int, req.body.traineeID);
    request.execute("getJobBoards", function (err, recordset) {
      if (err) console.log(err);
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    });
  });
});

app.post("/getJobBoardsUsage", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      `SELECT JobboardSource, count(JobboardSource) as count
                        FROM JobBoardAudit
                        GROUP BY JobboardSource;`,
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      }
    );
  });
});

app.post("/getResumePath", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      `SELECT ResumePath, ResumeName
                        FROM Resumes
                        WHERE EmailID='` +
      req.body.userName +
      `'`,
      function (err, recordset) {
        if (err) console.log(err);
        var result = recordset.recordsets[0];
        res.send(result);
      }
    );
  });
});

app.post("/getCBQuota", function (req, res) {
  let response = null;
  const options = {
    url: "https://api.careerbuilder.com/consumer/edge/Auth/Quota",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-US,en;q=0.8",
      "content-encoding": "gzip",
      Authorization: `Bearer ${req.body.token}`,
    },
    gzip: true,
  };

  request(options, (err, res1, body) => {
    if (err) {
      return console.log(err);
    }
    response = JSON.parse(res1.body);
    res.send(response);
  });
});

/* app.post('/getMonsterAuthToken', function (req, res) {
    axios.post('https://sso.monster.com/core/connect/token',
        {
            grant_type: 'client_credentials',
            client_id: 'xtresume_mpsx01',
            client_secret: 'f5u0Lu4AwqcK6NMM',
            scope: 'GatewayAccess'
        })
        .then(result => {
            res.send(result.data);
        })
        .catch(error => {
            res.send(error);
        })
}); */

app.post("/getMonsterSearch", function (req, res) {
  let response = null;
  const options = {
    url: "https://api.jobs.com/v2/candidates/queries",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-US,en;q=0.8",
      "content-encoding": "gzip",
      /* 'Authorization': 'bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjJianNBdmk1MmtqRDFybl9qaG5ZUFVoanBjcyIsImtpZCI6IjJianNBdmk1MmtqRDFybl9qaG5ZUFVoanBjcyJ9.eyJpc3MiOiJodHRwczovL3Nzby5tb25zdGVyLmNvbSIsImF1ZCI6Imh0dHBzOi8vc3NvLm1vbnN0ZXIuY29tL3Jlc291cmNlcyIsImV4cCI6MTY2Nzg4MzM4MSwibmJmIjoxNjY3Nzk2OTgxLCJjbGllbnRfaWQiOiJ4dHJlc3VtZV9tcHN4MDEiLCJjbGllbnRfQ2xpZW50QXV0aG9yaXplZEVuZHBvaW50cyI6IkNhbmRpZGF0ZVNlYXJjaCIsImNsaWVudF9Nb25zdGVyVXNlcklkIjoiMzE5NTU3MzI0Iiwic2NvcGUiOiJHYXRld2F5QWNjZXNzIn0.2IaOlqPRkkQ10fQvy5mmIwsNH_8nReCsVh4Ka2KwxqeeXJHY1Lnr_WB0RStotrhuj9Rb701GgcU8AGSQ6bcf48QHOm61tdJv5vlSjQVxHRk0XAlODqk5_D-VvyK_WgQdemXhex0XeiMs9rpKK7xRadNfdQth23SZs77R-0mQKO1bwnGtlLe731Q5St-f5OVA7u0fhpXs22afVNDhq5Y_8XszXvhJrelVuUecvMMXLJrV3jNttoKDkUL8KiitLOntFMoooQS7tbWuQyNG4acRf32b8mRBt5Rm7EJo7sbm3dTaW-QPrM3Ub1jyuuI3UwlHRtCRQKkNOaJbXLyLYqgFrQ' */
      Authorization: `Bearer ${req.body.token}`,
    },
    gzip: true,
    qs: {
      page: req.body.page,
      perPage: 10,
    },
  };

  if (req.body.searchType == "jobDetail") {
    options.body = JSON.stringify({
      country: "US",
      searchType: req.body.searchType,
      jobDetail: {
        jobTitle: req.body.jobTitle,
        jobDescription: req.body.jobDesc,
        locations: [
          {
            locationExpression: req.body.location,
            radius: req.body.radius,
          },
        ],
      },
    });
  } else {
    options.body = JSON.stringify(req.body.searchRequest);
    //console.log('options.body', options.body)
  }

  request(options, (err, res1, body) => {
    if (err) {
      return console.log(err);
    }
    try {
      console.log('res1.body', res1.body)
      response = JSON.parse(res1.body);
      res.send(response);
    }
    catch (error) {
      console.error('Error parsing JSON:', error);
    }
    //res.send(options.body);
  });
});

app.post("/getMonsterCandidateResume", function (req, res) {
  let response = null;
  const options = {
    url: "https://api.jobs.com/v2/candidates/" + req.body.resumeID,
    method: "GET",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-US,en;q=0.8",
      "content-encoding": "gzip",
      Authorization: `Bearer ${req.body.token}`,
    },
    gzip: true,
    qs: {
      resumeBoardId: 1,
      verbose: true,
    },
  };

  request(options, (err, res1, body) => {
    if (err) {
      return console.log(err);
    }
    response = JSON.parse(res1.body);
    res.send(response);
  });
});

app.post("/getNotSubmittedReport", function (req, res) {
  sql1.connect(config1, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    console.log(req.body);
    request.query(
      "select tsm.FromDate,tsm.ToDate,r.Username, tsm.UserID from TimeSheetMaster tsm inner join Registration r on tsm.userID = r.RegistrationID where tsm.FromDate BETWEEN '" +
      req.body.fromDate +
      "' AND '" +
      req.body.endDate +
      "' and r.OrganizationId=" +
      req.body.OrganizationId,
      function (err, recordset) {
        if (err) console.log(err);
        const fromDate = req.body.fromDate;
        const endDate = req.body.endDate;
        const filteredResult = checkTimeSheetSubmission(
          fromDate,
          endDate,
          recordset.recordsets[0]
        );
        request.query(
          "select * from Registration where RegistrationID  NOT IN " +
          "(" +
          filteredResult +
          ") and OrganizationId=" +
          req.body.OrganizationId,
          function (err, recordSet) {
            if (err) console.log(err);
            var result = {
              flag: 1,
              result: recordSet.recordsets[0],
            };
            res.send(result);
          }
        );
      }
    );
  });
});

app.post("/getSubmittedRatio", function (req, res) {
  sql1.connect(config1, function (err) {
    if (err) console.log(err);
    console.log(req.body);
    var request = new sql1.Request();
    const now = new Date(); // the date to start counting from
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var previousSunday = new Date(
      today.setDate(today.getDate() - today.getDay() - 7)
    )
      .toISOString()
      .slice(0, 10);
    request.query(
      "select tsm.FromDate,tsm.ToDate,tsm.UserID from TimeSheetMaster tsm  where tsm.FromDate='" +
      previousSunday +
      "'",
      function (err, recordset) {
        if (err) console.log(err);
        const filteredResult =
          recordset == undefined ? recordset.recordsets[0].length : 0;
        request.query(
          "select Name,LegalStatus,EmailID from Registration where RoleID=1 and CreatedOn <'" +
          previousSunday +
          "' and OrganizationId=" +
          req.body.OrganizationId,
          function (err, rex) {
            if (err) console.log(err);
            var result = {
              flag: 1,
              result: {
                completed: (filteredResult / rex.recordsets[0].length) * 100,
                incomplete:
                  ((rex.recordsets[0].length - filteredResult) /
                    rex.recordsets[0].length) *
                  100,
              },
            };

            res.send(result);
          }
        );
      }
    );
  });
});

//For Division and Division Audit Page

app.post("/createdivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    const now = new Date(); // the date to start counting from
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var sql =
      "INSERT INTO Org_Division(Orgid,DivisionName,dice,cb,monster,clearancejob,active,createtime,createby,type)VALUES( '" +
      req.body.OrgID +
      "','" +
      req.body.DivisionName +
      "','" +
      req.body.dice +
      "','" +
      req.body.cb +
      "','" +
      req.body.monster +
      "',0,1,GETDATE(),'" +
      req.body.userName +
      "','" +
      req.body.type +
      "')";
    console.log(sql);
    request.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
      console.log("1 record inserted");
    });
  });
});

app.post("/updatedivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql =
      "UPDATE Org_Division SET dice = '" +
      req.body.dice +
      "' , cb='" +
      req.body.cb +
      "',monster='" +
      req.body.monster +
      "' WHERE id = '" +
      req.body.id +
      "'";
    console.log(sql);
    request.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
      console.log("1 record Updated");
    });
  });
});

app.post("/deletedivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql = "DELETE FROM Org_Division WHERE id = '" + req.body.id + "'";
    console.log(sql);
    request.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
      console.log("1 record Deleted");
    });
  });
});

//Division and audit
app.post("/fetchrecruiter", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();

    var sql =
      "INSERT INTO Org_Division(Orgid,DivisionName,dice,cb,monster,clearancejob,active,createtime,createby,type)VALUES( '" +
      req.body.OrgID +
      "','" +
      req.body.DivisionName +
      "',0,0,0,0,1,'','" +
      req.body.userName +
      "',0)";
  });
});

app.post("/addrectodivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    const now = new Date(); // the date to start counting from
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var sql =
      "INSERT INTO Org_Division(Orgid,DivisionName,dice,cb,monster,clearancejob,active,createtime,createby,type)VALUES( '" +
      req.body.OrgID +
      "','" +
      req.body.DivisionName +
      "',0,0,0,0,1,GETDATE(),'" +
      req.body.userName +
      "',0)";
    console.log(sql);
    request.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
      console.log("1 record inserted");
    });
  });
});

app.post("/fetchrecruiterfordivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    const now = new Date(); // the date to start counting from
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var sql =
      "SELECT * FROM Trainee ud JOIN MemberDetails m ON m.useremail = ud.UserName WHERE m.orgid =" +
      req.body.OrgID;
    console.log(sql);
    request.query(sql, function (err, recordset) {
      if (err) throw err;
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    });
  });
});

app.post("/fetchrecruiterbyorg", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    const now = new Date(); // the date to start counting from
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var sql = "select * from Org_Division WHERE Orgid =" + req.body.OrgID;
    console.log(sql);
    request.query(sql, function (err, recordset) {
      if (err) throw err;
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    });
  });
});

app.post("/fetchdivisionbyorg", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql =
      "SELECT  T.FirstName, T.LastName, T.Traineeid, OD.DivisionName, T.UserName, COALESCE(T.monster, 0) AS monster, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 3 AND createtime >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AND createtime <= GETDATE()) AS monsterused, COALESCE(T.cb, 0) AS cb, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 4 AND createtime >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AND createtime <= GETDATE()) AS cbused, COALESCE(T.dice, 0) AS dice, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 2 AND createtime >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AND createtime <= GETDATE()) AS diceused FROM Trainee AS T INNER JOIN org_division AS OD ON T.Org_Div = OD.id WHERE T.organizationid = " + req.body.OrgID + " ORDER BY OD.DivisionName;";
    console.log(sql);
    request.query(sql, function (err, recordset) {
      if (err) throw err;
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    });
  });
});

app.post("/addrecruitertodiv", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql =
      "update Trainee set Org_Div = " +
      req.body.divID +
      " where TraineeID =" +
      req.body.recID;
    console.log(sql);
    request.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
      console.log("1 record updated");
    });
  });
});

//For Job Board Division

app.post("/fetchdvisioncredit", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql =
      "select od.*,ud.cb as ucb,ud.dice as udice,ud.monster as umonster,ud.OptNation as uOptNation from Org_Division od JOIN Trainee ud ON ud.Org_Div = od.id where ud.UserName ='" +
      req.body.userName +
      "'";
    console.log(sql);
    request.query(sql, function (err, recordset) {
      if (err) throw err;
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    });
  });
});

app.post("/adddivisionaudit", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql =
      "INSERT INTO Division_audit(divisionid,jobboardid,username,ipaddress,candidateemail,status,CreateTime)VALUES('" +
      req.body.divID +
      "','" +
      req.body.jobID +
      "','" +
      req.body.userName +
      "','" +
      req.body.ipaddress +
      "','" +
      req.body.candidateemail +
      "',1,GETDATE())";
    console.log(sql);
    request.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
      console.log("1 record updated");
    });
  });
});

app.post("/getclientipaddress", function (req, res) {
  let response = null;
  const options = {
    url: "https://api.ipify.org/",
    method: "GET",
  };

  request(options, (err, res1, body) => {
    if (err) {
      return console.log(err);
    }
    res.send(res1);
  });
});

app.post("/fetchusage", function (req, res) {
  sql1.connect(config, function (err) {
    const today = new Date();
    var enddate = '';
    if (req.body.type == 1) {
      var enddate = "DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)";

    } else {
      var enddate = "DATEFROMPARTS(YEAR(GETDATE()), 1, 1)";
    }
    console.log(enddate);
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql = "SELECT COUNT(*) AS row_count FROM Division_audit WHERE Jobboardid = " + req.body.jobID + " AND CreateTime >= " + enddate + " AND username ='" + req.body.userName + "'";
    console.log("Fetch Ussage:" + sql);
    request.query(sql, function (err, recordset) {
      if (err) throw err;
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result)
    });
  })
});

app.post('/addPlacement', function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    const billType = req.body.BillType ? 1 : 0;
    let poEndDate = req.body.POEndDate;
    if (poEndDate === '') {
      poEndDate = null;
    }
    let poStartDate = req.body.POStartDate;
    if (poStartDate === '') {
      poStartDate = null;
    }
    let datePlaced = req.body.DatePlaced;
    if (datePlaced === '') {
      datePlaced = null;
    }
    request.input('PlacementId', sql.Int, req.body.PlacementID)
    request.input('TraineeID', sql.Int, req.body.TraineeID)
    request.input('Notes', sql.NVarChar(sql.MAX), req.body.Notes)
    request.input('BillRate', sql.Int(50), req.body.BillRate)
    request.input('BillType', sql.Int, billType)
    request.input('CreateBy', sql.NVarChar(100), req.body.CreateBy)
    request.input('MarketerName', sql.Int, req.body.MarketerName)
    request.input('ClientState', sql.NVarChar(50), req.body.ClientState)
    request.input('StartDate', sql.Date, req.body.StartDate)
    request.input('EndDate', sql.Date, req.body.EndDate)
    request.input('DatePlaced', sql.Date, datePlaced)
    request.input('Title', sql.NVarChar(50), req.body.Title)
    request.input('WorkEmailID', sql.NVarChar(100), req.body.CandidateEmailId)
    request.input('ClientName', sql.NVarChar(100), req.body.ClientName)
    request.input('POStartDate', sql.Date, poStartDate)
    request.input('POEndDate', sql.Date, poEndDate)
    request.input('ClientManagerName', sql.NVarChar(50), req.body.ClientManagerName)
    request.input('ClientEmail', sql.NVarChar(100), req.body.ClientEmail)
    request.input('ClientPhone', sql.NVarChar(20), req.body.ClientPhone)
    request.input('ClientAddress', sql.NVarChar(200), req.body.ClientAddress)
    request.input('VendorName', sql.NVarChar(100), req.body.VendorName)
    request.input('VendorContact', sql.NVarChar(50), req.body.VendorContact)
    request.input('VendorEmail', sql.NVarChar(100), req.body.VendorEmail)
    request.input('VendorPhone', sql.NVarChar(20), req.body.VendorPhone)
    request.input('VendorAddress', sql.NVarChar(200), req.body.VendorAddress)
    request.input('SubVendorName', sql.NVarChar(100), req.body.SubVendorName)
    request.input('SubVendorContact', sql.NVarChar(50), req.body.SubVendorContact)
    request.input('SubVendorEmail', sql.NVarChar(100), req.body.SubVendorEmail)
    request.input('SubVendorPhone', sql.NVarChar(20), req.body.SubVendorPhone)
    request.input('SubVendorAddress', sql.NVarChar(200), req.body.SubVendorAddress)
    request.input('PrimaryPlacement', sql.Int, req.body.PrimaryPlacement)
    request.execute('UpdatePlacement',
      function (err, recordset) {
        if (err) console.log(err)
        var result = {
          flag: 1,
          result: recordset.recordsets[0]
        }
        res.send(result);
      });
  });
});

app.post('/getMarketerNames', async (req, res) => {

  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('orgID', sql.Int, req.body.orgID)
    request.input('keyword', sql.NVarChar(100), req.body.keyword)
    request.execute('sp_SearchMarketerNames',
      function (err, recordset) {
        if (err) console.log(err)
        console.log(recordset);
        if(recordset.recordsets.length == 0){
          var result = {
            flag: 2,
            result: []
          }
        } else{
          var result = {
            flag: 1,
            result: recordset.recordsets[0]
          }
        }

        res.send(result);
      });
  });
});

app.post('/getTresumedata', function (req, res) {

  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();

    var sql = `SELECT TOP 100 TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy,YearsOfExpInMonths, skill, LegalStatus, UserOrganizationID, CurrentLocation, Title as [TraineeTitle], ISNULL(LegalStatus,'') as LegalStatus , ISNULL(CONVERT(NVARCHAR(10),CreateTime,101), '1900-01-01T00:00:00') as LastUpdateTime
            FROM Trainee (NOLOCK)
            WHERE (Talentpool IS NULL OR Talentpool = 0)  AND active =1
            AND Role='TRESUMEUSER' AND ProfileStatus = 'READY'
            AND (Skill LIKE '%` + req.body.keyword + `%' OR Title LIKE '%` + req.body.keyword + `%')`
    if (req.body.location) {
      sql += `AND
                ((CurrentLocation IN (Select distinct Stateabbr FROM USAZipCodeNew WHERE State ='`+ req.body.location + `' OR City = '` + req.body.location + `' OR ZipCode = '` + req.body.location + `')) or
                (CurrentLocation IN (Select distinct State FROM USAZipCodeNew WHERE State = '`+ req.body.location + `' OR City = '` + req.body.location + `' OR ZipCode = '` + req.body.location + `')))`
    }
    sql += `ORDER BY ISNULL(CreateTime, '1900-01-01T00:00:00') DESC`
    request.query(sql, function (err, recordset) {
      if (err) console.log(err)
      var result = {
        flag: 1,
        result: recordset.recordsets[0]
      }
      res.send(result);
    });
  });
});

app.post('/atsmigrateprofile', function (req, res) {

  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query("update Trainee set Collab = 1 where TraineeID = " + req.body.traineeId, function (err, recordset) {
      if (err) console.log(err)
      var result = {
        flag: 1,
        result: recordset.recordsets[0]
      }
      res.send(result);
    });

  });
});

app.post('/senddivisionerrormail', async (req, res) => {
  // try {
  //   const pool = await sql.connect(config);
  //   const username = req.body.username;
  //   const divid = req.body.divid;
  //   const jobboardid = req.body.jobID;
  //   const JobboardName = req.body.jobboardName;
  //   const percentage = Math.round(req.body.percentage);
  //   var divisionNotificationsQuery = '';
  //   var insertQuery = '';

  //   if (percentage >= 100) {
  //     divisionNotificationsQuery = `SELECT COUNT(*) AS row_count FROM division_notification WHERE divid = '${divid}' AND jobboardid = '${jobboardid}' AND type=2 AND createtime >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)`;
  //   } else {
  //     divisionNotificationsQuery = `SELECT COUNT(*) AS row_count FROM division_notification WHERE divid = '${divid}' AND jobboardid = '${jobboardid}' AND type=1 AND createtime >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)`;
  //   }

  //   console.log(divisionNotificationsQuery);
  //   var divisionNotificationsResult = await pool.request().query(divisionNotificationsQuery);
  //   console.log(divisionNotificationsResult);
  //   var divisionNotifications = divisionNotificationsResult.recordset[0].row_count;

  //   if (divisionNotifications == "0") {
  //     var subject = "Alert Message for " + JobboardName;
  //     var text = "Dear Team,<br><br>";
  //     text +=
  //       "We are writing to inform you that your " +
  //       JobboardName +
  //       " job board credits have reached the limit of " + percentage + "% for this month.<br><br>";
  //     text +=
  //       "If you wish to increase your credits limit, please contact your Organization Admin. They will be happy to assist you with finding the tailormade best plan for your needs.<br><br>";
  //     text +=
  //       "Thank you for choosing Tresume as your hiring partner. We appreciate your business and look forward to serving you the best again.";

  //     const mailData = {
  //       from: "support@tresume.us",
  //       to: username,
  //       subject: subject,
  //       html: text,
  //       cc: [],
  //     };

  //     const bccQuery = `SELECT username FROM trainee WHERE org_div = '${divid}'`;

  //     pool.request().query(bccQuery)
  //       .then((result) => {
  //         const bccRecipients = result.recordset.map((record) => record.username);
  //         mailData.bcc = bccRecipients;

  //         // Send the email with BCC recipients
  //         transporter.sendMail(mailData, (error, info) => {
  //           if (error) {
  //             return console.log(error);
  //           }
  //           if (percentage >= 100) {
  //             insertQuery = `INSERT INTO division_notification (divid, createtime, type, status, jobboardid)
  //                             VALUES ('${divid}', GETDATE(), '2', '1', '${jobboardid}')`;
  //           } else {
  //             insertQuery = `INSERT INTO division_notification (divid, createtime, type, status, jobboardid)
  //                             VALUES ('${divid}', GETDATE(), '1', '1', '${jobboardid}')`;
  //           }
  //           console.log(insertQuery);
  //           pool.request().query(insertQuery)
  //             .then(() => {
  //               // Prepare the response object
  //               var result = {
  //                 flag: 1,
  //                 result: "Mail sent Successfully",
  //               };

  //               res.json(result);
  //             })
  //             .catch((error) => {
  //               console.error("Error inserting record:", error);
  //               res.status(500).send("Error inserting record");
  //             });
  //         });
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         res.status(500).send({ message: "Error retrieving BCC recipients" });
  //       });
  //   } else {
  //     // Prepare the response object
  //     var result = {
  //       flag: 1,
  //       result: "Mail not sent, division_notification already exists",
  //     };

  //     res.json(result);
  //   }
  // } catch (error) {
  //   console.error("Error:", error.message);
  //   res.status(500).send("Internal Server Error");
  // }
});

app.post("/getJoobleSearch", function (req, res) {
  console.log('req.keywords', req.keywords)

  axios
    .post("https://jooble.org/api/adde971d-e417-460d-bac2-057246c5993f", {
      keywords: req.body.keywords,
      location: req.body.location
    })
    .then((result) => {
      res.send(result.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.post("/checkmd5resume", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      " select * from Trainee (nolock) where ats_md5email = '" +
      req.body.md5emailID +
      "' and Active = 1",
      function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result.result);
      }
    );
  });
});

app.post('/getOnboardingCount', function (req, res) {

  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('OrgID', sql.Int, req.body.OrgID);
    request.execute('GetOnboardingCounts', function (err, recordset) {
      if (err) console.log(err)
      var result = {
        flag: 1,
        result: recordset.recordsets[0]
      }
      res.send(recordset.recordsets[0]);
    });

  });
});

function parsePhraseToQuery(phrase) {
  const words = phrase.split(/(\(|\)|\b(?:and|or)\b)/i).filter(word => word.trim() !== '').map(word => word.replace(/[\'\"]/g, ''));

  let query = '';
  let insideParentheses = false;

  for (let i = 0; i < words.length; i++) {
    console.log(i + '=' + words[i]);
    if (words[i].trim() === '(') {
      query += '(';
    } else if (words[i].trim() === ')') {
      query += ')';
    } else if (words[i].trim() === 'AND') {
      query += ' AND ';
    } else if (words[i].trim() === 'OR') {
      query += ' OR ';
    } else if (words[i].trim() === 'and') {
      query += ' AND ';
    } else if (words[i].trim() === 'or') {
      query += ' OR ';
    } else {
      query += `skill like '%${words[i].trim()}%' OR Title like '%${words[i].trim()}%' OR firstname like '%${words[i].trim()}%' OR lastname like '%${words[i].trim()}%'`;
    }
  }

  return query.replace(/AND\s+OR/g, 'OR');
}

app.post("/getResumes2", function (req, res) {
  try {
    var traineeId = req.body.traineeId;
    var keyword = parsePhraseToQuery(req.body.keyword);
    var location = req.body.location;
    var title = req.body.jobTitle;
    var daysWithin = req.body.daysWithin;
    var yearsOfExp = req.body.yearsOfExp;
    var yearsOfExpmin = req.body.yearsOfExpmin;
    var Jobboard = req.body.Jobboard.value;
    var OrgID = req.body.OrgID;
    var recruiter = req.body.recruiter;
    console.log(Jobboard);

    sql.connect(config, function (err) {
      if (err) {
        console.error(err);
        return res.send({
          flag: 0,
          message: "Database connection error.",
        });
      }
      console.log();
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
        traineeId,
        function (err, recordset) {
          if (err) {
            console.error(err);
            return res.send({
              flag: 0,
              message: "Error retrieving OrganizationID.",
            });
          }

          try {
            // var OrgID = recordset.recordsets[0][0].OrganizationID;
            var sql =
              `SELECT TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy, YearsOfExpInMonths,
                ISNULL(YearsOfExpInMonths,0) [YRSEXP],
                LegalStatus, UserOrganizationID, CurrentLocation, Title as [TraineeTitle], ISNULL(LegalStatus,'') ,
                ISNULL(CONVERT(NVARCHAR(10),CreateTime,101), '1900-01-01T00:00:00') as LastUpdateTime,
                ISNULL(YearsOfExpInMonths,0), Source, Collab,skill,Notes,
                ( SELECT TOP 1 (R.FirstName + ' ' + R.LastName) FROM Trainee R WHERE R.UserName = T.CreateBy) AS Recruiter
            FROM Trainee T (NOLOCK)
                WHERE (Talentpool IS NULL OR Talentpool = 0)`;
            // sql +=  `AND UserOrganizationID = '` +OrgID;
            sql += ` AND active =1 AND Role='TRESUMEUSER' AND ProfileStatus = 'READY'`;

            sql += ` AND (` + keyword + `)`;
            if (location) {
              sql += ` AND CurrentLocation LIKE '%` + location + `%'`;
            }
            if (title) {
              sql += ` OR Title LIKE '%` + title + `%'`;
            }
            if (daysWithin) {
              sql += ` AND CreateTime >= DATEADD(day, -` + daysWithin + `, GETDATE())`;
            }
            if (yearsOfExpmin) {
              if (yearsOfExp) {
                sql += `AND YearsOfExpInMonths BETWEEN ` + yearsOfExpmin * 12 + ` AND ` + yearsOfExp * 12;
              } else {
                sql += `AND YearsOfExpInMonths >= ` + yearsOfExpmin * 12;
              }
            }
            if (Jobboard) {
              if (Jobboard != 'all') {
                sql += ` AND Source LIKE '%` + Jobboard + `%'`;
              }
            }
            sql += `AND T.UserOrganizationID = '` + OrgID + `'`;

            if (recruiter != 0) {
              sql += `AND T.CreateBy = '` + recruiter + `'`;
            }

            sql += ` ORDER BY ISNULL(CreateTime, '1900-01-01T00:00:00') DESC`;
            console.log(sql);
            request.query(sql, function (err, recordset) {
              if (err) {
                console.error(err);
                return res.send({
                  flag: 0,
                  message: "Error querying the database.",
                });
              }

              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };
              res.send(result);
            });
          } catch (err) {
            console.error(err);
            return res.send({
              flag: 0,
              message: "An unexpected error occurred.",
            });
          }
        }
      );
    });
  } catch (err) {
    console.error(err);
    return res.send({
      flag: 0,
      message: "An unexpected error occurred.",
    });
  }
});

app.post("/getResumes3", function (req, res) {
  try {
    var traineeId = req.body.traineeId;
    if (req.body.keyword) {
      var keyword = parsePhraseToQuery(req.body.keyword);
    }

    var location = req.body.location;
    var startdate = req.body.startdate;
    var endate = req.body.enddate;
    var OrgID = req.body.OrgID;
    var recruiter = req.body.recruiter;

    sql.connect(config, function (err) {
      if (err) {
        console.error(err);
        return res.send({
          flag: 0,
          message: "Database connection error.",
        });
      }
      console.log();
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
        traineeId,
        function (err, recordset) {
          if (err) {
            console.error(err);
            return res.send({
              flag: 0,
              message: "Error retrieving OrganizationID.",
            });
          }

          try {
            // var OrgID = recordset.recordsets[0][0].OrganizationID;
            var sql =
              `SELECT TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy, YearsOfExpInMonths,
                ISNULL(YearsOfExpInMonths,0) [YRSEXP],
                LegalStatus, UserOrganizationID, CurrentLocation, Title as [TraineeTitle], ISNULL(LegalStatus,'') ,
                ISNULL(CONVERT(NVARCHAR(10),CreateTime,101), '1900-01-01T00:00:00') as LastUpdateTime,
                ISNULL(YearsOfExpInMonths,0), Source, Collab,skill,Notes,
                ( SELECT TOP 1 (R.FirstName + ' ' + R.LastName) FROM Trainee R WHERE R.UserName = T.CreateBy) AS Recruiter
            FROM Trainee T (NOLOCK)
                WHERE (Talentpool IS NULL OR Talentpool = 0)`;
            // sql +=  `AND UserOrganizationID = '` +OrgID;
            sql += ` AND active =1 AND Role='TRESUMEUSER' AND ProfileStatus = 'READY'`;

            if (keyword) {
              sql += ` AND (` + keyword + `)`;
            }

            if (location) {
              sql += ` AND CurrentLocation LIKE '%` + location + `%'`;
            }

            if (startdate) {
              if (endate) {
                sql += `AND createtime BETWEEN '` + startdate + `' AND '` + endate + `'`;
              } else {
                sql += ` AND createtime >= '` + startdate + `'`;
              }
            }

            sql += `AND T.UserOrganizationID = '` + OrgID + `'`;

            if (recruiter != 0) {
              sql += `AND T.CreateBy = '` + recruiter + `'`;
            }

            sql += ` ORDER BY ISNULL(CreateTime, '1900-01-01T00:00:00') DESC`;
            console.log(sql);
            request.query(sql, function (err, recordset) {
              if (err) {
                console.error(err);
                return res.send({
                  flag: 0,
                  message: "Error querying the database.",
                });
              }

              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };
              res.send(result);
            });
          } catch (err) {
            console.error(err);
            return res.send({
              flag: 0,
              message: "An unexpected error occurred.",
            });
          }
        }
      );
    });
  } catch (err) {
    console.error(err);
    return res.send({
      flag: 0,
      message: "An unexpected error occurred.",
    });
  }
});


app.post("/getcandidatelocation", function (req, res) {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(
      " SELECT DISTINCT currentlocation from trainee ORDER BY currentlocation",
      function (err, recordset) {
        if (err) console.log(err);

        var location = recordset.recordsets[0];
        const transformedArray = location
          .filter(item => item?.currentlocation && item.currentlocation !== "NULL" && item.currentlocation.trim() !== "")
          .map(item => item.currentlocation);
        var result = {
          flag: 1,
          result: transformedArray,
        };
        res.send(result);
      }
    );
  });
});


app.post("/getorganizationLogo", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("Database connection error");
    }

    var request = new sql.Request();
    var sqlQuery = "SELECT logo,organizationName FROM Organization WHERE OrganizationID =" + req.body.OrgID;

    request.query(sqlQuery, function (err, recordset) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query error");
      }

      var data = recordset.recordsets[0];

      // console.log(logo[0].logo);
      // if (!logo || logo[0].logo === 'null' || logo[0].logo === undefined) {
      //   logo = [{ logo: 'tresume.png' }];
      // }

      var result = {
        flag: 1,
        result: data,
      };

      res.send(result);
    });
  });
});

app.post("changeDocStatus", function (req, res) {
  // sql.connect(config, function (err) {
  //   if (err) console.log(err);
  //   var request = new sql.Request();
  //   request.query(
  //     "UPDATE CandidateDocument_New SET Active = "+req.body.status+" WHERE CandidateDocumentID =" +
  //     req.body.docId,
  //     function (err, recordset) {
  //       if (err) console.log(err);
  //       var result = {
  //         flag: 1,
  //         result: recordset.recordsets[0],
  //       };
  //       res.send(result);
  //     }
  //   );
  // });
  res.send('ok')
});

app.post("/FetchRecruiterList", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("Database connection error");
    }

    var request = new sql.Request();
    var sqlQuery = "SELECT username as value, CONCAT(Firstname, ' ', LastName) AS name FROM trainee WHERE organizationid = " + req.body.OrgID + " AND Active = 1 AND Role = 'RECRUITER' AND AccountStatus = 'ACTIVE' ORDER BY Firstname ASC";

    request.query(sqlQuery, function (err, recordset) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query error");
      }

      var data = recordset.recordsets[0];

      // console.log(logo[0].logo);
      // if (!logo || logo[0].logo === 'null' || logo[0].logo === undefined) {
      //   logo = [{ logo: 'tresume.png' }];
      // }

      var result = {
        flag: 1,
        result: data,
      };

      res.send(result);
    });
  });
});

app.post("/updateCandidateNotes", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("Database connection error");
    }

    var request = new sql.Request();
    var sqlQuery = "Update Trainee Set Notes='" + req.body.Notes + "' where traineeid = " + req.body.traineeID;
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, recordset) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query error");
      }

      // console.log(logo[0].logo);
      // if (!logo || logo[0].logo === 'null' || logo[0].logo === undefined) {
      //   logo = [{ logo: 'tresume.png' }];
      // }

      var result = {
        flag: 1,
      };

      res.send(result);
    });
  });
});


app.post("/getRecriterUsage", function (req, res) {
  var startdate = req.body.startDate;
  var enddate = req.body.endDate;
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql =
      "SELECT  T.FirstName + ' ' + T.LastName AS recruiterName, COALESCE(T.monster, 0) AS monster, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 3 AND createtime >= '" + startdate + "' AND createtime <= '" + enddate + "') AS monsterused, COALESCE(T.cb, 0) AS cb, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 4 AND createtime >= '" + startdate + "' AND createtime <= '" + enddate + "') AS cbused, COALESCE(T.dice, 0) AS dice, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 2 AND createtime >= '" + startdate + "' AND createtime <= '" + enddate + "') AS diceused FROM Trainee AS T INNER JOIN org_division AS OD ON T.Org_Div = OD.id WHERE T.organizationid = " + req.body.OrgID + " ORDER BY OD.DivisionName";
    console.log(sql);
    request.query(sql, function (err, recordset) {
      if (err) throw err;
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
      res.send(result);
    });
  });
});

app.post("/getplacementsBytID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("Database connection error");
    }
    const traineeId = req.body.TraineeID;
    var request = new sql.Request();
    var sqlQuery ='SELECT * FROM placements WHERE traineeid ='+traineeId+' ORDER BY PlacedDate';
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, recordset) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query error");
      }

      var data = recordset.recordsets[0];
      var result = {
        flag: 1,
        result: data,
      };

      res.send(result);
    });
  });
});

app.post("/UpdateplacementsBytID", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("Database connection error");
    }
    const PlacementID = req.body.PID?req.body.PID:"''";
    const CandidateDocumentID = req.body.CID;
    var request = new sql.Request();
    var sqlQuery ="update CandidateDocument_New set PlacementID = "+PlacementID+" where CandidateDocumentID = "+CandidateDocumentID;
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, recordset) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database query error");
      }

      var result = {
        flag: 1,
        Message: "Placement Updated Successfully",
      };

      res.send(result);
    });
  });
});

app.post('/getDiceAuthToken', async (req, res) => {
  try {
    // Set up the HTTP headers for the request
    const clientId = 'digitalmakerssolution';
    const clientSecret = '8ea58fcc-8ddb-413c-8130-795d2a455009';
    const authEndpoint = 'https://secure.dice.com/oauth/token';
    const httpOptions = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      withCredentials: true,
    };

    // Define the request body
    const requestBody = 'grant_type=password&username=nithya@dmsol.in&password=Dicedms23@';

    // Make a POST request to the authentication endpoint
    const response = await axios.post(authEndpoint, requestBody, httpOptions);

    // Send the response data to the client
    res.json(response.data);
  } catch (error) {
    // Handle errors
    console.error('Error getting Dice auth token:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});



// var task = cron.schedule('*/15 * * * *', async () => {
//   try {
//     const response = await axios.get('https://tresume.us/TresumeAPI/runharvest');
//     // const response = await axios.get('http://localhost:3000/runharvest');
//     console.log('Harvest call successful:', response.data);
//   } catch (error) {

//     console.error('Harvest call error:', error.message);
//   }
// });

// task.start();
