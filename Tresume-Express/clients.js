const express = require("express");
const router = express.Router();
var sql = require("mssql");
const nodemailer = require("nodemailer");
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
  connectionTimeout: 60000,
};

module.exports = router;

router.post('/getTraineeClientList', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    // const query = "SELECT   V.*,  CONCAT(T.firstname, ' ', T.lastname) AS PrimaryOwner FROM   clients V INNER JOIN   Trainee T ON V.primaryowner = T.traineeid WHERE V.active = 1  AND V.primaryowner = '" + req.body.TraineeID + "'";

    const query = "SELECT CONCAT(t.FirstName, ' ', t.LastName) AS PrimaryOwner,c.PrimaryOwner,c.orgid, c.* FROM clients c JOIN trainee t ON c.PrimaryOwner = t.traineeid WHERE c.orgid = 46 AND c.Active = 1;";
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
        error: "No active clients found! ",
      };
      res.send(result); 
    }
  } catch (error) {
    console.error("Error fetching client data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching client data!",
    };
    res.status(500).send(result);
  }
});

router.post('/deleteClientAccount', async (req, res) => {
  const ClientID = req.body.ClientID;

  try {
    const dclient = await deactivateclient(ClientID);
    if (dclient) {
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
    console.error("Error deleting client:", error);
    const result = {
      flag: 0,
      error: "An error occurred while deleting the client!",
    };
    res.status(500).send(result);
  }  

})
async function deactivateclient(ClientID) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const queryResult = await request.query(
      `update Clients set active = 0 where ClientID = '${ClientID}'`
    );
    
    if (queryResult.rowsAffected[0] === 0) {
      throw new Error("No records found!");
    }
    
    return queryResult;
  } catch (error) {
    console.error("Error while deleting client:", error);
    throw error;
  }
}

router.post('/getClientCategoryID', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "select ClientCategoryID,Value from ClientCategory where Active = 1";

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
        error: "No active Category found! ",
      };
      res.send(result); 
    }
  } catch (error) {
    console.error("Error fetching Category data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching Category!",
    };
    res.status(500).send(result);
  }
});

router.post('/getClientStatusID', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "select ClientStatusID,Value from ClientStatus where Active = 1";

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
        error: "No active Status found! ",
      };
      res.send(result); 
    }
  } catch (error) {
    console.error("Error fetching Status data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching Status!",
    };
    res.status(500).send(result);
  }
});

router.post('/getCity', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "select distinct city from usazipcodenew where state like '%" + req.body.State + "%' order by city asc";

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
        error: "data Not found! ",
      };
      res.send(result); 
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching data",
    };
    res.status(500).send(result);
  }
});

router.post('/getPrimaryOwner', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const query = "select CONCAT (FirstName,' ', MiddleName,' ', LastName) AS PrimaryOwner from trainee where Active = 1";

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
        error: "No active Category found! ",
      };
      res.send(result); 
    }
  } catch (error) {
    console.error("Error fetching Category data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching Category!",
    };
    res.status(500).send(result);
  }
});

router.post('/addClienta', async (req, res) => {
  try {   
    var query = `INSERT INTO Clients (ClientName, ContactNumber, EmailID, Address, VMSClientName, FederalID,ZipCode, Website, Fax, Industry, Country, State, City, ClientStatusID,  ClientCategoryID, PrimaryOwner,RequiredDocuments, PaymentTerms, AboutCompany, Access, sendingEmail, posting, Notes, Active,orgid) VALUES 
    ('${req.body.ClientName}', '${req.body.ContactNumber}', '${req.body.EmailID}', '${req.body.Address}', '${req.body.VMSClientName}', '${req.body.FederalID}', '${req.body.ZipCode}', '${req.body.Website}', '${req.body.Fax}', '${req.body.Industry}', '${req.body.Country}', '${req.body.State}', '${req.body.City}', '${req.body.ClientStatusID}', '${req.body.ClientCategoryID}', '${req.body.PrimaryOwner}','${req.body.RequiredDocuments}','${req.body.PaymentTerms}', '${req.body.AboutCompany}', '${req.body.Access ? '1' : '0'}', '${req.body.sendingEmail ? '1' : '0'}', '${req.body.posting ? '1' : '0'}', '${req.body.Notes}', ${req.body.Active || '1'}, '${req.body.orgid}')`;
   
    console.log(query);
    const pool = await sql.connect(config);
    const request = new sql.Request(pool);
    const recordset = await request.query(query);

    const result = {
      flag: 1,
      message: "Client data inserted successfully!",
    };
    res.status(200).json(result);

  } catch (error) {
    console.error("Error inserting Client data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while inserting Client data!",
    };
    res.status(500).json(result);
  }  
});


router.post('/getClientDetailsList', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    // const query = "SELECT V.*, CONCAT(T.firstname, ' ', T.lastname) AS PrimaryOwner, I.* FROM clients V INNER JOIN Trainee T ON V.primaryowner = T.traineeid INNER JOIN invoice_Master I ON T.traineeid = I.traineeid WHERE V.active = 1 AND V.primaryowner = '" + req.body.TraineeID + "' AND V.ClientID='" + req.body.clientid + "'";

    const query="SELECT CONCAT(t.FirstName, ' ', t.LastName) AS PrimaryOwner,c.PrimaryOwner, c.* FROM clients c JOIN trainee t ON c.PrimaryOwner = t.traineeid WHERE c.Active = 1 AND c.ClientID='" + req.body.ClientID + "'";

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
        error: "No active clients found! ",
      };
      res.send(result); 
    }
  } catch (error) {
    console.error("Error fetching client data:", error);
    const result = {
      flag: 0,
      error: "An error occurred while fetching client data!",
    };
    res.status(500).send(result);
  }
});

module.exports = router;