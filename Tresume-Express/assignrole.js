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

router.post('/fetchtimesheetcandidate', async  (req, res) => {
  
  try {
  const organizationid = req.body.OrgID;

  if (!organizationid) {
    return res.status(400).json({ error: 'organizationid is required' });
  }


  await sql.connect(config, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    const query = 'SELECT traineeid, firstname, lastname FROM trainee WHERE userorganizationid = '+organizationid;
    
    console.log(query);
    const request = new sql.Request();
    request.query(query, (err, result) => {
      if (err) {
        console.error(err);
        sql.close();
        return res.status(500).json({ error: 'Database query error' });
      }
      sql.close();
      console.log(result)
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



