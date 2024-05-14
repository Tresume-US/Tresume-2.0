const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bodyparser = require('body-parser');
const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
const multer = require('multer');
const fs = require('fs');
router.use(bodyparser.json());
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const config = {
  user: "sa",
  password: "Tresume@123",
  server: "92.204.128.44",
  database: "Tresume",
  trustServerCertificate: true,
  connectionTimeout: 60000,
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/inetpub/vhosts/tresume.us/httpdocs/Content/Invoice/attachments');
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
        "SELECT im.clientid,im.id, im.created_at as date, im.invoiceNo, C.clientname,im.receivedamt, im.statement as memo, im.total FROM   invoice_Master AS im JOIN clients AS C ON im.clientid = C.clientid  WHERE im.orgid = '" + req.body.OrgID + "' AND im.ispaid = 1 AND im.status=1";

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
        "SELECT im.clientid,im.id, im.created_at as date, im.invoiceNo, C.clientname,im.receivedamt, im.statement as memo, im.total FROM   invoice_Master AS im JOIN clients AS C ON im.clientid = C.clientid  WHERE im.orgid ='" + req.body.OrgID + "' AND im.ispaid = 0 AND im.status=1";

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
        "SELECT im.duedate,im.clientid,im.id, im.created_at as date, im.invoiceNo, C.clientname,im.receivedamt, im.statement as memo, im.total,im.ispaid FROM   invoice_Master AS im JOIN clients AS C ON im.clientid = C.clientid  WHERE im.orgid = '" + req.body.OrgID + "' AND im.status=1";

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
    var query = "UPDATE invoice_master SET receivedamt = COALESCE(receivedamt, 0) + '" + req.body.receivedamt + "' WHERE id = '" + req.body.id + "';";
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

      var query = "SELECT tm.id, tm.traineeid, CONCAT(t.firstname, ' ', t.lastname) AS candidatename, tm.totalhrs,tm.day1,tm.day2,tm.day3,tm.day4,tm.day5,tm.day6,tm.day7, tm.details, tm.totalamt, tm.billableamt, tm.projectid, tm.fromdate FROM timesheet_master AS tm JOIN timesheet_project AS tp ON tm.projectid = tp.projectid JOIN trainee AS t ON tm.traineeid = t.traineeid WHERE tp.clientid = '" + req.body.orgID + "' AND tm.status = 3 AND tm.isbillable = 1";

      if (req.body.startdate) {
        query += " AND tm.fromdate >= '" + req.body.startdate + "'";
      }

      if (req.body.enddate) {
        query += " AND tm.fromdate <= '" + req.body.enddate + "'";
      }

      if (req.body.candidateid && req.body.candidateid !=0 ) {
        query += " AND tm.traineeid = '" + req.body.candidateid + "'";
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
     [invoice_message], [statement], [status], [isviewed], [ispaid], [isdeposited], [created_at], [created_by], [last_updated_at], [last_updated_by], [traineeid], [orgid], [pterms], [receivedamt], [invoicedetails])
    VALUES
    (${req.body.clientid}, '${req.body.clientemail}', '${req.body.billing_address}', '',
     '${req.body.invoiceNo}', '', '${req.body.subtotal}', '${req.body.discount}', '${req.body.total}',
     '${req.body.invoice_message}', '${req.body.statement}', ${req.body.status},
     '0', '0', '0',  GETDATE(), '${req.body.created_by}', GETDATE(),
     '${req.body.created_by}', ${req.body.traineeid}, ${req.body.orgid}, '', '0', '${req.body.invoicedetails}');

      SELECT SCOPE_IDENTITY() AS insertedId;
    `;
console.log(query);
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


router.post('/GetlastInvoice', async (req, res) => {
  const orgId = req.query.orgId;
  var query = "SELECT ISNULL(MAX(invoiceno), 0) AS last_invoiceno FROM invoice_master WHERE orgid ="+req.body.orgId;
  console.log(query);
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .query(query);
      console.log(result.recordset[0].last_invoiceno);
    const nextInvoiceNo = parseInt(result.recordset[0].last_invoiceno) + 1;
    const data = {
      flag: 1,
      invoiceNo: nextInvoiceNo,
    };
    res.json(data);

  } catch (err) {
    console.error('SQL error:', err.message);
    res.status(500).send('Internal Server Error');
  }

});



// router.post('/checkExistInvoiceNo', async (req, res) => {
//   const { orgid, invoiceno } = req.body;

//   try {
//     let pool = await sql.connect(config);

//     let result = await pool.request()
//       .input('OrgId', sql.Int, orgid)
//       .input('InvoiceNo', sql.Int, invoiceno)
//       .query('SELECT TOP 1 invoiceno FROM invoice_master WHERE orgid = @OrgId AND invoiceno = @InvoiceNo');

//     const invoiceExists = result.recordset.length > 0;
//     var data = {
//       flag: 1,
//       invoiceExists:invoiceExists ,
//     };

//     res.send(data);

//   } catch (err) {
//     console.error('SQL error:', err.message);
//     res.status(500).send('Internal Server Error');
//   }
// });


router.post('/checkExistInvoiceNo', async (req, res) => {
  const { orgId, InvoiceNo } = req.body;
  // console.log(`Checking existence for OrgID: ${orgid}, InvoiceNo: ${invoiceno}`);

  try {
    await sql.connect(config);
    const result = await new sql.Request()
      .input('OrgId', sql.Int, orgId)
      .input('InvoiceNo', sql.Int, InvoiceNo)
      .query('SELECT TOP 1 invoiceno FROM invoice_master WHERE orgid = @OrgId AND invoiceno = @InvoiceNo');

    const invoiceExists = result.recordset.length > 0;
    console.log(`Invoice exists: ${invoiceExists}`);

    res.send({
      flag: 1,
      invoiceExists,
    });

  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post("/CancelInvoice", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "UPDATE invoice_Master SET status = 0 WHERE id = '" + req.body.Id + "'";



    // request.input('Id', sql.Int, req.body.Id);

    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      const response = {
        flag: 1,
      };
      res.send(response);
    } else {
      const response = {
        flag: 0,
        error: "No records were deleted.",
      };
      res.send(response);
    }
  } catch (error) {
    console.error("Error Deleteing Timesheet:", error);
    const response = {
      flag: 0,
      error: "An error occurred while Deleting Timesheet!",
    };
    res.status(500).send(response);
  }
});




router.post("/getCancelledInvoices", async (req, res) => {
  try {
    sql.connect(config, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      var request = new sql.Request();

      var query =
        "SELECT im.id, im.created_at as date, im.invoiceNo, C.clientname,im.receivedamt, im.statement as memo, im.total,im.ispaid FROM   invoice_Master AS im JOIN clients AS C ON im.clientid = C.clientid  WHERE im.orgid = @OrgID AND im.status=0";


        request.input('OrgID', sql.VarChar, req.body.OrgID);

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
  }});

router.post("/getInvoiceReport", async (req, res) => {
    try {
        await sql.connect(config);
        
        let query = `
        SELECT 
        C.ClientName,
        IM.*
    FROM 
        invoice_Master AS IM
    JOIN 
        clients AS C ON IM.ClientID = C.ClientID
    WHERE 
        IM.orgid = '${req.body.OrgID}' AND IM.status IN (1, 2, 3)`;

        if (req.body.startdate && req.body.enddate) {
            query += ` AND IM.fromdate BETWEEN '${req.body.startdate}' AND '${req.body.enddate}'`;
        }

        console.log(query);

        const result = await sql.query(query);
        
        res.send({
            flag: 1,
            result: result.recordset
        });
    } catch (error) {
        console.error("Error occurred: ", error);
        res.status(500).send("An error occurred while processing your request.");
    } finally {
        sql.close();
    }
});

module.exports = router;
