const express = require("express");
const router = express.Router();
const pool = require("./database");
var request = require("request");
var sql1 = require("mssql");
var sql = require("mssql");
var moment = require('moment-timezone');
// const fetch = require('node-fetch');
const axios = require("axios");
const nodemailer = require("nodemailer");

const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
const apiUrl = envconfig.apiUrl;

require('moment-timezone');

const EST = 'America/New_York';



const config = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "Tresume",
  trustServerCertificate: true,
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

router.post("/addharvest", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();

    const scheduledtime = moment.tz(req.body.scheduledtime, EST).format("YYYY-MM-DD HH:mm:ss");
    console.log(scheduledtime);

    var keywords = req.body.keywords ? req.body.keywords : '';
    var radius = req.body.radius ? req.body.radius : 0;
    var Lastupdated = req.body.Lastupdated ? req.body.Lastupdated : 0;

    var sql =
      "INSERT INTO Harvest_New (recid,jobboardid,keywords,jobtitle,location,radius,Lastupdated,createtime,scheduledtime,downloadlimit,status,orgID,job_description,recemail) VALUES ('" +req.body.recid +
      "','" + req.body.jobboardid + "','" + keywords+ "','" + req.body.jobtitle + "','" + req.body.location + "','" + radius + "','" + Lastupdated + "',GETDATE(),'" + scheduledtime + "','" + req.body.downloadlimit + "','" + req.body.status + "','" + req.body.orgID + "','" + req.body.job_description + "','" + req.body.recemail + "')";
    console.log(sql);
    request.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
      console.log("1 record inserted");
    });
  });
});

router.post("/fetchharvest", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    const now = new Date(); // the date to start counting from
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var sql =
      "SELECT H.*, O.Organizationname, JB.JobBoardName,T.FirstName, T.LastName FROM Harvest_New H JOIN organization O ON H.orgid = O.Organizationid JOIN JobBoards JB ON H.jobboardid = JB.JobBoardId JOIN Trainee T ON H.recid = T.TraineeID WHERE H.orgid =" +
      req.body.OrgID +
      "ORDER BY scheduledtime DESC";
    // console.log(sql);
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

function fetchharvstdata() {
  return new Promise(function (resolve, reject) {
    sql1.connect(config, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        var request = new sql1.Request();
        var sql = `SELECT * FROM Harvest_New WHERE status=1 AND scheduledtime BETWEEN GETDATE() AND DATEADD(minute, 15, GETDATE());`;
        // console.log(sql);
        request.query(sql, function (err, recordset) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            // console.log(recordset.recordsets[0]);
            resolve(recordset.recordsets[0]);
          }
        });
      }
    });
  });
}

router.post("/fetchharvestcandidate", function (req, res) {
  try {
    sql1.connect(config, function (err) {
      if (err) console.log(err);
      var request = new sql1.Request();

      var sql2 =
        `SELECT TraineeID, (FirstName + ' ' + LastName) AS FullName, FirstName, LastName, UserName, CreateBy, YearsOfExpInMonths, ISNULL(YearsOfExpInMonths,0) [YRSEXP], LegalStatus, UserOrganizationID, CurrentLocation, Title as [TraineeTitle], ISNULL(LegalStatus,'') , ISNULL(CONVERT(NVARCHAR(10),CreateTime,101), '1900-01-01T00:00:00') as LastUpdateTime, ISNULL(YearsOfExpInMonths,0), Source
        FROM Trainee (NOLOCK) WHERE harvest = '` +
        req.body.harvestid +
        `'`;
      // console.log(sql2);

      request.query(sql2, function (err, recordset) {
        if (err) throw err;
        // console.log(recordset);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(result);
      });
    });
  } catch (err) {
    console.log("Error caught:", err);
  }
});

router.get("/runharvest", async function (req, res) {
  try {
    const scheduleList = await fetchharvstdata();
    var data = "";
    for (let i = 0; i < scheduleList.length; i++) {
      const jobboardId = scheduleList[i].jobboardid;
      if (jobboardId == 3) {
        const result = await runMonster(scheduleList[i]);
        data = "Harvest Completed Successfully";
      }
    }
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching data");
  }
});

async function runMonster(scheduleData) {
  console.log("runMonster Function")
  const request =
    "grant_type=client_credentials&scope=GatewayAccess&client_id=xw315565570wxrds&client_secret=3FeLETRO2RvkMszQ";
  const tokenUrl = "https://sso.monster.com/core/connect/token";
  const searchUrl = "https://api.jobs.com/v2/candidates/queries";

  const tokenConfig = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const searchConfig = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-US,en;q=0.8",
      "content-encoding": "gzip",
    },
    gzip: true,
    qs: {
      page: scheduleData.page,
      perPage: 10,
    },
  };

  try {
    // Step 1: Get access token
    const tokenResponse = await axios.post(tokenUrl, request, tokenConfig);
    const token = tokenResponse.data.access_token;
    console.log('GET monster Token');
    // Step 2: Perform search
    const searchData = {
      token: token,
      searchType: "jobDetail",
      radius: scheduleData.radius,
      location: scheduleData.location,
      jobDesc: scheduleData.job_description,
      jobTitle: scheduleData.jobtitle,
      recruiterid: scheduleData.recid,
      recruiteremail: scheduleData.recemail,
      orgID: scheduleData.orgID,
    };

    searchConfig.url = searchUrl;
    searchConfig.headers.Authorization = `Bearer ${searchData.token}`;
    searchConfig.data = {
      country: "US",
      searchType: searchData.searchType,
      jobDetail: {
        jobTitle: searchData.jobTitle,
        jobDescription: searchData.jobDesc,
        locations: [
          {
            locationExpression: searchData.location,
            radius: searchData.radius,
          },
        ],
      },
    };

    const searchResponse = await axios(searchConfig);
    const candidates = searchResponse.data?.candidates;
    const downloadLimit = scheduleData.downloadlimit;
    console.log('GET monster candidate');
    console.log("Candidates :" + candidates.length);
    if (candidates) {
      let downloadCount = 0;

      for (let i = 0; i < candidates.length; i++) {

        if (downloadCount >= downloadLimit) {
          try {
            console.log('Final Update');
            await sql.connect(config);

            const query = `
              UPDATE Harvest_New
              SET status = 2, downloaded = '${downloadLimit}'
              WHERE id = '${scheduleData.id}'
            `;
            console.log(query);
            await sql.query(query);
            sql.close();
            const subject = "Resume Harvesting Successfully Completed";
            const text =
              "Dear Recruiter,</br>" +
              "Our system has efficiently gathered the resumes as per your requirements.</br>" +
              "We have collected a total of " +
              downloadCount +
              " resumes, which encompass a diverse range of qualifications and skillsets.";

            const mailData = {
              from: "support@tresume.us",
              to: searchData.recruiteremail,
              // to: 'wilson.am@tresume.us',
              subject: subject,
              html: text,
            };

            transporter.sendMail(mailData, (error, info) => {
              if (error) {
                return console.log(error);
              }
            });

            break;
          } catch (error) {
            console.error("Error updating status:", error);
          }
        }
        console.log('Candidate No :'+i);
        const candidate = candidates[i];
        const md5EmailAddress = candidate.identity.md5EmailAddress;
        const textResumeID = candidate.identity.textResumeID;
        const OrganizationID = searchData.orgID.toString();

        try {
          const pool = await sql.connect(config);

          // Search for data in the 'Trainee' table using md5EmailAddress
          const queryResult = await pool
            .request()
            .input("md5EmailAddress", sql.VarChar, md5EmailAddress)
            .query(
              "SELECT * FROM Trainee WHERE ats_md5email = @md5EmailAddress"
            );

          const traineeData = queryResult.recordset[0];
          console.log('Search resume in db');
          if (traineeData) {
            const queryResult2 = await pool
              .request()
              .input("md5EmailAddress", sql.VarChar, md5EmailAddress)
              .input("userorganizationid", sql.VarChar, OrganizationID)
              .query(
                "SELECT * FROM Trainee WHERE ats_md5email = @md5EmailAddress AND userorganizationid = @userorganizationid"
              );

            const traineeData2 = queryResult2.recordset[0];
            if (traineeData2) {
            } else {
              console.log('Copy resume');
              //Copy that Candidate to this org
              const copiedRecord = { ...queryResult2.recordset[0] };
              delete copiedRecord.TraineeID;
              copiedRecord.OrganizationID = searchData.orgID;
              await sql.connect(config);
              const query = `SELECT ISNULL(MAX(TraineeID), 0) + 1 AS NextTraineeID FROM Trainee (NOLOCK)`;
              const result = await sql.query(query);
              copiedRecord.TraineeID = result.recordset[0].NextTraineeID;
              copiedRecord.Active = '1';
              copiedRecord.harvest = scheduleData.id;
              const insertQuery = `
              INSERT INTO Trainee (${Object.keys(copiedRecord).join(", ")})
              VALUES (${Object.values(copiedRecord)
                .map((value) => `'${value}'`)
                .join(", ")})`;
              const insertResult = await pool.request().query(insertQuery);
              console.log("Insert Result :"+insertResult);
              downloadCount++;
            }
          } else {
            console.log('Before download');
            var data = {
              resumeID: textResumeID,
              token: searchData.token,
              recruiterid: scheduleData.recemail,
              orgID: searchData.orgID,
              recemail: searchData.recruiteremail,
              harvest: scheduleData.id,
            };
            await getMonsterCandidateResume(data);
            downloadCount++;
          }
        } catch (error) {
          // Handle any errors that occurred during the database connection or query
          console.error("Error:", error);
        }
      }
    }else{
      const subject = "Resume Harvesting Status - Unsuccessful";
    const text =
      "Dear Recruiter,</br>" +
      "I regret to inform you that the resume harvesting process has encountered difficulties and was unsuccessful in gathering the desired resumes from your search query.</br>" +
      "Thank you for your understanding, and we apologize for any inconvenience caused by this unexpected setback. We value your partnership and remain dedicated to delivering exceptional service."+ error;

    const mailData = {
      from: "support@tresume.us",
      to: searchData.recruiteremail,
      // to: 'wilson.am@tresume.us',
      subject: subject,
      html: text,
    };

    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });
    }
  } catch (error) {
    const subject = "Resume Harvesting Status - Unsuccessful";
    const text =
      "Dear Recruiter,</br>" +
      "I regret to inform you that the resume harvesting process has encountered difficulties and was unsuccessful in gathering the desired resumes.</br>" +
      "Thank you for your understanding, and we apologize for any inconvenience caused by this unexpected setback. We value your partnership and remain dedicated to delivering exceptional service."+ error;

    const mailData = {
      from: "support@tresume.us",
      to: 'wilson.am@tresume.us',
      subject: subject,
      html: text,
    };

    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });
    throw new Error(error);
  }
}

// function getMonsterCandidateResume(textResumeID) {
//   console.log(textResumeID);
// }

async function getMonsterCandidateResume(data) {
  console.log('after download function');
  try {
    const response = await axios.get(
      `https://api.jobs.com/v2/candidates/${data.resumeID}`,
      {
        headers: {
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "accept-encoding": "gzip, deflate",
          "accept-language": "en-US,en;q=0.8",
          "content-encoding": "gzip",
          Authorization: `Bearer ${data.token}`,
        },
        gzip: true,
        qs: {
          resumeBoardId: 1,
          verbose: true,
        },
      }
    );
    
    console.log("Download response : "+response.data);  
    const recruiterid = data.recruiterid;
    const profileDetails = response.data;
    const emailID = profileDetails.identity.emailAddress;
    const md5EmailAddress = profileDetails.identity.md5EmailAddress;
    const divcandidateemail = profileDetails.identity.emailAddress;
    const name = profileDetails.identity.name.split(" ");
    const firstName = name[0];
    const lastName = name[1];
    const title = profileDetails.targetJobTitle;
    const currentLocation = profileDetails.location.state;
    const yearsOfExpInMonths = (
      profileDetails.yearsOfExperience * 12
    ).toString();
    const skillList = profileDetails.relevance.skills;
    const skills = skillList.map((itm) => itm.name);
    const htmlResume = profileDetails.resume;
    const source = "Monster";
    const ATSID = data.textResumeID;
    

    const pool = await sql.connect(config);
    const request = pool.request();

    console.log(emailID);
    console.log(md5EmailAddress);

    const queryResult = await request.query(
      `SELECT OrganizationID, UserName FROM Trainee WHERE UserName ='${data.recruiterid}'`
    );
    const OrgID = queryResult.recordsets[0][0].OrganizationID;
    const UserName = queryResult.recordsets[0][0].UserName;
    console.log(UserName);
    const skillsString = skills.join(",");
    console.log(data.harvest);
    request.input("EmailID", sql.VarChar, emailID);
    request.input("FirstName", sql.VarChar, firstName);
    request.input("LastName", sql.VarChar, lastName);
    request.input("Title", sql.VarChar, title);
    request.input("CurrentLocation", sql.VarChar, currentLocation);
    request.input("YearsOfExpInMonths", sql.VarChar, yearsOfExpInMonths);
    request.input("Skills", sql.VarChar, skillsString);
    request.input("HtmlResume", sql.VarChar, htmlResume);
    request.input("Source", sql.VarChar, data.source);
    request.input("ATSID", sql.VarChar, ATSID);
    request.input("UserOrganizationID", sql.Int, OrgID);
    request.input("CreateBy", sql.VarChar, UserName);
    request.input("harvest", sql.VarChar, data.harvest.toString());
    request.input("ats_md5email", sql.VarChar, md5EmailAddress);

    const result = await request.execute("CreateJobSeekerProfile");
    console.log('Profile created');
    const secondPool = await sql.connect(config);
    const secondRequest = secondPool.request();
    secondRequest.input("FileName", sql.VarChar, fileName);
    secondRequest.input("FileLocation", sql.VarChar, "Content/" + fileName);
    secondRequest.input("UserName", sql.VarChar, recruiterid);
    secondRequest.input("Email", sql.VarChar, emailID);

    const secondResult = await secondRequest.execute("InsertJobBoardResume");

    console.log('Resume insert');
    const b64Data = profileDetails.resumeDocument.file;
    const fileName = profileDetails.resumeDocument.fileName;
    const base64File = b64toBlob(b64Data, contentType);
    const buffer = Buffer.from(base64File, "base64");
    const writeStream = fs.createWriteStream(
      "C:/inetpub/vhosts/tresume.us/httpdocs/Content/" + fileName
    );
    writeStream.write(buffer);
    writeStream.end();
    console.log('Pdf write');
    sql.close();
  } catch (error) {
    console.log(error);
  }
}

const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
  const byteCharacters = Buffer.from(b64Data, "base64").toString("binary");
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};
router.post("/deleteharvest", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql = "DELETE FROM harvest_new WHERE id = " + req.body.harvestid;
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

router.post("/deleteAudit", function (req, res) {
  sql1.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql1.Request();
    var sql =
      "DELETE FROM division_audit WHERE username = '" +
      req.body.userName +
      "' AND id = (SELECT TOP 1 id FROM division_audit   WHERE username = '" +
      req.body.userName +
      "'   ORDER BY id DESC);";
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

module.exports = router;
