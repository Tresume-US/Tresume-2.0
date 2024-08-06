const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
var mime = require("mime");
const app = express();
const axios = require("axios");
const qs = require("querystring");
var sql = require("mssql");
var sql1 = require("mssql");
const multer = require("multer");
require("dotenv").config();
var savePath = "./uploads/";
const fs = require("fs");
const nodemailer = require("nodemailer");
const request = require("request");
const cookieParser = require("cookie-parser");
const session = require("express-session");
app.use(bodyparser.json({ limit: "100mb" }));
app.use(bodyparser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));
const FormData = require("form-data");
const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
const apiUrl = envconfig.apiUrl;
const port = envconfig.port;
var cors = require("cors");
app.use(cors());
const pool = require("./database");
const cron = require("node-cron");

const onboardRoutes = require("./onboarding-routes");
const candidateRoutes = require("./candidate-routes");
const adobesignRoutes = require("./adobe-sign");
const harvestRoutes = require("./harvest-routes");
const ssoRoutes = require("./sso-routes");
const optRoutes = require("./optnation");
const userRoles = require("./user-roles");
const vendors = require("./vendors");
const clients = require("./clients");
const jobposting = require("./jobposting");
const talentbench = require("./talentbench");
const timesheet = require("./timesheet");
const hrms = require("./hrms-routes");
const assignrole = require("./assignrole");
const projects = require("./project");
const jobBoardAccount = require("./jobBoardAccount");
const leadenquiry = require("./enquiry");
const jobapplication = require("./jobapplication");
const submittedcandidates = require("./submittedcandidates");
const Invoice = require("./Invoice");
const CorporateDocument = require("./corporate-document");
const CBapi = require("./cb");
const Dashboard = require("./dashboard");
const Integration = require("./integration")

app.use("/", onboardRoutes);
app.use("/", Dashboard);
app.use("/", candidateRoutes);
app.use("/", adobesignRoutes);
app.use("/", harvestRoutes);
app.use("/", ssoRoutes);
app.use("/", optRoutes);
app.use("/", userRoles);
app.use("/", vendors);
app.use("/", clients);
app.use("/", jobposting);
app.use("/", talentbench);
app.use("/", timesheet);
app.use("/", hrms);
app.use("/", assignrole);
app.use("/", projects);
app.use("/", jobBoardAccount);
app.use("/", leadenquiry);
app.use("/", jobapplication);
app.use("/", Invoice);
app.use("/", submittedcandidates);
app.use("/", CorporateDocument);
app.use("/", CBapi);
app.use("/", Integration)
app.use(
  session({
    secret: "Tresume@123",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", onboardRoutes);
app.use("/", candidateRoutes);

const route = express.Router();
// const transporter = nodemailer.createTransport({
//   port: 465,
//   host: "smtp.mail.yahoo.com",
//   auth: {
//     user: "support@tresume.us",
//     pass: "xzkmvglehwxeqrpd",
//   },
//   secure: true,
// });

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

async function getFrom(orgId) {
  try {
    // let pool = await sql.connect(config);
    const result = await pool.query`SELECT * FROM Integrations WHERE type = 2 AND orgId = ${orgId}`;
    return result.recordset;
  } catch (err) {
    console.error(err);
  }
}

app.post('/text-mail', async (req, res) => {
  try {
    const { orgid, to, subject, text } = req.body;
    console.log('inside the server', orgid);

    const integrationData = await getFrom(orgid);
    if (!integrationData.length) {
      return res.status(404).send({ message: 'No integration data found for the given orgId' });
    }

    const { username, password, host, smtpport } = integrationData[0];

    // Configure the transporter with the retrieved SMTP details
    const transporter = nodemailer.createTransport({
      host: host,
      port: smtpport,
      secure: smtpport == 465, // true for 465, false for other ports
      auth: {
        user: username,
        pass: password,
      },
    });

    const mailData = {
      from: username,
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
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
            border: 1px solid #dddddd;
        }
        .header {
            text-align: center;
            background-color: #482668;
            padding: 10px 0;
        }
        .logo {
            display: block;
            margin: 0 auto;
            height: 50px;
            min-height: 50px;
        }
        .content {
            padding:20px;
            background-color: #f7f9fa;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .footer {
            text-align: center;
            background-color: #e7e7e7;
            padding: 20px;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            font-size: 12px;
            color: #8d8d8d;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer img {
            display: inline-block;
            vertical-align: middle;
            margin-right: 5px;
        }
      </style>
      </head>
      <body>
      <div class="container">
          <div class="header">
              <img src="https://tresume.us/email/Tresume_logo.png" alt="Tresume Logo"  class="logo">
          </div>
          <div class="content">
              ${text}
              
          </div>
          <div class="footer">
              <p>POWERED BY </p>
              <p>44121 Leesburg Pike., STE 230 Ashburn, VA 20147, United States Of America</p>
              <p>(703) 986-3350 | support@tresume.us</p>
              <p style="font-weight: bold; color: #a4a4a4;">© 2024 Tresume Ltd. All rights reserved</p>
          </div>
      </div>
      </body>
      </html>
      `,
    };

    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: 'Error sending mail', error: error.message });
      }
      res.status(200).send({ message: 'Mail sent', message_id: info.messageId });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred', error: error.message });
  }
});




// config for your database
var config = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "Tresume",
  trustServerCertificate: true,
  connectionTimeout: 60000,
};

var config1 = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "TimesheetDB",
  trustServerCertificate: true,
  connectionTimeout: 60000,
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
        req.params.onboardID;
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
      try {
        if (err) throw err;

        var request = new sql.Request();

        request.query(
          "select OrganizationID from Trainee where TraineeID=" +
            req.params.traineeId,
          function (err, recordset) {
            try {
              if (err) throw err;

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
                  try {
                    if (err) throw err;

                    var result = {
                      flag: 1,
                      result: recordset.recordsets[0],
                    };

                    res.send(result);
                  } catch (err) {
                    console.log("Error in inner query:", err);
                    res.status(500).send("Internal Server Error");
                  }
                }
              );
            } catch (err) {
              console.log("Error in second query:", err);
              res.status(500).send("Internal Server Error");
            }
          }
        );
      } catch (err) {
        console.log("Error in database connection:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }
);

app.get(
  "/adminPlacementByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;

        var request = new sql.Request();

        request.query(
          "select OrganizationID from Trainee where TraineeID=" +
            req.params.traineeId,
          function (err, recordset) {
            try {
              if (err) throw err;

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
                  try {
                    if (err) throw err;

                    var result = {
                      flag: 1,
                      result: recordset.recordsets[0],
                    };

                    res.send(result);
                  } catch (err) {
                    console.log("Error in inner query:", err);
                    res.status(500).send("Internal Server Error");
                  }
                }
              );
            } catch (err) {
              console.log("Error in second query:", err);
              res.status(500).send("Internal Server Error");
            }
          }
        );
      } catch (err) {
        console.log("Error in database connection:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }
);

app.get(
  "/adminInterviewByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;

        var request = new sql.Request();

        request.query(
          "select OrganizationID from Trainee where TraineeID=" +
            req.params.traineeId,
          function (err, recordset) {
            try {
              if (err) throw err;

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
                  " WHERE md.OrgId=" +
                  OrgID +
                  " AND md.Active=1 AND t.Active=1 ORDER BY PlacemntCount desc",
                function (err, recordset) {
                  try {
                    if (err) throw err;

                    var result = {
                      flag: 1,
                      result: recordset.recordsets[0],
                    };

                    res.send(result);
                  } catch (err) {
                    console.log("Error in inner query:", err);
                    res.status(500).send("Internal Server Error");
                  }
                }
              );
            } catch (err) {
              console.log("Error in second query:", err);
              res.status(500).send("Internal Server Error");
            }
          }
        );
      } catch (err) {
        console.log("Error in database connection:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }
);

app.get(
  "/adminSubmissionByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;

        var request = new sql.Request();

        request.query(
          "select OrganizationID from Trainee where TraineeID=" +
            req.params.traineeId,
          function (err, recordset) {
            try {
              if (err) throw err;

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
                  " WHERE md.OrgId=" +
                  OrgID +
                  " AND md.Active=1 AND t.Active=1 ORDER BY BenchCount desc ",
                function (err, recordset) {
                  try {
                    if (err) throw err;

                    var result = {
                      flag: 1,
                      result: recordset.recordsets[0],
                    };

                    res.send(result);
                  } catch (err) {
                    console.log("Error in inner query:", err);
                    res.status(500).send("Internal Server Error");
                  }
                }
              );
            } catch (err) {
              console.log("Error in second query:", err);
              res.status(500).send("Internal Server Error");
            }
          }
        );
      } catch (err) {
        console.log("Error in database connection:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }
);

app.get(
  "/adminFtcByMarketer/:traineeId/:startDate/:endDate",
  function (req, res) {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;

        var request = new sql.Request();

        request.query(
          "select OrganizationID from Trainee where TraineeID=" +
            req.params.traineeId,
          function (err, recordset) {
            try {
              if (err) throw err;

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
                  try {
                    if (err) throw err;

                    var result = {
                      flag: 1,
                      result: recordset.recordsets[0],
                    };

                    res.send(result);
                  } catch (err) {
                    console.log("Error in inner query:", err);
                    res.status(500).send("Internal Server Error");
                  }
                }
              );
            } catch (err) {
              console.log("Error in second query:", err);
              res.status(500).send("Internal Server Error");
            }
          }
        );
      } catch (err) {
        console.log("Error in database connection:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }
);

app.post("/getTraineeDetails", function (req, res) {
  sql.connect(config, function (err) {
    try {
      if (err) throw err;
      
      var request = new sql.Request();
      request.query(
        "select * from Trainee (nolock) where TraineeID = '" +
          req.body.traineeId +
          "' and Active = 1",
        function (err, recordset) {
          try {
            if (err) throw err;

            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };

            res.send(result);
          } catch (err) {
            console.log("Error in query execution:", err);
            res.status(500).send("Internal Server Error");
          }
        }
      );
    } catch (err) {
      console.log("Error in database connection:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/getLegalStatus/:traineeId", function (req, res) {
  sql.connect(config, function (err) {
    try {
      if (err) throw err;

      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.params.traineeId,
        function (err, recordset) {
          try {
            if (err) throw err;

            var OrgID = recordset.recordsets[0][0].OrganizationID;
            request.query(
              "SELECT b.LegalText AS LegalStatus, COUNT(TraineeID) AS Total, b.LegalStatusID FROM Trainee a JOIN LegalStatus b ON b.LegalValue=a.LegalStatus WHERE a.Active=1 AND a.UserOrganizationID=" +
                OrgID +
                "  AND a.CandidateStatus IN (2,4,6,7,13) GROUP BY b.LegalText, b.LegalStatusID",
              function (err, recordset) {
                try {
                  if (err) throw err;

                  var result = {
                    flag: 1,
                    result: recordset.recordsets[0],
                  };

                  res.send(result);
                } catch (err) {
                  console.log("Error in inner query:", err);
                  res.status(500).send("Internal Server Error");
                }
              }
            );
          } catch (err) {
            console.log("Error in fetching OrganizationID:", err);
            res.status(500).send("Internal Server Error");
          }
        }
      );
    } catch (err) {
      console.log("Error in database connection:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/getAllRecruiters/:traineeId", function (req, res) {
  sql.connect(config, function (err) {
    try {
      if (err) throw err;

      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.params.traineeId,
        function (err, recordset) {
          try {
            if (err) throw err;

            var OrgID = recordset.recordsets[0][0].OrganizationID;
            request.query(
              "SELECT distinct r.TraineeID, r.FirstName + ' ' + ISNULL(r.LastName, '') as Name FROM MemberDetails orgR (nolock) JOIN Trainee r (nolock) ON r.UserName=orgR.UserEmail WHERE r.Active=1 AND orgR.Active=1 AND orgR.OrgID=" +
                OrgID,
              function (err, recordset) {
                try {
                  if (err) throw err;

                  var result = {
                    flag: 1,
                    result: recordset.recordsets[0],
                  };

                  res.send(result);
                } catch (err) {
                  console.log("Error in inner query:", err);
                  res.status(500).send("Internal Server Error");
                }
              }
            );
          } catch (err) {
            console.log("Error in fetching OrganizationID:", err);
            res.status(500).send("Internal Server Error");
          }
        }
      );
    } catch (err) {
      console.log("Error in database connection:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/getFTCReport", function (req, res) {
  sql.connect(config, function (err) {
    try {
      if (err) throw err;
      
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          try {
            if (err) throw err;

            var OrgID = recordset.recordsets[0][0].OrganizationID;
            request.input("OrgID", sql.Int, OrgID);
            request.input("startDate", sql.VarChar, req.body.fromDate);
            request.input("endDate", sql.VarChar, req.body.toDate);
            request.input("recruiterId", sql.VarChar, req.body.recruiterId);
            request.input("candidateStatus", sql.VarChar, req.body.candidateStatus);
            request.execute("getFTCReport", function (err, recordset) {
              try {
                if (err) throw err;

                var result = {
                  flag: 1,
                  result: recordset.recordsets[0],
                };
                res.send(result);
              } catch (err) {
                console.log("Error executing stored procedure:", err);
                res.status(500).send("Internal Server Error");
              }
            });
          } catch (err) {
            console.log("Error fetching OrganizationID:", err);
            res.status(500).send("Internal Server Error");
          }
        }
      );
    } catch (err) {
      console.log("Error in database connection:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/getCandidateDocuments", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.status(500).send("Error connecting to the database");
      return;
    }

    var request = new sql.Request();
    let query = `SELECT CD.CandidateDocumentID,CD.TraineeID,CONVERT(NVARCHAR(10),CD.CreateTime,101) AS CreateTime,Cd.DocumentName,
        CD.DocumentPath,CD.Active,DT.DocTypeName,CONVERT(NVARCHAR(10),CD.DocStartDate,101) AS StartDate,CONVERT(NVARCHAR(10),CD.DocExpiryDate,101) AS ExpiryDate,
        CD.OtherInfo, CD.PlacementID from CandidateDocument_New CD LEFT JOIN DocType DT  ON DT.DTID = CD.DocumentTypeID
        WHERE CD.Active = 1 AND DT.Active = 1 AND CD.TraineeID = ${req.body.traineeID}`;
    if (req.body.docTypeID) {
      query += ` AND CD.DocumentTypeID = ${req.body.docTypeID}`;
    }
    console.log(query);

    try {
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
    } catch (error) {
      console.log(error);
      res.status(500).send("Error executing query");
    }
  });
});

app.post("/getLoggedUser", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.query(
          "select TraineeID from Trainee (nolock) where Username = '" +
            req.body.userName +
            "' and Active = 1",
          function (err, recordset) {
            try {
              if (err) throw err;
              
              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };
              res.send(recordset.recordsets[0]);
            } catch (error) {
              console.log("Error executing query:", error);
              res.status(500).send("Error executing query");
            }
          }
        );
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.get("/deleteDocument/:docId", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.query(
          "UPDATE CandidateDocument_New SET Active = 0 WHERE CandidateDocumentID =" +
            req.params.docId,
          function (err, recordset) {
            try {
              if (err) throw err;
              
              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };
              res.send(result);
            } catch (error) {
              console.log("Error executing query:", error);
              res.status(500).send("Error executing query");
            }
          }
        );
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.post("/uploadDocument/:traineeID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        upload1(req, res, function (err) {
          try {
            if (err) throw err;

            let FileName = req.file.originalname.split(".")[0];
            console.log("FileName", FileName);
            let FilePath = req.file.path;
            console.log("FilePath", FilePath);

            var request = new sql.Request();
            request.query(
              "Select UserName from Trainee where TraineeID=" + req.body.loggedUserId,
              function (err, recordset) {
                try {
                  if (err) throw err;

                  var loggedUserEmail = recordset.recordsets[0][0].UserName;
                  var result = {
                    flag: 1,
                    loggedUserEmail: loggedUserEmail,
                    FileName: FileName,
                    FilePath: FilePath,
                  };
                  res.send(result);
                  console.log("result", result);
                } catch (error) {
                  console.log("Error fetching logged user email:", error);
                  res.status(500).send("Error fetching logged user email");
                }
              }
            );
          } catch (error) {
            console.log("Error uploading file:", error);
            res.status(500).send("Error uploading file");
          }
        });
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.post("/uploadinsert", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;

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
            try {
              if (err) throw err;
            } catch (error) {
              console.log("Error executing query:", error);
              res.status(500).send("Error executing query");
            }
          }
        );
        res.json(true);
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});


app.post("/sitevisit", async function (req, res) {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    request.input("TraineeID", sql.VarChar, req.body.traineeID);

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
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.query(
          "UPDATE Placements SET JobDuties='" +
            req.body.jd +
            "' WHERE TraineeID=" +
            req.body.traineeID,
          function (err, recordset) {
            try {
              if (err) throw err;
            } catch (error) {
              console.log("Error executing query:", error);
              res.status(500).send("Error executing query");
            }
          }
        );
        res.json(true);
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.post("/updatesupervised", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.query(
          "UPDATE Placements SET EmployeeSupervised='" +
            req.body.supervised +
            "' WHERE TraineeID=" +
            req.body.traineeID,
          function (err, recordset) {
            try {
              if (err) throw err;
            } catch (error) {
              console.log("Error executing query:", error);
              res.status(500).send("Error executing query");
            }
          }
        );
        res.json(true);
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.post("/updateworktype", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.query(
          "UPDATE Placements SET Worktype='" +
            req.body.worktype +
            "' WHERE TraineeID=" +
            req.body.traineeID,
          function (err, recordset) {
            try {
              if (err) throw err;
            } catch (error) {
              console.log("Error executing query:", error);
              res.status(500).send("Error executing query");
            }
          }
        );
        res.json(true);
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.get("/getEducationDetails/:traineeID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.input("TraineeID", sql.VarChar, req.params.traineeID);
        request.execute("GetTraineeEduDetails", function (err, recordset) {
          try {
            if (err) throw err;

            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          } catch (error) {
            console.log("Error executing stored procedure:", error);
            res.status(500).send("Error executing stored procedure");
          }
        });
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.post("/getResumes", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.query(
          "select OrganizationID from Trainee where TraineeID=" +
            req.body.traineeId,
          function (err, recordset) {
            try {
              if (err) throw err;

              var OrgID = recordset.recordsets[0][0].OrganizationID;
              request.input("OrgID", sql.VarChar, OrgID);
              request.input("Keyword", sql.VarChar, req.body.keyword);
              request.input("Location", sql.VarChar, req.body.location);
              request.execute("GetJBResumes", function (err, recordset) {
                try {
                  if (err) throw err;

                  var result = {
                    flag: 1,
                    result: recordset.recordsets[0],
                  };
                  res.send(result);
                } catch (error) {
                  console.log("Error executing stored procedure:", error);
                  res.status(500).send("Error executing stored procedure");
                }
              });
            } catch (error) {
              console.log("Error fetching OrganizationID:", error);
              res.status(500).send("Error fetching OrganizationID");
            }
          }
        );
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
});

app.post("/getResumes1", function (req, res) {
  const timeoutDuration = 60000; // Timeout duration in milliseconds (60 seconds)

  // Set a timeout for the request
  req.setTimeout(timeoutDuration, function () {
    const result = {
      flag: 0,
      error: "Request timed out",
    };
    res.status(504).send(result);
  });

  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.query(
          "select OrganizationID from Trainee where TraineeID=" +
            req.body.traineeId,
          function (err, recordset) {
            try {
              if (err) throw err;

              var OrgID = recordset.recordsets[0][0].OrganizationID;
              var sqlQuery =
                `SELECT Top 100 TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy, YearsOfExpInMonths,
                        ISNULL(YearsOfExpInMonths,0) [YRSEXP],Skill,
                        LegalStatus, UserOrganizationID, CurrentLocation, Title as [TraineeTitle], ISNULL(LegalStatus,'') ,
                        ISNULL(CONVERT(NVARCHAR(10),CreateTime,101), '1900-01-01T00:00:00') as LastUpdateTime,
                        ISNULL(YearsOfExpInMonths,0), Source, Collab, Notes,
                        ( SELECT TOP 1 (R.FirstName + ' ' + R.LastName) FROM Trainee R WHERE R.UserName = T.CreateBy) AS Recruiter
                        FROM Trainee T (NOLOCK)
                        WHERE (T.Talentpool IS NULL OR T.Talentpool = 0) AND T.UserOrganizationID = '` +
                OrgID +
                `' AND T.active =1
                        AND T.Role='TRESUMEUSER' AND T.ProfileStatus = 'READY'
                        AND (T.Skill LIKE '%` +
                req.body.keyword +
                `%' OR T.Title LIKE '%` +
                req.body.keyword +
                `%')`;
              if (req.body.location) {
                sqlQuery +=
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
              sqlQuery += `ORDER BY ISNULL(T.CreateTime, '1900-01-01T00:00:00') DESC`;

              console.log(sqlQuery);
              request.query(sqlQuery, function (err, recordset) {
                try {
                  if (err) throw err;

                  var resultData = {
                    flag: 1,
                    result: recordset.recordsets[0],
                  };
                  res.send(resultData);
                } catch (error) {
                  console.log("Error executing query:", error);
                  const result = {
                    flag: 0,
                    error: "An error occurred while querying the database",
                  };
                  res.status(500).send(result);
                }
              });
            } catch (error) {
              console.log("Error fetching OrganizationID:", error);
              const result = {
                flag: 0,
                error: "An error occurred while fetching OrganizationID",
              };
              res.status(500).send(result);
            }
          }
        );
      } catch (error) {
        console.log("Error connecting to the database:", error);
        const result = {
          flag: 0,
          error: "An error occurred while connecting to the database",
        };
        res.status(500).send(result);
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    const result = {
      flag: 0,
      error: "An error occurred while connecting to the database",
    };
    res.status(500).send(result);
  }
});

app.post("/getResumeDetails", function (req, res) {
  try {
    sql.connect(config, function (err) {
      try {
        if (err) throw err;
        
        var request = new sql.Request();
        request.query(
          "select HtmlResume from Trainee (nolock) where TraineeID = '" +
            req.body.traineeID +
            "' and Active = 1",
          function (err, recordset) {
            try {
              if (err) throw err;

              var result = {
                flag: 1,
                result: recordset.recordsets[0],
              };
              res.send(recordset.recordsets[0]);
            } catch (error) {
              console.log("Error executing query:", error);
              res.status(500).send("Error executing query");
            }
          }
        );
      } catch (error) {
        console.log("Error connecting to the database:", error);
        res.status(500).send("Error connecting to the database");
      }
    });
  } catch (error) {
    console.log("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  }
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
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }

      var useremail = req.body.useremail;
      var startDate = req.body.startDate;
      var endDate = req.body.endDate;
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
                     AND CO.CreateDate BETWEEN '${startDate}' AND '${endDate}'
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
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
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
  try {
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
                          O.Organizationname,
                          O.organizationid
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
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/getChecklists", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }

      var request = new sql.Request();
      request.query(
        "select CL.ListID, CL.OrgID, CL.ListName, CL.ListType, CL.DocTypeID, CL.Position, DT.DocTypeName from Checklists CL JOIN DocType DT on CL.DocTypeID=DT.DTID where CL.OrgID = '" +
          req.body.OrgID +
          "'",
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/getDocTypes", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }

      var request = new sql.Request();
      request.query(
        "select DTID, DocTypeName from DocType where Active=1",
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/getNewChecklistID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }

      var request = new sql.Request();
      request.query(
        "select isnull(max(ListID),0) + 1 as ID from Checklists",
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/saveChecklist", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }

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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/deleteChecklist", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }

      var request = new sql.Request();
      request.query(
        "delete from Checklists where ListID=" + req.body.id,
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/getChecklistNames", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("Error connecting to database");
      }

      var request = new sql.Request();
      request.query(
        "select distinct ListID, ListName from Checklists where OrgID=" +
          req.body.OrgID, // Access OrgID from request body
        function (err, recordset) {
          if (err) {
            console.log(err);
            return res.status(500).send("Error executing query");
          }
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result);
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/getWizardSteps", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }

      var request = new sql.Request();
      request.query(
        "select a.ListID,a.ListName,a.ListType,a.DocTypeID,a.Position,b.DocTypeName from Checklists a inner join DocType b on a.DocTypeID=b.DTID where a.OrgID=" +
          req.body.OrgID +
          " and a.ListID=" +
          req.body.ListID +
          " order by a.Position",
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/createOnboarding", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }

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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/uploadOnboardDocument/:onboardID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      upload1(req, res, function (err) {
        if (err) {
          console.log(err);
          return res.status(500).json(err);
        }
        let FileName = req.file.originalname.split(".")[0];
        console.log("FileName", FileName);
        let FilePath = req.file.path;
        console.log("FilePath", FilePath);

        var request = new sql.Request();
        request.query(
          "Select UserName from Trainee where TraineeID=" + req.body.loggedUserId,
          function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing query");
              return;
            }
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
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/uploadReqOnboardDocument/:onboardID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      upload1(req, res, function (err) {
        if (err) {
          console.log(err);
          return res.status(500).json(err);
        }
        let FileName = req.file.originalname.split(".")[0];
        console.log("FileName", FileName);
        let FilePath = req.file.path;
        console.log("FilePath", FilePath);
        var result = {
          flag: 1,
          FileName: FileName,
          FilePath: FilePath,
        };
        res.send(result);
        console.log("result", result);
      });
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/getOnboardingDetails", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      var query = "select * from CurrentOnboardings where ID=" + req.body.onboardId;
      console.log(query);
      request.query(query,

        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/getOnboardingRequest", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select * from OnboardingDocRequest where OnboardID=" +
          req.body.OnboardID +
          " and isRequested=1",
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/saveOnboardingRequest", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.input("FileName", sql.VarChar, req.body.fileName);
      request.input("OnBoardID", sql.Int, req.body.onboardID);
      request.input("DocTypeName", sql.VarChar, req.body.docTypeName);
      request.input("DocTypeID", sql.Int, req.body.docTypeID);
      request.input("isRequested", sql.Int, req.body.requested);
      request.input("DocNotes", sql.VarChar, req.body.docNote);
      request.execute("InsertOnboardingDocRequest", function (err, recordset) {
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
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/updateOnboardStatus", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "update CurrentOnboardings set Status=2 where ID=" + req.body.onboardId,
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/updateOnboardStatus1", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "update CurrentOnboardings set Status=0 where ID=" + req.body.onboardId,
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/onboardSession", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select * from OnboardingSession where SessionID='" +
          req.body.sessionID +
          " ' ",
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/approveFiles", function (req, res) {
  try {
    const path =
      `C:/inetpub/vhosts/tresume.us/httpdocs/Content/Resume/` +
      req.body.traineeID;
    fs.mkdirSync(path, { recursive: true });
    fs.copyFile(req.body.oldPath, req.body.newPath, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error copying file");
        return;
      }
      sql.connect(config, function (err) {
        if (err) {
          console.log(err);
          res.status(500).send("Error connecting to database");
          return;
        }
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
            if (err) {
              console.log(err);
              res.status(500).send("Error inserting document into database");
              return;
            }
            var request = new sql.Request();
            request.query(
              "update OnboardingDocRequest set Status=1 where OnboardID=" +
                req.body.onboardID +
                " and DocTypeID=" +
                req.body.docType,
              function (err, recordset) {
                if (err) {
                  console.log(err);
                  res.status(500).send("Error updating onboarding document request status");
                  return;
                }
                var result = {
                  flag: 1,
                  message: 'Success'
                };
                res.send(result);
              }
            );
          }
        );
      });
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});


app.post("/expirydata", function (req, res) {
  sql.connect(config, function (err) {
    try {
      if (err) throw err;
      
      var request = new sql.Request();
      request.query(
        "SELECT * FROM CandidateDocument_New WHERE TRAINEEID = '" +
        req.body.traineeId +
        "'  AND Active = 1",
        function (err, recordset) {
          try {
            if (err) throw err;

            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };

            res.send(result);
          } catch (err) {
            console.log("Error in query execution:", err);
            res.status(500).send("Internal Server Error");
          }
        }
      );
    } catch (err) {
      console.log("Error in database connection:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/generateonboardSession", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.input("OnBoardID", sql.Int, req.body.onboardID);
      request.input("OrgID", sql.Int, req.body.orgID);
      request.input("TraineeID", sql.Int, req.body.traineeID);
      request.execute("GenerateOnboardingSession", function (err, recordset) {
        if (err) {
          console.log(err);
          res.status(500).send("Error executing stored procedure");
          return;
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      });
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/getDocPath", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select filepath from OnboardingDocRequest where OnboardID=" +
          req.body.onboardID +
          "and DocTypeID=" +
          req.body.docTypeID,
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/insertUploadFilepath", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      let filepath = req.body.filepath ? req.body.filepath : "";
      request.query(
        "INSERT INTO OnboardingDocRequest (ID, OnboardID, DocTypeName, DocTypeID, isRequested, Status, isViewed, isUpload, filepath, DocNotes, AdditionalChecklistID, AdditionalChecklistName) VALUES ((SELECT ISNULL(MAX(ID),0) + 1 FROM OnboardingDocRequest), " +
          req.body.onboardID +
          ", '" +
          req.body.docTypeName +
          "', " +
          req.body.docTypeID +
          ", " +
          req.body.requested +
          ", 0, 0, 0, '" +
          filepath +
          "', '" +
          req.body.docNote +
          "', '" +
          req.body.additionalChecklistID +
          "', '" +
          req.body.additionalChecklistName +
          "')",
        function (err, recordset) {
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
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/download/:ID/:DocID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select filepath from OnboardingDocRequest where OnboardID=" +
          req.params.ID +
          "and DocTypeID=" +
          req.params.DocID,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error executing query");
            return;
          }
          // Check if the recordset contains data
          if (recordset && recordset.recordsets && recordset.recordsets[0] && recordset.recordsets[0][0]) {
            let formattedPath = recordset.recordsets[0][0].filepath.replace(
              /\\/g,
              "/"
            );
            var file = formattedPath;
            var filename = path.basename(file);
            var mimetype = mime.getType(file);
            // Set the headers for file download
            res.setHeader(
              "Content-disposition",
              "attachment; filename=" + filename
            );
            res.setHeader("Content-type", mimetype);
            // Stream the file to the response
            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
          } else {
            // If no file found in database, send 404
            res.status(404).send("File not found");
          }
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/reviewdownload/:ID/:DocID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select SignedFilepath from OnboardingDocRequest where OnboardID=" +
          req.params.ID +
          " and DocTypeID=" +
          req.params.DocID,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error executing query");
            return;
          }
          // Check if the recordset contains data
          if (
            recordset &&
            recordset.recordsets &&
            recordset.recordsets[0] &&
            recordset.recordsets[0][0]
          ) {
            let formattedPath = recordset.recordsets[0][0].SignedFilepath.replace(
              /\\/g,
              "/"
            );
            var file = formattedPath;
            var filename = path.basename(file);
            var mimetype = mime.getType(file);
            // Set the headers for file download
            res.setHeader(
              "Content-disposition",
              "attachment; filename=" + filename
            );
            res.setHeader("Content-type", mimetype);
            // Stream the file to the response
            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
          } else {
            // If no file found in database, send 404
            res.status(404).send("File not found");
          }
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/reviewFile/:ID/:DocID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select SignedFilepath from OnboardingDocRequest where OnboardID=" +
          req.params.ID +
          "and DocTypeID=" +
          req.params.DocID,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error executing query");
            return;
          }
          if (
            !recordset ||
            !recordset.recordsets[0] ||
            !recordset.recordsets[0][0]
          ) {
            res.status(404).send("File not found");
            return;
          }
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
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/updateDocStatus", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "update OnboardingDocRequest set isUpload=1 where OnboardID=" +
          req.body.onboardID +
          " and DocTypeID=" +
          req.body.docTypeID,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error updating document status");
            return;
          }
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          var request = new sql.Request();
          request.input("OnBoardID", sql.Int, req.body.onboardID);
          request.execute("setOnboardingPercent", function (err, recordset) {
            if (err) {
              console.log(err);
              return;
            }
          });
          res.send(recordset.recordsets[0]);
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/updateSignFilepath", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "update OnboardingDocRequest set SignedFilePath='" +
          req.body.filepath +
          "' where OnboardID=" +
          req.body.onboardID +
          " and DocTypeID=" +
          req.body.docTypeID,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error updating signed file path");
            return;
          }
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(recordset.recordsets[0]);
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getInterviewsReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("getInterviewsReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getBenchTrackerReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("getBenchTrackerReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getPlacementsReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("getPlacementsReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getLegalStatusReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("getLegalStatusReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getH1BExpiryReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("getH1BExpiryReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getBillableEmployeeReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("getBillableEmployeeReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getNonH1BReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("getNonH1BReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// app.post("/getDSRReport", function (req, res) {
//   try {
//     sql.connect(config, function (err) {
//       if (err) {
//         console.log(err);
//         res.status(500).send("Error connecting to database");
//         return;
//       }
//       var request = new sql.Request();
//       request.query(
//         "select OrganizationID from Trainee where TraineeID=" +
//           req.body.traineeId,
//         function (err, recordset) {
//           if (err) {
//             console.log(err);
//             res.status(500).send("Error querying Trainee table");
//             return;
//           }
//           var OrgID = recordset.recordsets[0][0].OrganizationID;
//           request.input("OrgID", sql.Int, OrgID);
//           request.input("startDate", sql.VarChar, req.body.startDate);
//           request.input("endDate", sql.VarChar, req.body.endDate);
//           request.execute("getDSRReport", function (err, recordset) {
//             if (err) {
//               console.log(err);
//               res.status(500).send("Error executing stored procedure");
//               return;
//             }
//             var result = {
//               flag: 1,
//               result: recordset.recordsets[0],
//             };
//             res.send(result);
//           });
//         }
//       );
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal Server Error");
//   }
// });


app.post("/getDSRReport", async (req, res) => {
  const { startDate, endDate, OrganizationId, traineeId } = req.body;

  try {
    await sql.connect(config);

    var query = '';

    // Add conditional filter based on UserRole
    if (req.body.UserRole == 1  || req.body.userRole == 3) {
      query = `SELECT s.submissionid, CONCAT(t.FirstName, ' ', t.LastName) AS Candidate, CONCAT(m.FirstName, ' ', m.LastName) AS Marketer,  
                        s.title, FORMAT(s.submissiondate, 'MM/dd/yyyy') AS SubmissionDate, 
                        s.VendorName, s.ClientName, s.Note, s.Rate
                 FROM submission s 
                 INNER JOIN Trainee t ON s.TraineeID = t.TraineeID 
                 INNER JOIN Trainee m ON s.markerterid = m.TraineeID 
                 WHERE s.Active = 1 AND m.Active = 1 
                 AND s.SubmissionDate BETWEEN @startDate AND @endDate 
                 AND m.OrganizationID = @OrganizationId 
                 ORDER BY SubmissionDate`;
    } else {
      query = `SELECT s.submissionid, CONCAT(t.FirstName, ' ', t.LastName) AS Candidate, CONCAT(m.FirstName, ' ', m.LastName) AS Marketer,  
                        s.title, FORMAT(s.submissiondate, 'MM/dd/yyyy') AS SubmissionDate, 
                        s.VendorName, s.ClientName, s.Note, s.Rate
                 FROM submission s 
                 INNER JOIN Trainee t ON s.TraineeID = t.TraineeID 
                 INNER JOIN Trainee m ON s.markerterid = m.TraineeID 
                 WHERE s.Active = 1 AND m.Active = 1 
                 AND s.SubmissionDate BETWEEN @startDate AND @endDate 
                 AND s.markerterid = @traineeId 
                 ORDER BY SubmissionDate`;
    }

    console.log(query);
    console.log(req.body.UserRole);

    const request = new sql.Request();
    request.input('startDate', sql.Date, startDate);
    request.input('endDate', sql.Date, endDate);
    request.input('OrganizationId', sql.Int, OrganizationId);
    request.input('traineeId', sql.Int, traineeId);

    const result = await request.query(query);

    res.send({
      flag: 1,
      result: result.recordset
    });

  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("An error occurred while processing your request.");
  } finally {
    await sql.close();
  }
});


app.post("/getSiteVisitReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.execute("GetTraineeDetailsCopy", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getPFAReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.execute("GetPFAReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getDocumentExpiryReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("GetDocumentExpiryReport", function (err, recordset) {
            if (err) {
              console.log(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/checkIfJobSeekerResumeExists", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "SELECT * FROM Trainee (nolock) WHERE Username = '" +
          req.body.emailID +
          "' AND Active = 1",
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result.result);
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/createJobSeekerDetails", function (req, res) {
  const timeoutDuration = 60000; // Timeout duration in milliseconds (60 seconds)

  // Set a timeout for the entire request
  const timeout = setTimeout(() => {
      const result = {
          flag: 0,
          error: "Request timed out",
      };
      res.status(504).send(result);
  }, timeoutDuration);

  try {
      sql.connect(config, function (err) {
          clearTimeout(timeout); // Clear the timeout since the database connection has completed or failed
          if (err) {
              console.log(err);
              const result = {
                  flag: 0,
                  error: "An error occurred while connecting to the database",
              };
              res.status(500).send(result);
              return;
          }
          var request = new sql.Request();
          console.log(
              "select OrganizationID, UserName from Trainee where TraineeID=" +
              req.body.traineeId
          );
          request.query(
              "select OrganizationID, UserName from Trainee where TraineeID=" +
              req.body.traineeId,
              function (err, recordset) {
                  if (err) {
                      console.log(err);
                      const result = {
                          flag: 0,
                          error: "An error occurred while querying the database",
                      };
                      res.status(500).send(result);
                      return;
                  }
                  console.log(recordset);
                  var OrgID = recordset.recordsets[0][0].OrganizationID;
                  var UserName = recordset.recordsets[0][0].UserName;
                  var skillsString = "";
                  if (req.body.source == "OptNation") {
                      skillsString = req.body.skills;
                  } else {
                      skillsString = req.body.skills.join(",");
                  }
                  request.input("EmailID", sql.VarChar, req.body.emailID);
                  request.input("FirstName", sql.VarChar, req.body.firstName);
                  request.input("LastName", sql.VarChar, req.body.lastName);
                  request.input("Title", sql.VarChar, req.body.title);
                  request.input(
                      "CurrentLocation",
                      sql.VarChar,
                      req.body.currentLocation
                  );
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
                  request.input("harvest", sql.VarChar, "");
                  request.input("securityclearance", sql.VarChar, req.body.securityclearance);
                  request.input("ats_md5email", sql.VarChar, req.body.ATSID);
                  request.execute("CreateJobSeekerProfile", function (err, recordset) {
                      if (err) {
                          console.log(err);
                          const result = {
                              flag: 0,
                              error: "An error occurred while executing the stored procedure",
                          };
                          res.status(500).send(result);
                          return;
                      }
                      var result = {
                          flag: 1,
                          // result: recordset.recordsets[0]
                      };
                      res.send(result);
                  });
              }
          );
      });
  } catch (error) {
      console.error("Error:", error);
      const result = {
          flag: 0,
          error: "An unexpected error occurred",
      };
      res.status(500).send(result);
  }
});



app.post("/checkIfProfileMigrated", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error connecting to database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "SELECT ATSID, MigrateProfileID, CreateBy, CreateTime FROM Trainee (nolock) WHERE Role = 'TRESUMEUSER' AND Source = '" +
          req.body.source +
          "' AND UserOrganizationID = (SELECT OrganizationID FROM Trainee WHERE TraineeID = " +
          req.body.traineeId +
          ") AND Active = 1 ORDER BY CreateTime DESC;",
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).send("Error querying Trainee table");
            return;
          }
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result.result);
        }
      );
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});


 app.post("/getCBAuthToken", function (req, res) {
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
}); 

// app.post("/getCBAuthToken", function (req, res) {
//   try {
//     console.log('CB');
//     const requestData = {
//       grant_type: "refresh_token",
//       client_id: "Ca9b88b95",
//       client_secret:
//         "ITATVWZFQhy2iVO111IuVjMaK8V8hzEjofDd6gxAA2jDJEPMIE5lN7cJtVVSxv0SZH5nSsVf7rYbXtmlcLhMuw",
//       refresh_token:
//         "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk3OGYxMjUzMGNiMjMzZWVkYTQwOTI1OGNiYzhjNTA3IiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2F1dGguY2FyZWVyYnVpbGRlci5jb20iLCJuYmYiOjE3MTcwMTI3ODQsImlhdCI6MTcxNzAxMjc4NCwiZXhwIjoxNzE3MDEzMDg0LCJhdWQiOiJDYTliODhiOTUiLCJhbXIiOlsicHdkIl0sImF0X2hhc2giOiJLOUo2VGZ5dnVMRFpLaXJGS0UwUFJnIiwic2lkIjoiNDBGQzU3MUZDOEY0REUzNjYwMTRGRjU3MTNENkZDMzciLCJzdWIiOiJVREQ2Qko2RzVIV1I5M0pMN0pKIiwiYXV0aF90aW1lIjoxNzE3MDExOTI4LCJpZHAiOiJsb2NhbCIsImVtYWlsIjoibml0aHlhQGFzdGFjcnMuY29tIiwiYWNjb3VudHMiOlsiQTc5ME01NjZKNEpKMkxRRDMxViJdLCJjdXJyZW50X2FjY291bnRfZGlkIjoiQTc5ME01NjZKNEpKMkxRRDMxViIsImdpdmVuX25hbWUiOiJOaXRoeWEiLCJmYW1pbHlfbmFtZSI6Ik4ifQ.k5EU151W0mCWBfiTseDJWndMuEBQ88jbpcgvY67Uk-sb9Zwku86Ry1axCzzPzoPokvbNXp-vGHUi2Yf8NHLml6eHq5li1deXmWhJytBAJBi7nhhnKyiBMY2ssQ6gf6tEjvKOM0qIofAT9OEE5cny-8g3k8W5WMtY2kHO6olsyr7qwNX0SFJqGNC9bYdJFNysv8SdTfSY0W-lPfTu3hK9wa1ZGggh4Obz8xBs7iIWdaig683mTDrBawGoe9IA4M-519CnTeoX9PmKXnyxe5erSK3IO_DfvhGT71MdlYBrvwXXl4CHNtmkLqjilszDEpolQFHSzq46UVzDLk1HW0EVDQ",
//       scope: "offline_access",
//     };

//     const formData = qs.stringify(requestData);

//     const config = {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     };

//     axios
//       .post("https://api.careerbuilder.com/oauth/token", formData, config)
//       .then((result) => {
//         res.send(result.data);
//       })
//       .catch((error) => {
//         console.log(error);
//         res.status(500).send("Error fetching CareerBuilder access token");
//       });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

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
    if (response.data && response.data.length > 0) {
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
              Authorization: `Bearer ${req.body.token}`,
          },
          gzip: true,
      };
      request(options2, (err2, res2, body) => {
          if (err2) {
              console.error(err2);
              res.send({
                  flag: 0,
                  message: "Error fetching preview"
              });
          } else {
              res.send({
                  flag: 1,
                  text: res2.body
              });
          }
      });
  } else {
      res.send({
          flag: 2,
          message: "Message not available"
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
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Error connecting to the database");
        return;
      }
      var request = new sql.Request();
      request.input("FileName", sql.VarChar, req.body.Filename);
      request.input("FileLocation", sql.VarChar, "Content/" + req.body.Filename);
      request.input("UserName", sql.VarChar, req.body.userName);
      request.input("Email", sql.VarChar, req.body.emailID);
      request.execute("InsertJobBoardResume", function (err, recordset) {
        if (err) {
          console.error(err);
          res.status(500).send("Error inserting record into the database");
          return;
        }
        const base64File = req.body.Content;
        const buffer = Buffer.from(base64File, "base64");
        const writeStream = fs.createWriteStream(
          "C:/inetpub/vhosts/tresume.us/httpdocs/Content/" + req.body.Filename
        );
        writeStream.write(buffer);
        writeStream.end();
        let response = {
          msg:"Resume saved successfully"
        }
        res.send(response);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/jobBoardAuditLog", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Error connecting to the database");
        return;
      }
      var request = new sql.Request();
      let filepath = req.body.filepath ? req.body.filepath : "";
      request.query(
        "INSERT INTO JobBoardAudit (JobBoardSource, Query, DateLogged, UserName) VALUES ('" +
          req.body.jobBoard +
          "','" +
          req.body.query +
          "','" +
          req.body.dateTime +
          "','" +
          req.body.userName +
          "')",
        function (err, recordset) {
          if (err) {
            console.error(err);
            res.status(500).send("Error executing SQL query");
            return;
          }
          res.send(recordset.recordsets[0]);
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getJobBoardAuditReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Error connecting to the database");
        return;
      }
      var request = new sql.Request();
      request.query(
        "SELECT OrganizationID FROM Trainee WHERE TraineeID=" +
          req.body.traineeId,
        function (err, recordset) {
          if (err) {
            console.error(err);
            res.status(500).send("Error executing SQL query");
            return;
          }
          var OrgID = recordset.recordsets[0][0].OrganizationID;
          request.input("OrgID", sql.Int, OrgID);
          request.input("startDate", sql.VarChar, req.body.startDate);
          request.input("endDate", sql.VarChar, req.body.endDate);
          request.execute("getJobBoardAuditReport", function (err, recordset) {
            if (err) {
              console.error(err);
              res.status(500).send("Error executing stored procedure");
              return;
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
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

app.post("/getJobBoards", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Error connecting to the database");
        return;
      }
      var request = new sql.Request();
      request.input("TraineeID", sql.Int, req.body.traineeID);
      request.execute("getJobBoards", function (err, recordset) {
        if (err) {
          console.error(err);
          res.status(500).send("Error executing stored procedure");
          return;
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/getResumePath", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Error connecting to the database");
        return;
      }
      var request = new sql.Request();
      request.query(
        `SELECT ResumePath, ResumeName
         FROM Resumes
         WHERE EmailID='` +
          req.body.userName +
          `'`,
        function (err, recordset) {
          if (err) {
            console.error(err);
            res.status(500).send("Error executing SQL query");
            return;
          }
          var result = recordset.recordsets[0];
          res.send(result);
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
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
  }

  request(options, (err, responseFromAPI, body) => {
    if (err) {
      console.error("Error sending request:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }

    if (responseFromAPI.statusCode !== 200) {
      console.error("Error response from API:", responseFromAPI.statusCode);
      return res.status(responseFromAPI.statusCode).send({ error: "API Error" });
    }

    try {
      console.log("Response body from API:", body);
      response = JSON.parse(body);
      res.send(response);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return res.status(500).send({ error: "Error parsing JSON" });
    }
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

  request(options, (err, responseFromAPI, body) => {
    if (err) {
      console.error("Error sending request:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }

    if (responseFromAPI.statusCode !== 200) {
      console.error("Error response from API:", responseFromAPI.statusCode);
      return res.status(responseFromAPI.statusCode).send({ error: "API Error" });
    }

    try {
      console.log("Response body from API:", body);
      response = JSON.parse(body);
      res.send(response);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return res.status(500).send({ error: "Error parsing JSON" });
    }
  });
});

app.post("/getNotSubmittedReport", function (req, res) {
  sql1.connect(config1, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    console.log(req.body);
    try {
      request.query(
        "select tsm.FromDate,tsm.ToDate,r.Username, tsm.UserID from TimeSheetMaster tsm inner join Registration r on tsm.userID = r.RegistrationID where tsm.FromDate BETWEEN '" +
          req.body.fromDate +
          "' AND '" +
          req.body.endDate +
          "' and r.OrganizationId=" +
          req.body.OrganizationId,
        function (err, recordset) {
          if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).send({ error: "Query Execution Error" });
          }

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
              if (err) {
                console.error("Error executing SQL query:", err);
                return res.status(500).send({ error: "Query Execution Error" });
              }
              var result = {
                flag: 1,
                result: recordSet.recordsets[0],
              };
              res.send(result);
            }
          );
        }
      );
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/getSubmittedRatio", function (req, res) {
  sql1.connect(config1, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    console.log(req.body);
    var request = new sql1.Request();
    const now = new Date(); // the date to start counting from
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var previousSunday = new Date(
      today.setDate(today.getDate() - today.getDay() - 7)
    )
      .toISOString()
      .slice(0, 10);
    try {
      request.query(
        "select tsm.FromDate,tsm.ToDate,tsm.UserID from TimeSheetMaster tsm  where tsm.FromDate='" +
          previousSunday +
          "'",
        function (err, recordset) {
          if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).send({ error: "Query Execution Error" });
          }

          const filteredResult =
            recordset == undefined ? recordset.recordsets[0].length : 0;

          request.query(
            "select Name,LegalStatus,EmailID from Registration where RoleID=1 and CreatedOn <'" +
              previousSunday +
              "' and OrganizationId=" +
              req.body.OrganizationId,
            function (err, rex) {
              if (err) {
                console.error("Error executing SQL query:", err);
                return res.status(500).send({ error: "Query Execution Error" });
              }

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
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

//For Division and Division Audit Page

app.post("/createdivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

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

    try {
      request.query(sql, function (err, result) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }

        res.send(result);
        console.log("1 record inserted");
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/updatedivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

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

    try {
      request.query(sql, function (err, result) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }

        res.send(result);
        console.log("1 record Updated");
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/deletedivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    var sql = "DELETE FROM Org_Division WHERE id = '" + req.body.id + "'";
    console.log(sql);

    try {
      request.query(sql, function (err, result) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }

        res.send(result);
        console.log("1 record Deleted");
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

//Division and audit
app.post("/fetchrecruiter", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    
    try {
      var sql =
        "INSERT INTO Org_Division(Orgid,DivisionName,dice,cb,monster,clearancejob,active,createtime,createby,type)VALUES( '" +
        req.body.OrgID +
        "','" +
        req.body.DivisionName +
        "',0,0,0,0,1,'','" +
        req.body.userName +
        "',0)";
      
      request.query(sql, function (err, result) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        
        res.send(result);
        console.log("1 record inserted");
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/addrectodivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    const now = new Date();
    var sql =
      "INSERT INTO Org_Division(Orgid,DivisionName,dice,cb,monster,clearancejob,active,createtime,createby,type)VALUES( '" +
      req.body.OrgID +
      "','" +
      req.body.DivisionName +
      "',0,0,0,0,1,GETDATE(),'" +
      req.body.userName +
      "',0)";
    console.log(sql);

    try {
      request.query(sql, function (err, result) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        res.send(result);
        console.log("1 record inserted");
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/fetchrecruiterfordivision", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    const now = new Date();
    var sql =
      "SELECT * FROM Trainee ud JOIN MemberDetails m ON m.useremail = ud.UserName WHERE m.orgid =" +
      req.body.OrgID;
    console.log(sql);

    try {
      request.query(sql, function (err, recordset) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/fetchrecruiterbyorg", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    const now = new Date();
    var sql = "select * from Org_Division WHERE Orgid =" + req.body.OrgID;
    console.log(sql);

    try {
      request.query(sql, function (err, recordset) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/fetchdivisionbyorg", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    var sql =
      "SELECT  T.FirstName, T.LastName, T.Traineeid, OD.DivisionName, T.UserName, COALESCE(T.monster, 0) AS monster, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 3 AND createtime >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AND createtime <= GETDATE()) AS monsterused, COALESCE(T.cb, 0) AS cb, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 4 AND createtime >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AND createtime <= GETDATE()) AS cbused, COALESCE(T.dice, 0) AS dice, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 2 AND createtime >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AND createtime <= GETDATE()) AS diceused FROM Trainee AS T INNER JOIN org_division AS OD ON T.Org_Div = OD.id WHERE T.organizationid = " +
      req.body.OrgID +
      " ORDER BY OD.DivisionName;";
    console.log(sql);

    try {
      request.query(sql, function (err, recordset) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/addrecruitertodiv", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    var sql =
      "update Trainee set Org_Div = " +
      req.body.divID +
      " where TraineeID =" +
      req.body.recID;
    console.log(sql);

    try {
      request.query(sql, function (err, result) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        res.send(result);
        console.log("1 record updated");
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

//For Job Board Division

app.post("/fetchdvisioncredit", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql1.Request();
    var sql =
      "select od.*,ud.cb as ucb,ud.dice as udice,ud.monster as umonster,ud.OptNation as uOptNation from Org_Division od JOIN Trainee ud ON ud.Org_Div = od.id where ud.UserName ='" +
      req.body.userName +
      "'";
    console.log(sql);

    try {
      request.query(sql, function (err, recordset) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/adddivisionaudit", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

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

    try {
      request.query(sql, function (err, result) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        res.send(result);
        console.log("1 record updated");
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/getclientipaddress", function (req, res) {
  const options = {
    url: "https://api.ipify.org/",
    method: "GET",
  };

  try {
    request(options, (err, response, body) => {
      if (err) {
        console.error("Error sending request:", err);
        return res.status(500).send({ error: "Request Error" });
      }
      
      res.send(response);
    });
  } catch (error) {
    console.error("Error sending request:", error);
    return res.status(500).send({ error: "Request Error" });
  }
});

app.post("/fetchusage", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    const today = new Date();
    let enddate = "";
    if (req.body.type == 1) {
      enddate = "DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)";
    } else {
      enddate = "DATEFROMPARTS(YEAR(GETDATE()), 1, 1)";
    }
    console.log(enddate);

    var request = new sql1.Request();
    var sql =
      "SELECT COUNT(*) AS row_count FROM Division_audit WHERE Jobboardid = " +
      req.body.jobID +
      " AND CreateTime >= " +
      enddate +
      " AND username ='" +
      req.body.userName +
      "'";
    console.log("Fetch Usage: " + sql);

    try {
      request.query(sql, function (err, recordset) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/addPlacement", function (req, res) {
  sql.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }

    var request = new sql.Request();
    const billType = req.body.BillType ? 1 : 0;
    let poEndDate = req.body.POEndDate === "" ? null : req.body.POEndDate;
    let poStartDate = req.body.POStartDate === "" ? null : req.body.POStartDate;
    let datePlaced = req.body.DatePlaced === "" ? null : req.body.DatePlaced;

    request.input("PlacementId", sql.Int, req.body.PlacementID);
    request.input("TraineeID", sql.Int, req.body.TraineeID);
    request.input("Notes", sql.NVarChar(sql.MAX), req.body.Notes);
    request.input("BillRate", sql.NVarChar(50), req.body.BillRate.toString());
    request.input("BillType", sql.Int, billType);
    request.input("CreateBy", sql.NVarChar(100), req.body.CreateBy);
    request.input("MarketerName", sql.Int, req.body.MarketerName);
    request.input("ClientState", sql.NVarChar(50), req.body.ClientState);
    request.input("StartDate", sql.Date, req.body.StartDate);
    request.input("EndDate", sql.Date, req.body.EndDate);
    request.input("DatePlaced", sql.Date, datePlaced);
    request.input("Title", sql.NVarChar(50), req.body.Title);
    request.input("WorkEmailID", sql.NVarChar(100), req.body.CandidateEmailId);
    request.input("ClientName", sql.NVarChar(100), req.body.ClientName);
    request.input("POStartDate", sql.Date, poStartDate);
    request.input("POEndDate", sql.Date, poEndDate);
    request.input(
      "ClientManagerName",
      sql.NVarChar(50),
      req.body.ClientManagerName
    );
    request.input("ClientEmail", sql.NVarChar(100), req.body.ClientEmail);
    request.input("ClientPhone", sql.NVarChar(20), req.body.ClientPhone);
    request.input("ClientAddress", sql.NVarChar(200), req.body.ClientAddress);
    request.input("VendorName", sql.NVarChar(100), req.body.VendorName);
    request.input("VendorContact", sql.NVarChar(50), req.body.VendorContact);
    request.input("VendorEmail", sql.NVarChar(100), req.body.VendorEmail);
    request.input("VendorPhone", sql.NVarChar(20), req.body.VendorPhone);
    request.input("VendorAddress", sql.NVarChar(200), req.body.VendorAddress);
    request.input("SubVendorName", sql.NVarChar(100), req.body.SubVendorName);
    request.input(
      "SubVendorContact",
      sql.NVarChar(50),
      req.body.SubVendorContact
    );
    request.input("SubVendorEmail", sql.NVarChar(100), req.body.SubVendorEmail);
    request.input("SubVendorPhone", sql.NVarChar(20), req.body.SubVendorPhone);
    request.input(
      "SubVendorAddress",
      sql.NVarChar(200),
      req.body.SubVendorAddress
    );
    request.input("PrimaryPlacement", sql.Int, req.body.PrimaryPlacement);

    try {
      request.execute("UpdatePlacement", function (err, recordset) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        var result = {
          flag: 1,
          result: recordset,
        };
        res.send(result);
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/getMarketerNames", async (req, res) => {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    request.input("orgID", sql.Int, req.body.orgID);
    request.input("keyword", sql.NVarChar(100), req.body.keyword);
    
    const recordset = await request.execute("sp_SearchMarketerNames");
    
    if (recordset.recordsets.length === 0) {
      var result = {
        flag: 2,
        result: [],
      };
    } else {
      var result = {
        flag: 1,
        result: recordset.recordsets[0],
      };
    }
    res.send(result);
  } catch (err) {
    console.error("Error fetching marketer names:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post("/getTresumedata", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).send({ error: "Database Connection Error" });
    }
    var request = new sql1.Request();
    var sql =
      `SELECT TOP 100 TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy,YearsOfExpInMonths, skill, LegalStatus, UserOrganizationID, CurrentLocation, Title as [TraineeTitle], ISNULL(LegalStatus,'') as LegalStatus , ISNULL(CONVERT(NVARCHAR(10),CreateTime,101), '1900-01-01T00:00:00') as LastUpdateTime
      FROM Trainee (NOLOCK)
      WHERE (Talentpool IS NULL OR Talentpool = 0)  AND active =1
      AND Role='TRESUMEUSER' AND ProfileStatus = 'READY'
      AND (Skill LIKE '%` +
      req.body.keyword +
      `%' OR Title LIKE '%` +
      req.body.keyword +
      `%')`;
    
    if (req.body.location) {
      sql +=
        `AND
        ((CurrentLocation IN (Select distinct Stateabbr FROM USAZipCodeNew WHERE State ='` +
        req.body.location +
        `' OR City = '` +
        req.body.location +
        `' OR ZipCode = '` +
        req.body.location +
        `')) or
        (CurrentLocation IN (Select distinct State FROM USAZipCodeNew WHERE State = '` +
        req.body.location +
        `' OR City = '` +
        req.body.location +
        `' OR ZipCode = '` +
        req.body.location +
        `')))`;
    }
    
    sql += `ORDER BY ISNULL(CreateTime, '1900-01-01T00:00:00') DESC`;
    
    try {
      request.query(sql, function (err, recordset) {
        if (err) {
          console.error("Error executing SQL query:", err);
          return res.status(500).send({ error: "Query Execution Error" });
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return res.status(500).send({ error: "Query Execution Error" });
    }
  });
});

app.post("/atsmigrateprofile", function (req, res) {
  sql.connect(config, function (err) {
    try {
      if (err) {
        console.error("Error connecting to database:", err);
        throw new Error("Database Connection Error");
      }
      var request = new sql.Request();
      request.query(
        "UPDATE Trainee SET Collab = 1, CandidateStatus = 8,notes = '"+req.body.notes+"' WHERE TraineeID = " +
          req.body.traineeId,
        function (err, recordset) {
          try {
            if (err) {
              console.error("Error executing SQL query:", err);
              throw new Error("Query Execution Error");
            }
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
            };
            res.send(result);
          } catch (queryError) {
            console.error("Error executing SQL query:", queryError);
            res.status(500).send({ error: queryError.message });
          }
        }
      );
    } catch (connectionError) {
      console.error("Error connecting to database:", connectionError);
      res.status(500).send({ error: connectionError.message });
    }
  });
});

app.post("/senddivisionerrormail", async (req, res) => {
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


app.post("/getJoobleSearch", async function (req, res) {
  try {
    console.log("req.keywords", req.keywords);

    const response = await axios.post("https://jooble.org/api/adde971d-e417-460d-bac2-057246c5993f", {
      keywords: req.body.keywords,
      location: req.body.location,
    });

    res.send(response.data);
  } catch (error) {
    console.error("Error occurred while fetching data from Jooble:", error);
    res.status(500).send({ error: "Failed to fetch data from Jooble" });
  }
});

app.post("/checkmd5resume", function (req, res) {
  const timeoutDuration = 60000; // Timeout duration in milliseconds (60 seconds)

  // Set a timeout for the database query
  const timeout = setTimeout(() => {
    const result = {
      flag: 0,
      error: "Request timed out",
    };
    res.status(504).send(result);
  }, timeoutDuration);

  try {
    sql.connect(config, async function (err) {
      clearTimeout(timeout); // Clear the timeout regardless of connection status
      if (err) {
        console.log(err);
        const result = {
          flag: 0,
          error: "An error occurred while connecting to the database",
        };
        res.status(500).send(result);
        return;
      }

      var request = new sql.Request();
      request.query(
        "SELECT * FROM Trainee (nolock) WHERE ats_md5email = '" +
          req.body.md5emailID +
          "' AND Active = 1",
        function (err, recordset) {
          if (err) {
            console.log(err);
            const result = {
              flag: 0,
              error: "An error occurred while querying the database",
            };
            res.status(500).send(result);
            return;
          }
          var result = {
            flag: 1,
            result: recordset.recordsets[0],
          };
          res.send(result.result);
        }
      );
    });
  } catch (error) {
    console.log(error);
    const result = {
      flag: 0,
      error: "An unexpected error occurred",
    };
    res.status(500).send(result);
  }
});

app.post("/getOnboardingCount", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        const result = {
          flag: 0,
          error: "An error occurred while connecting to the database",
        };
        res.status(500).send(result);
        return;
      }
      var request = new sql.Request();
      request.input("OrgID", sql.Int, req.body.OrgID);
      request.execute("GetOnboardingCounts", function (err, recordset) {
        if (err) {
          console.log(err);
          const result = {
            flag: 0,
            error: "An error occurred while executing the query",
          };
          res.status(500).send(result);
          return;
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      });
    });
  } catch (error) {
    console.log(error);
    const result = {
      flag: 0,
      error: "An unexpected error occurred",
    };
    res.status(500).send(result);
  }
});

function parsePhraseToQuery(phrase,inseidesearch) {
  const words = phrase
    .split(/(\(|\)|\b(?:and|or)\b)/i)
    .filter((word) => word.trim() !== "")
    .map((word) => word.replace(/[\'\"]/g, ""));

  let query = "";
  let insideParentheses = false;

  for (let i = 0; i < words.length; i++) {
    console.log(i + "=" + words[i]);
    if (words[i].trim() === "(") {
      query += "(";
    } else if (words[i].trim() === ")") {
      query += ")";
    } else if (words[i].trim() === "AND") {
      query += " AND ";
    } else if (words[i].trim() === "OR") {
      query += " OR ";
    } else if (words[i].trim() === "and") {
      query += " AND ";
    } else if (words[i].trim() === "or") {
      query += " OR ";
    } else {
      query += `skill like '%${words[i].trim()}%' OR Title like '%${words[
        i
      ].trim()}%' OR firstname like '%${words[
        i
      ].trim()}%' OR lastname like '%${words[i].trim()}%'`;
      if(inseidesearch == 1){
        query+=` OR htmlresume like '%${words[i].trim()}%'`
      }
    }
  }

  return query.replace(/AND\s+OR/g, "OR");
}

app.post("/getResumes2", function (req, res) {
  try {
    var traineeId = req.body.traineeId;
    var insidesearch = req.body.insidesearch ? 1 : 0;
    var keyword = parsePhraseToQuery(req.body.keyword,insidesearch);
    var location = req.body.location;
    var title = req.body.jobTitle;
    var daysWithin = req.body.daysWithin;
    var yearsOfExp = req.body.yearsOfExp;
    var yearsOfExpmin = req.body.yearsOfExpmin;
    var Jobboard = req.body.Jobboard.value;
    var OrgID = req.body.OrgID;
    var recruiter = req.body.recruiter;
    var securityclearance = req.body.securityclearance
    
    console.log(Jobboard);

    const timeoutDuration = 60000; // Timeout duration in milliseconds (60 seconds)

    // Set a timeout for the database query
    const timeout = setTimeout(() => {
      return res.status(504).send({
        flag: 0,
        message: "Request timed out",
      });
    }, timeoutDuration);

    sql.connect(config, function (err) {
      clearTimeout(timeout); // Clear the timeout since the connection is established or failed
      if (err) {
        console.error(err);
        return res.status(500).send({
          flag: 0,
          message: "Database connection error.",
        });
      }

      var request = new sql.Request();
      request.query(
        "select OrganizationID from Trainee where TraineeID=" + traineeId,
        function (err, recordset) {
          if (err) {
            console.error(err);
            return res.status(500).send({
              flag: 0,
              message: "Error retrieving OrganizationID.",
            });
          }

          try {
            var OrgID = recordset.recordsets[0][0].OrganizationID;
            var sql = `SELECT TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy, YearsOfExpInMonths,
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
              sql += ` AND Title LIKE '%` + title + `%'`;
            }
            if (daysWithin) {
              sql +=
                ` AND CreateTime >= DATEADD(day, -` +
                daysWithin +
                `, GETDATE())`;
            }
            if (yearsOfExpmin) {
              if (yearsOfExp) {
                sql +=
                  `AND YearsOfExpInMonths BETWEEN ` +
                  yearsOfExpmin * 12 +
                  ` AND ` +
                  yearsOfExp * 12;
              } else {
                sql += `AND YearsOfExpInMonths >= ` + yearsOfExpmin * 12;
              }
            }
            if (Jobboard) {
              if (Jobboard != "all") {
                sql += ` AND Source LIKE '%` + Jobboard + `%'`;
              }
            }
            sql += `AND T.UserOrganizationID = '` + OrgID + `'`;

            if (recruiter != 0) {
              sql += `AND T.CreateBy = '` + recruiter + `'`;
            }
            if (securityclearance) {
              sql += `AND T.securityclearance = '1'`;
            }

            sql += ` ORDER BY ISNULL(CreateTime, '1900-01-01T00:00:00') DESC`;
            console.log(sql);
            request.query(sql, function (err, recordset) {
              if (err) {
                console.error(err);
                return res.status(500).send({
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
            return res.status(500).send({
              flag: 0,
              message: "An unexpected error occurred.",
            });
          }
        }
      );
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
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
        "select OrganizationID from Trainee where TraineeID=" + traineeId,
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
            var sql = `SELECT TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy, YearsOfExpInMonths,
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
                sql +=
                  `AND createtime BETWEEN '` +
                  startdate +
                  `' AND '` +
                  endate +
                  `'`;
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
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        const result = {
          flag: 0,
          error: "An error occurred while connecting to the database",
        };
        res.status(500).send(result);
        return;
      }
      var request = new sql.Request();
      request.query(
        " SELECT DISTINCT currentlocation from trainee ORDER BY currentlocation",
        function (err, recordset) {
          if (err) {
            console.log(err);
            const result = {
              flag: 0,
              error: "An error occurred while querying the database",
            };
            res.status(500).send(result);
            return;
          }

          var location = recordset.recordsets[0];
          const transformedArray = location
            .filter(
              (item) =>
                item?.currentlocation &&
                item.currentlocation !== "NULL" &&
                item.currentlocation.trim() !== ""
            )
            .map((item) => item.currentlocation);
          var result = {
            flag: 1,
            result: transformedArray,
          };
          res.send(result);
        }
      );
    });
  } catch (error) {
    console.log(error);
    const result = {
      flag: 0,
      error: "An unexpected error occurred",
    };
    res.status(500).send(result);
  }
});

app.post("/getorganizationLogo", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database connection error");
      }

      var request = new sql.Request();
      var sqlQuery =
        "SELECT logo,organizationName FROM Organization WHERE OrganizationID =" +
        req.body.OrgID;

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
  } catch (error) {
    console.log(error);
    res.status(500).send("An unexpected error occurred");
  }
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
  res.send("ok");
});

app.post("/FetchRecruiterList", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database connection error");
      }

      var request = new sql.Request();
      var sqlQuery =
        "SELECT username as value, CONCAT(Firstname, ' ', LastName) AS name FROM trainee WHERE organizationid = " +
        req.body.OrgID +
        " AND Active = 1 AND Role = 'RECRUITER' AND AccountStatus = 'ACTIVE' ORDER BY Firstname ASC";

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
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

app.post("/updateCandidateNotes", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database connection error");
      }

      var request = new sql.Request();
      var sqlQuery =
        "Update Trainee Set Notes='" +
        req.body.Notes +
        "' where traineeid = " +
        req.body.traineeID;
      console.log(sqlQuery);
      request.query(sqlQuery, function (err, recordset) {
        if (err) {
          console.log(err);
          return res.status(500).send("Database query error");
        }

        var result = {
          flag: 1,
        };

        res.send(result);
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

app.post("/getRecriterUsage", function (req, res) {
  try {
    var startdate = req.body.startDate;
    var enddate = req.body.endDate;
    sql1.connect(config, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database connection error");
      }
      var request = new sql1.Request();
      var sql =
        "SELECT  T.FirstName + ' ' + T.LastName AS recruiterName, COALESCE(T.monster, 0) AS monster, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 3 AND createtime >= '" +
        startdate +
        "' AND createtime <= '" +
        enddate +
        "') AS monsterused, COALESCE(T.cb, 0) AS cb, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 4 AND createtime >= '" +
        startdate +
        "' AND createtime <= '" +
        enddate +
        "') AS cbused, COALESCE(T.dice, 0) AS dice, (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 2 AND createtime >= '" +
        startdate +
        "' AND createtime <= '" +
        enddate +
        "') AS diceused FROM Trainee AS T INNER JOIN org_division AS OD ON T.Org_Div = OD.id WHERE T.organizationid = " +
        req.body.OrgID +
        " ORDER BY OD.DivisionName";
      console.log(sql);
      request.query(sql, function (err, recordset) {
        if (err) {
          console.log(err);
          return res.status(500).send("Database query error");
        }
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

app.post("/getplacementsBytID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database connection error");
      }
      const traineeId = req.body.TraineeID;
      var request = new sql.Request();
      var sqlQuery =
        "SELECT * FROM placements WHERE traineeid =" +
        traineeId +
        " ORDER BY PlacedDate";
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
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

app.post("/UpdateplacementsBytID", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database connection error");
      }
      const PlacementID = req.body.PID ? req.body.PID : "''";
      const CandidateDocumentID = req.body.CID;
      var request = new sql.Request();
      var sqlQuery =
        "update CandidateDocument_New set PlacementID = " +
        PlacementID +
        " where CandidateDocumentID = " +
        CandidateDocumentID;
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
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

app.post("/getDiceAuthToken", async (req, res) => {
  try {
    // Set up the HTTP headers for the request
    const clientId = "digitalmakerssolution";
    const clientSecret = "8ea58fcc-8ddb-413c-8130-795d2a455009";
    const authEndpoint = "https://secure.dice.com/oauth/token";
    const httpOptions = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      withCredentials: true,
    };

    // Define the request body
    const requestBody =
      "grant_type=password&username=nithya@dmsol.in&password=Dicedms23@";

    // Make a POST request to the authentication endpoint
    const response = await axios.post(authEndpoint, requestBody, httpOptions);

    // Send the response data to the client
    res.json(response.data);
  } catch (error) {
    // Handle errors
    console.error("Error getting Dice auth token:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/JobboardUsageReport", function (req, res) {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("Database connection error");
      }
      
      var request = new sql.Request();
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const orgID = req.body.OrgID;

        const sqlQuery = `
            SELECT
                CONCAT(T.Firstname, ' ', T.LastName) as Name,
                T.Traineeid,
                OD.DivisionName,
                T.UserName,
                COALESCE(T.monster, 0) AS monster,
                (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 3 AND createtime >= '${startDate}' AND createtime <= '${endDate}') AS monsterused,
                COALESCE(T.cb, 0) AS cb,
                (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 4 AND createtime >= '${startDate}' AND createtime <= '${endDate}') AS cbused,
                COALESCE(T.dice, 0) AS dice,
                (SELECT COUNT(id) FROM division_audit WHERE username = T.Username AND jobboardid = 2 AND createtime >= '${startDate}' AND createtime <= '${endDate}') AS diceused
            FROM
                Trainee AS T
            INNER JOIN
                org_division AS OD ON T.Org_Div = OD.id
            WHERE
                OD.Orgid = '${orgID}' AND T.Active = 1
            ORDER BY
                OD.DivisionName;`;

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
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

app.post('/performancereport', async (req, res) => {
  try {
    if(req.body.recruiterId == 'All'){
      const [
        submissionlist,interviewlist,placementlist
     ] = await Promise.all([
         pool.query("SELECT CONCAT(rt.Firstname, ' ', rt.LastName) as Candidate, s.clientname FROM trainee t JOIN Submission s ON t.traineeid = s.markerterid JOIN Trainee rt ON rt.TraineeID = s.TraineeID WHERE t.organizationid = "+req.body.orgID),
         pool.query("SELECT CONCAT(rt.Firstname, ' ', rt.LastName) as Candidate, s.clientname FROM trainee t JOIN         placements s ON CAST(t.traineeid AS VARCHAR) = s.marketername JOIN Trainee rt ON rt.TraineeID = s.TraineeID          WHERE rt.Active=1 and s.ACTIVE = 1 and t.organizationid = "+req.body.orgID),
         pool.query("SELECT CONCAT(rt.Firstname, ' ', rt.LastName) as Candidate, s.clientname FROM trainee t JOIN Traineeinterview s ON t.traineeid = s.recruiterid JOIN Trainee rt ON rt.TraineeID = s.TraineeID WHERE t.organizationid ="+req.body.orgID),
         
     ]);

     const responseData = {
         submissionlist: submissionlist.recordset,
         placementlist: placementlist.recordset,
         interviewlist: interviewlist.recordset,

         
     };

     res.json(responseData);
    }else{
      const [
        submissionlist,interviewlist,placementlist
     ] = await Promise.all([
      pool.query("select CONCAT(t.Firstname, ' ', t.LastName) as Candidate,s.clientname  from submission as s inner join trainee as t on t.traineeid = s.traineeid where s.MarkerterID ='"+req.body.recruiterId+"' AND s.createtime between '"+req.body.fromDate+"' AND '"+req.body.toDate+"'"),
      pool.query("SELECT CONCAT(t.Firstname, ' ', t.LastName)as Candidate, p.clientname FROM placements as p  inner join trainee as t on t.traineeid = p.traineeid where CAST(p.marketername AS VARCHAR) ='"+req.body.recruiterId+"' AND p.createdtime between '"+req.body.fromDate+"' AND '"+req.body.toDate+"'"),
      pool.query("SELECT CONCAT(t.Firstname, ' ', t.LastName)as Candidate,i.clientname FROM Traineeinterview as i inner join trainee as t on t.traineeid = i.traineeid where i.recruiterid ='"+req.body.recruiterId+"' AND i.createtime between '"+req.body.fromDate+"' AND '"+req.body.toDate+"'"),
         
     ]);

     const responseData = {
         submissionlist: submissionlist.recordset,
         placementlist: placementlist.recordset,
         interviewlist: interviewlist.recordset,

         
     };

     res.json(responseData);
    }
      
  } catch (error) {
      console.error('Error fetching data:', error);
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
