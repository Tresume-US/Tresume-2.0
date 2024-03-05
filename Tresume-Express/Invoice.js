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
  database: "Tresume",
  trustServerCertificate: true,
};


router.post("/getPaidInvoiceList", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query =
        "SELECT im.created_at as date, im.invoiceNo, tp.projectname, im.mail_sent_on as memo, im.total,im.status FROM invoice_Master AS im JOIN timesheet_project AS tp ON im.clientid = tp.clientid  WHERE im.orgid = '" + req.body.OrgID + "' AND im.ispaid = 1 AND tp.status = 1";

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

router.post('/getLocationinvoice', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // const query =  "select LocationName from Location";
    // const query =  " select distinct city from UsazipcodeNew";
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

router.post("/getunPaidInvoiceList", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query =
        "SELECT im.created_at as date, im.invoiceNo, tp.projectname, im.mail_sent_on as memo, im.total,im.status FROM invoice_Master AS im JOIN timesheet_project AS tp ON im.clientid = tp.clientid  WHERE im.orgid = '" + req.body.OrgID + "' AND im.ispaid = 0 AND tp.status = 1";

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

router.post("/getAllInvoiceList", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query =
        "SELECT im.created_at as date, im.invoiceNo, tp.projectname, im.mail_sent_on as memo, im.total,im.status FROM invoice_Master AS im JOIN timesheet_project AS tp ON im.clientid = tp.clientid  WHERE im.orgid = '" + req.body.OrgID + "' AND tp.status = 1";

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

router.post("/UpdateRejectStatus", async function (req, res) {
  try {
    var query ="Update "

    console.log(query);

    await sql.connect(config);
    var request = new sql.Request();
    var result = await request.query(query);

    const data = {
      flag: 1,
      message: "Data Updated",
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


router.post("/UpdateAcceptStatus", async function (req, res) {
  try {
    var query ="Update "

    console.log(query);

    await sql.connect(config);
    var request = new sql.Request();
    var result = await request.query(query);

    const data = {
      flag: 1,
      message: "Data Updated",
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

router.post("/getReportTimesheet", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query = "SELECT * FROM timesheet WHERE orgID = '" + req.body.OrgID + "' AND status = 1 AND isbillable = 1";
      if (req.body.startdate) {
        query += " AND fromdate BETWEEN '" + req.body.startdate + "' AND '" + req.body.enddate + "'";
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

module.exports = router;
