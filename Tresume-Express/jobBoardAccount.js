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


router.post('/insertJobBoardAccountList', async (req, res) => {
 
    try {

        const pool = await sql.connect(config);
        const request = pool.request();
     const query = "INSERT INTO dbo .JobBoardAccount (JobBoardID, RecruiterID, AccountName, SubscriptionFrom, SubscriptionTO, SupplierID, USERNAME, PASSWORD, Active, CreatedDate, AuthToken, ClientId, ClientSecret, Base64ClientIdSecret, RedirectURl, AccessToken, AccessCreatedTime, RefreshToken, RefreshCreatedTime) VALUES ('" + req.body.AccountName + "', '" + req.body.SubscriptionFrom + "', '" + req.body.SubscriptionTO + "', '" + req.body.USERNAME + "', '" + req.body.PASSWORD + "',)";
        console.log(query);
        const queryResult = await request.query(query);
        if (queryResult.rowsAffected[0] === 0) {
          throw new Error("No records found!");
        }
        return queryResult;
      } catch (error) {
        console.error("Error while deleting client:", error);
        throw error;
      } 
});

// router.post('/getProjectList', async (req, res) => {
//     try {
//       const pool = await sql.connect(config);
//       const request = new sql.Request();
//       const query = "SELECT tp.projectname, c.ClientName, tp.netterms FROM timesheet_project tp INNER JOIN clients c ON tp.clientname = c.ClientID WHERE tp.orgid = '" +req.body.orgid+ "' AND tp.status = 1";
  
//       console.log(query);
  
//       const recordset = await request.query(query);
  
//       if (recordset && recordset.recordsets && recordset.recordsets.length > 0) {
//         const result = {
//           flag: 1,
//           result: recordset.recordsets[0],
//         };
//         res.send(result);
//       } else {
//         const result = {
//           flag: 0,
//           error: "No active clients found! ",
//         };
//         res.send(result); 
//       }
//     } catch (error) {
//       console.error("Error fetching client data:", error);
//       const result = {
//         flag: 0,
//         error: "An error occurred while fetching client data!",
//       };
//       res.status(500).send(result);
//     }
//   });

module.exports = router;
