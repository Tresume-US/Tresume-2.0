const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bodyparser = require('body-parser');
const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);

router.use(bodyparser.json());

const config = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "Tresume_Beta",
  trustServerCertificate: true,
};

router.post('/getPaidInvoiceList', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const query = "SELECT im.created_at, im.invoiceNo, im.invoice_message, im.ispaid, c.ClientName FROM invoice_Master AS im JOIN Clients AS c ON im.clientid = c.clientid WHERE im.traineeid = '" + req.body.TraineeID + "' AND im.ispaid = 1";
        console.log(query);
        const queryResult = await request.query(query);
        
        // if (queryResult.rowsAffected[0] === 0) {
        //   return res.status(404).json({ message: "No records found!" });
        // }
        
        return res.status(200).json(queryResult.recordset);
      } catch (error) {
        console.error("Error while fetching paid invoice list:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
});

router.post('/getunPaidInvoiceList', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const query = "SELECT im.created_at, im.invoiceNo, im.invoice_message, im.ispaid, c.ClientName FROM invoice_Master AS im JOIN Clients AS c ON im.clientid = c.clientid WHERE im.traineeid = '" + req.body.TraineeID + "' AND im.ispaid = 0";
        console.log(query);
        const queryResult = await request.query(query);
        
        // if (queryResult.rowsAffected[0] === 0) {
        //   return res.status(404).json({ message: "No records found!" });
        // }
        
        return res.status(200).json(queryResult.recordset);
      } catch (error) {
        console.error("Error while fetching paid invoice list:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
});

router.post('/getAllInvoiceList', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const query = "SELECT im.created_at, im.invoiceNo, im.invoice_message, c.ClientName FROM invoice_Master AS im JOIN Clients AS c ON im.clientid = c.clientid WHERE im.traineeid = '" + req.body.TraineeID + "'";
        console.log(query);
        const queryResult = await request.query(query);
        
        // if (queryResult.rowsAffected[0] === 0) {
        //   return res.status(404).json({ message: "No records found!" });
        // }
        
        return res.status(200).json(queryResult.recordset);
      } catch (error) {
        console.error("Error while fetching paid invoice list:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
});

module.exports = router;
