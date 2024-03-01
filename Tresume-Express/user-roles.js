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

router.post('/getOrgUserList', async (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = "SELECT  MD.id,  MD.useremail,  MD.firstname AS MemberFirstName,  MD.lastname AS MemberLastName, RN.RoleName, ISNULL( STRING_AGG( COALESCE(T.firstname, '--'), ', ' ) WITHIN GROUP (ORDER BY T.Traineeid),      '--'  ) AS TeamLeads FROM Memberdetails MD LEFT JOIN Trainee T ON CHARINDEX(CONVERT(NVARCHAR(10), T.Traineeid), MD.teamlead) > 0 LEFT JOIN RolesNew RN ON MD.roleid = RN.RoleID WHERE MD.orgID = '" + req.body.OrgID + "' and MD.active = 1 GROUP BY MD.id, MD.useremail, MD.firstname, MD.lastname, RN.RoleName";
    console.log(query);
    request.query(query,
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

})

router.post('/getOrganizationaccess', async (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = "SELECT modulesnew.id, modulesnew.ModuleName FROM Organization INNER JOIN modulesnew ON CHARINDEX(',' + CAST(modulesnew.id AS  VARCHAR(MAX)) + ',', ',' + Organization.access + ',') > 0 WHERE Organization.organizationid = '" + req.body.OrgID + "' AND modulesnew.Active = 1";
    console.log(query);
    request.query(query,
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

})

router.post('/addrole', async (req, res) => {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send({ error: 'Database connection error' });
    }

    var request = new sql.Request();
    var query = "INSERT INTO RolesNew (RoleName,Active,ViewOnly,FullAccess,DashboardPermission,OrganizationID,WorkflowID,CreatedBy,CreateTime) VALUES ('" + req.body.rolename + "',1,'" + req.body.viewaccess + "','" + req.body.fullaccess + "',1,'" + req.body.OrgID + "','','" + req.body.createby + "',(SELECT CAST(GETDATE() AS DATE)))";
    console.log(query);

    request.query(query, function (err, recordset) {
      if (err) {
        console.log(err);
        return res.status(500).send({ error: 'SQL query execution error' });
      }

      var result = {
        flag: 1,
      };

      res.send(result);
    });
  });
});

router.post('/fetchOrgrole', async (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = "select * from RolesNew where OrganizationID = '" + req.body.OrgID + "'";
    console.log(query);
    request.query(query,
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

})

router.post('/addMember', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query('SELECT ISNULL(MAX(ID), 0) AS lastId FROM MemberDetails');
    const lastId = result.recordset[0].lastId + 1;
    const currentDate = new Date().toISOString().split('T')[0];

    const insertQuery = `INSERT INTO MemberDetails (ID, SubscriptionID, UserEmail, IsAdmin, Active, OrgId, CreateTime, CreateBy, UpdateTime, UpdateBy, TraineeID, FirstName, LastName, JobSlotCount, IsOwner, SlotsAlocDice, SlotsAlocCB, SlotsUsedDice, SlotsUsedCB, refreshperiod, RoleID, WFID, AccessOrg, PrimaryOrgID, TeamLead, HisCandidate, TeamCandidate, AllCandidate, DocumentAccess, Traker)
  VALUES (${lastId}, '0', '${req.body.UserEmail}', '0', '1', '${req.body.OrgId}', '${currentDate}', '${req.body.CreateBy}', '${currentDate}', '${req.body.CreateBy}', '', '${req.body.FirstName}', '${req.body.LastName}', '0', '0', '0', '0', '0', '0', '0', '${req.body.RoleID}', '1', '${req.body.OrgId}', '${req.body.OrgId}', '${req.body.TeamLead}', '', '', '', '0', '0')`;

    console.log(insertQuery);
    await pool.request().query(insertQuery);

    res.send({ flag: 1 });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: 'An error occurred' });
  }
});

router.post('/deleteUserAccount', async (req, res) => {
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

router.post('/getUserProfile', async (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var query = "SELECT * FROM trainee where traineeid =" + req.body.traineeID;
    console.log(query);
    request.query(query,
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

})

router.post('/updateMyProfile', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const query = `UPDATE Trainee SET FirstName = '${req.body.FirstName}', MiddleName = '${req.body.MiddleName}', LastName = '${req.body.LastName}', YearsOfExpInMonths = '${req.body.YearsOfExpInMonths}', Title = '${req.body.Title}', DOB = '${req.body.DOB}', PhoneNumber = '${req.body.PhoneNumber}', state = '${req.body.state}', city = '${req.body.city}', zipcode = '${req.body.zipcode}' WHERE traineeID = ${req.body.traineeID}`;

    console.log(query);

    const recordset = await request.query(query);

    const result = {
      flag: 1,
      result: recordset || recordset.recordsets || recordset.recordsets[0],
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query error' });
  }
});

router.post('/validatepassword', async (req, res) => {
  console.log(req);
  var oldPassword = req.body.oldPassword;
  var traineeid = req.body.traineeid;
  try {
    sql.connect(config, function (err) {
      if (err) console.log(err);
      var request = new sql.Request();

      var query = "SELECT password FROM trainee where Active = 1 and traineeid = '" + traineeid + "'";

      console.log(query);
      request.query(query,
        function (err, recordset) {
          if (err) {
            console.log(err);
            res.status(500).json({ message: 'An error occurred' });
            return; 
          }
          if (!recordset || !recordset.recordsets || recordset.recordsets.length === 0) {
            var result = {
              flag: 2,
              message: 'Not Valid Key',
            };
            res.send(result);
            return;
          }
          var trainee = recordset.recordsets[0];
          var currentpassword = decrypter(trainee[0].password);
          
          console.log(currentpassword);
          if (currentpassword == oldPassword) {
            var result = {
              flag: 1,
              message: 'Valid key',
            };
            res.send(result);
          } else {
            var result = {
              flag: 2,
              message: 'Not Valid Key',
            };
            res.send(result);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

router.post('/newpassword', async (req, res) => {
  console.log(req);
  var password = req.body.password;
  var traineeid =req.body.traineeid;

  var encryptpassword = encrypter(password);
  try {
    sql.connect(config, function (err) {
      if (err) console.log(err);
      var request = new sql.Request();

      var query = "UPDATE trainee set resetkey = '0', password = '" + encryptpassword + "' where traineeid ='" + traineeid + "'";

      request.query(query,
        function (err, recordset) {
          if (err) console.log(err);

          var result = {
            flag: 1,
            message: 'Password Updated Succesfully',
          };
          res.send(result);
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

function encrypter(text) {
  var key = 'NesaMani&Co';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', generateKey(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + encrypted;
}

function decrypter(encryptedText) {
  var key = 'NesaMani&Co';
  const iv = Buffer.from(encryptedText.slice(0, 32), 'hex'); 
  const encryptedData = encryptedText.slice(32); 

  const decipher = crypto.createDecipheriv('aes-256-cbc', generateKey(key), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
function generateKey(key) {
  const hash = crypto.createHash('sha256').update(key).digest();
  return hash;
}
module.exports = router;


