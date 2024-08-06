const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const axios = require('axios');
const router = express.Router();
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const config = {
    user: "sa",
    password: "Tresume@123",
    server: "92.204.128.44",
    database: "Tresume",
    trustServerCertificate: true,
    connectionTimeout: 60000,
  };

const PAGE_ACCESS_TOKEN = 'EAAUDg8ni0ZAcBO1FxVGK9wmuPfxDdFYFgBgAlb9XL527sw8k81Wp5Lha4iZAZC68CpyQuOigKF6VxLZA8nIINrgZA1I5OiiYqyjvmSlohh2ZCQus76gOlbfrJlbMzZAMCQx2MUNGsqw29kSWuZAZAwBTHkB4g3XiqFjoOD4IQTgg4ZAhzojIFCo0NiOZAwKlywVaqTxSuwqU8AaPxEfGAKRuLgWvqYqy1gZD';
const RECIPIENT_ID = '918015647157'; 

// API to send messages
router.post('/sendWhatsapp', async (req, res) => {
    console.log("Integration", req.body);
    
    const { to, Message } = req.body;
    const data = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": "hello_world",
            "language": {
                "code": "en_US"
            }
        }
    };

    try {
        const response = await axios.post('https://graph.facebook.com/v20.0/350907491447823/messages', data, {
            headers: {
                'Authorization': `Bearer ${PAGE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/insert-whatsapp', async (req, res) => {

    const { businessName, accessToken, phoneNumber } = req.body;

    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Fetch orgid from organization table
        let orgResult = await pool.request()
            .input('businessName', sql.VarChar, businessName)
            .query('SELECT OrganizationID FROM Organization WHERE OrganizationName = @businessName');

        if (orgResult.recordset.length === 0) {
            console.log("inside the org not found")
            res.status(404).send({ message: 'Organization not found' });
            res.status(404).json({
                message: 'Organization not found',
            });
            return;
        }

        const orgid = orgResult.recordset[0].OrganizationID;

        // Insert data into Integrations table
        let integrationResult = await pool.request()
            .input('orgid', sql.Int, orgid)
            .input('accessToken', sql.VarChar, accessToken)
            .input('phoneNumber', sql.VarChar, phoneNumber)
            .input('BusinessName',sql.VarChar, businessName)
            .input('Status', sql.Int,1)
            .input('Type', sql.Int,1) //For whatsapp
            .query(`INSERT INTO Integrations (orgid, accessToken, phoneNumber, BusinessName, Status, Type ) 
                    VALUES (@orgid, @accessToken, @phoneNumber, @BusinessName, @Status, @Type)`);

        // res.status(200).send('Data inserted successfully');
        res.status(200).json({
            message: 'Data inserted successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting data');
    } 
});

router.post('/insert-email', async (req, res) => {
    const { user, password, smtphost, smtpport, orgid } = req.body;

    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Use MERGE statement to update if exists, insert if not
        const query = `
        MERGE INTO Integrations AS target
        USING (VALUES (@orgid, @username, @password, @host, @smtpport, @Status, @Type)) AS source (orgid, username, password, host, smtpport, Status, Type)
        ON (target.orgid = source.orgid)
        WHEN MATCHED THEN
            UPDATE SET 
                username = source.username,
                password = source.password,
                host = source.host,
                smtpport = source.smtpport,
                Status = source.Status,
                Type = source.Type
        WHEN NOT MATCHED THEN
            INSERT (orgid, username, password, host, smtpport, Status, Type)
            VALUES (source.orgid, source.username, source.password, source.host, source.smtpport, source.Status, source.Type);
        `;

        // Execute the query
        let integrationResult = await pool.request()
            .input('orgid', sql.Int, orgid)
            .input('username', sql.VarChar, user)
            .input('password', sql.VarChar, password)
            .input('host', sql.VarChar, smtphost)
            .input('smtpport', sql.VarChar, smtpport)
            .input('Status', sql.Int, 1)
            .input('Type', sql.Int, 2) // For Email
            .query(query);

        // Respond with success message
        res.status(200).json({
            message: 'Data inserted/updated successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error inserting/updating data');
    }
});



router.post("/send-mail", (req, res) => {
    console.log("inside the email integrations",req.body)
    const transporter = nodemailer.createTransport({
        port: req.body.smtpport,
        host: req.body.smtphost,
        auth: {
          user: req.body.user,
          pass: req.body.password,
        },
        secure: true,
      });
    const { user, subject, text } = req.body;
    const mailData = {
      from: req.body.user,
      to: "santhiyaravibeece@gmail.com",
      subject:  'Test Email',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tresume</title>
      <style>
          body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
          }
          .header {
              text-align: center;
              background-color: #482668;
              padding: 20px 0;
       
          }
          .logo {
              display: block;
              margin: 0 auto;
          }
          .content {
              padding: 40px 20px;
              background-color: #f7f9fa;
              border-top-left-radius: 50px;
              border-top-right-radius: 50px;
          }
          .footer {
              text-align: center;
              background-color: #e7e7e7;
              padding: 20px 0;
              border-bottom-left-radius: 50px;
              border-bottom-right-radius: 50px;
          }
          .footer p {
              font-size: 12px;
              color: #8d8d8d;
          }
          .footer img {
              display: inline-block;
              vertical-align: middle;
              margin-right: 5px;
          }
      </style>
      </head>
      <body style="background-color: #482668;">
      <div class="container">
          <div class="header">
              <img src="https://tresume.us/email/Tresume_logo.png" alt="Tresume Logo" height="100" class="logo">
          </div>
          <div class="content">
             <h1>Hello, </h1>
       <     <p>Welcome to our service! We are glad to have you</p>
          </div>
          <div class="footer">
              <p>POWERED BY <img src="https://tresume.us/assets/img/logo.png" alt="Tresume Logo" height="30"></p>
              <p> 44121 Leesburg Pike., STE 230 Ashburn, VA 20147, United States Of America</p>
              <p>(703) 9863350 | support@tresume.us </p>
              <p style="font-weight: bold; font-size: 12px; color: #a4a4a4;">© 2024 Tresume. Ltd. All rights reserved</p>
          </div>
      </div>
      </body>
      </html>
      
      `,
    };
  
    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        return console.log(error);
      }
      res.status(200).send({ message: "Mail sent", message_id: info.messageId });
    });
  });


module.exports = router;