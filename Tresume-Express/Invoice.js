const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bodyparser = require('body-parser');
const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
const multer = require('multer');
const fs = require('fs');
router.use(bodyparser.json());

const config = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "Tresume",
  trustServerCertificate: true,
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/inetpub/vhosts/tresume.us/httpdocs/Content/Invoice/attachements');
  },
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueFilename + fileExtension);
  }
});

const upload = multer({ storage: storage });

router.post("/getPaidInvoiceList", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query =
        "SELECT im.id, im.created_at as date, im.invoiceNo, tp.projectname, im.mail_sent_on as memo, im.total,im.status FROM invoice_Master AS im JOIN timesheet_project AS tp ON im.clientid = tp.clientid  WHERE im.orgid = '" + req.body.OrgID + "' AND im.ispaid = 1 AND tp.status = 1";

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
        "SELECT im.id, im.created_at as date, im.invoiceNo, tp.projectname, im.mail_sent_on as memo, im.total,im.status FROM invoice_Master AS im JOIN timesheet_project AS tp ON im.clientid = tp.clientid  WHERE im.orgid = '" + req.body.OrgID + "' AND im.ispaid = 0 AND tp.status = 1";

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
        "SELECT im.id, im.created_at as date, im.invoiceNo, tp.projectname, im.mail_sent_on as memo, im.total,im.status FROM invoice_Master AS im JOIN timesheet_project AS tp ON im.clientid = tp.clientid  WHERE im.orgid = '" + req.body.OrgID + "' AND tp.status = 1";

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

router.post("/updateReceivedPayment", async function (req, res) {
  try {
      var query ="UPDATE invoice_master SET receivedamt = COALESCE(receivedamt, 0) + '"+req.body.receivedamt+ "' WHERE id = '"+ req.body.id+"';";
      console.log(query);
   
    await sql.connect(config);
    var request = new sql.Request();
    var result = await request.query(query);

    const data = {
      flag: 1,
      message: "Payment Updated",
    };

    res.send(data);
  } catch (error) {
    const data = {
      flag: 1,
      message: "Internal Server Error",
    };
    res.status(500).send(data);
  }
});


router.post("/UpdateRejectStatus", async function (req, res) {
  try {
    var query = "UPDATE timesheet_master SET status = '" + req.body.status + "' AND admincomments = '" + req.body.comments + "' WHERE id = '" + req.body.id + "'";

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
    var query = "UPDATE timesheet_master SET status = '" + req.body.status + "' AND admincomments = '" + req.body.comments + "' WHERE id = '" + req.body.id + "'";

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

router.post("/gettimesheetlist", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query = "SELECT tm.id, tm.traineeid, CONCAT(t.firstname, ' ', t.lastname) AS candidatename, tm.totalhrs, tm.details, tm.totalamt, tm.billableamt, tm.projectid, tm.fromdate FROM timesheet_master AS tm JOIN timesheet_project AS tp ON tm.projectid = tp.projectid JOIN trainee AS t ON tm.traineeid = t.traineeid WHERE tp.clientid = '" + req.body.orgID + "' AND tm.status = 1 AND tm.isbillable = 1";

      if (req.body.startdate) {
          query += " AND tm.fromdate >= '" + req.body.startdate + "'";
      }

      if (req.body.enddate) {
          query += " AND tm.fromdate <= '" + req.body.enddate + "'";
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

router.post('/createInvoice', upload.array('attachments', 10), async (req, res) => {
  const invoiceData = req.body;
 
  try {
    await sql.connect(config);
    const request = new sql.Request();
    const query = `
    INSERT INTO [dbo].[invoice_master]
    ([clientid], [clientemail], [billing_address], [timesheetid], [invoiceNo], [location], [subtotal], [discount], [total],
     [invoice_message], [statement], [status], [mail_sent_on], [isviewed], [ispaid], [isdeposited] [created_at], [created_by], [last_updated_at], [last_updated_by], [traineeid], [orgid], [pterms], [receivedamt], [invoicedetails])
    VALUES
    (${req.body.clientid}, '${req.body.clientemail}', '${req.body.billing_address}', '',
     '${req.body.invoiceNo}', '', '${req.body.subtotal}', '${req.body.discount}', '${req.body.total}',
     '${req.body.invoice_message}', '${req.body.statement}', ${req.body.status}, '${req.body.mail_sent_on}',
     '0', '0', '0',  GETDATE(), '${req.body.created_by}', GETDATE(),
     '${req.body.created_by}', ${req.body.traineeid}, ${req.body.orgid}, '', '0', '${req.body.invoicedetails}');

      SELECT SCOPE_IDENTITY() AS insertedId;
    `;

    for (const key in req.body) {
      request.input(key, req.body[key]);
    }
    const result = await request.query(query);
    const insertedId = result.recordset[0].insertedId;
    const attachmentQuery = `
    INSERT INTO [dbo].[invoiceattachements] ([invoiceid], [filename], [status])
    VALUES (@invoiceid, @filename, @status);
  `;

  for (const file of req.files) {
    const attachmentRequest = new sql.Request();
    attachmentRequest.input('invoiceid', sql.Int, insertedId);
    attachmentRequest.input('filename', sql.VarChar(255), file.filename);
    attachmentRequest.input('status', sql.Int, 1); // Adjust status as needed

    await attachmentRequest.query(attachmentQuery);
  }

    res.json({ success: true, message: 'Invoice inserted successfully', insertedId });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ success: false, message: 'Error inserting invoice' });
  } finally {
    sql.close();
  }
});

module.exports = router;
