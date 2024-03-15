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


// router.post('/getDocumnetType', async (req, res) => {
//     try {
//       const pool = await sql.connect(config);
//       const request = pool.request();
//       const query = "select * from CorporateDocType WHERE Active = 1"
  
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
//           error: "No active Category found! ",
//         };
//         res.send(result); 
//       }
//     } catch (error) {
//       console.error("Error fetching Category data:", error);
//       const result = {
//         flag: 0,
//         error: "An error occurred while fetching Category!",
//       };
//       res.status(500).send(result);
//     }
//   });

  router.post("/getDocumnetType", function (req, res) {
    sql.connect(config, function (err) {
      if (err) console.log(err);
      var request = new sql.Request();
      request.query("select * from CorporateDocType WHERE Active = 1", function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      });
    });
  });

  router.post("/deletecorporatedocument", function (req, res) {
    sql.connect(config, function (err) {
      if (err) console.log(err);
      var request = new sql.Request();
      request.query("DELETE FROM CorporateDocType WHERE CorporateDocumentID = '"+req.body.CorporateDocumentID+"'", function (err, recordset) {
        if (err) console.log(err);
        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };
        res.send(recordset.recordsets[0]);
      });
    });
  });

  router.post('/getTabsList', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const request = pool.request();
      const query = "SELECT CD.CorporateDocumentID, CD.TraineeID, CONVERT(NVARCHAR(10), CD.CreateTime, 101) AS CreateTime, CD.DocumentName, " +
                    "CD.DocumentPath, DT.DocTypeName FROM CorporateDocument CD LEFT JOIN CorporateDocType DT ON DT.CDTID = CD.CorporateDocumentTypeID " +
                    "WHERE CD.Active = 1 AND DT.Active = 1 AND CD.OrgID = '" + req.body.OrgID + "' AND CD.CorporateDocumentTypeID = '" + req.body.typeid + "' " +
                    "ORDER BY CD.CorporateDocumentTypeID ASC";
  
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
          error: "No data found!",
        };
        res.send(result);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const result = {
        flag: 0,
        error: "An error occurred while fetching data!",
      };
      res.status(500).send(result);
    }
  });
  

  module.exports = router;