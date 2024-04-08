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
const multer = require('multer');
const path = require('path');

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

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'C:/inetpub/vhosts/tresume.us/httpdocs/CorporateDocument');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname); // Using the original filename
  }
});


const upload = multer({ storage: storage });

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

  router.post("/fetchmultiorg", function (req, res) {
    sql.connect(config, function (err) {
      if (err) console.log(err);
      var request = new sql.Request();
      var useremail = req.body.useremail
      var query = `SELECT org.organizationname,org.organizationid
      FROM memberdetails AS md
      CROSS APPLY STRING_SPLIT(md.accessorg, ',') AS s
      JOIN organization AS org ON org.organizationid = CAST(s.value AS INT)
      WHERE md.useremail = '${useremail}'`
      request.query(query, function (err, recordset) {
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
  
  router.post('/uploadCorporateDoc', upload.single('file'), async (req, res) => {
    try {
      // Open database connection
      await sql.connect(config);
  
      // Get filename and document path
      const filename = req.file.filename;
      const documentPath = 'CorporateDocument/' + filename;
  
      // Prepare SQL query parameters
      const request = new sql.Request();
      request.input('TraineeID', sql.Int, req.body.TraineeID);
      request.input('DocumentName', sql.VarChar(100), filename);
      request.input('DocumentPath', sql.VarChar(300), documentPath);
      request.input('Active', sql.Bit, 1);
      request.input('CreateTime', sql.DateTime, new Date());
      request.input('CreateBy', sql.VarChar(200), req.body.CreateBy);
      request.input('LastUpdateTime', sql.DateTime, new Date());
      request.input('LastUpdateBy', sql.VarChar(200), req.body.CreateBy);
      request.input('CorporateDocumentTypeID', sql.Int, req.body.CorporateDocumentTypeID);
      request.input('OrgID', sql.Int, req.body.OrgID);
  
      // Insert into database
      const result = await request.query(`
        INSERT INTO [dbo].[CorporateDocument]
        ([TraineeID], [DocumentName], [DocumentPath], [Active], [CreateTime], [CreateBy],
        [LastUpdateTime], [LastUpdateBy], [CorporateDocumentTypeID], [OrgID])
        VALUES
        (@TraineeID, @DocumentName, @DocumentPath, @Active, @CreateTime, @CreateBy,
        @LastUpdateTime, @LastUpdateBy, @CorporateDocumentTypeID, @OrgID)
      `);
  
      res.json({ message: 'File uploaded and data inserted successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      // Close database connection
      sql.close();
    }
  });
  

  module.exports = router;