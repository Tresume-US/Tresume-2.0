const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const axios = require('axios');
const router = express.Router();

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

const PAGE_ACCESS_TOKEN = 'EAAXBTKtDsvQBOzQAquXSChm6vsYKwqmwiiyCMrMyzRvKhMCjo3uZB3x7kx1xxrjAETP4w1OMOaGTRRZAFbyZAJm2YmQp50n7p1BWZA2KdgWTrWLi8fV3WR11MTRG0EZC4csEhmAZCQvz8rLcsArESQuoHj6Epzoz5QRleaKKJcMOo1fevSAKwOZAVMyJnkEEeJ8PZCvG1wqMwLEP9Vs6F77TUknPJAR5';
const RECIPIENT_ID = '918015647157'; 

// API to send messages
router.post('/sendWhatsapp', async (req, res) => {
    console.log("Integration", req.body);
    
    const { to, Message } = req.body;
    const data = {
        "messaging_product": "whatsapp",
        "to": "918015647157",
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
            .input('Type', sql.Int,1)
            .query(`INSERT INTO Integrations (orgid, accessToken, phoneNumber, BusinessName, Status, Type ) 
                    VALUES (@orgid, @accessToken, @phoneNumber, @BusinessName, @Status, @Type)`);

        // res.status(200).send('Data inserted successfully');
        res.status(200).json({
            message: 'Data inserted successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error inserting data');
    } finally {
        // Close the database connection
        sql.close();
    }
});

module.exports = router;