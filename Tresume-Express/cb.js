const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const pool = require("./database");
const sql = require('mssql');

router.use(bodyParser.urlencoded({ extended: true }));
const config = {
    user: "sa",
    password: "Tresume@123",
    server: "92.204.128.44",
    database: "Tresume",
    trustServerCertificate: true,
  connectionTimeout: 60000,
  };
const client_id = 'Ca9b88b95';
const client_secret = 'ITATVWZFQhy2iVO111IuVjMaK8V8hzEjofDd6gxAA2jDJEPMIE5lN7cJtVVSxv0SZH5nSsVf7rYbXtmlcLhMuw==';
const redirect_uri = 'https://tresume.us';
const scope = 'openid offline_access';
const auth_url = 'https://auth.careerbuilder.com/connect/authorize';
const token_url = 'https://api.careerbuilder.com/connect/token';


router.get('/CBlogin', (req, res) => {
    const state = 'random_state_string'; 
    const authorizationUrl = `${auth_url}?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;
    res.redirect(authorizationUrl);
});


router.get('/CBcallback', async (req, res) => {
    const code = req.query.code;
    const state = req.query.state; 

    try {

        const tokenResponse = await axios.post(token_url, new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: client_id,
            client_secret: client_secret,
            code: '674104BA07D700FD476F5F096D61594BBA2749A6CAA80927B1EED7F00E5B3BF4-1',
            redirect_uri: redirect_uri,
            scope: 'openid offline_access'
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const tokens = tokenResponse.data;  
        console.log('Token:', tokens);
        console.log('Access Token:', tokens.access_token);
        console.log('Refresh Token:', tokens.refresh_token);

        res.send('Login successful! Access token and refresh token have been received.');
    } catch (error) {
        console.error('Error getting tokens:', error.response ? error.response.data : error.message);
        res.status(500).send('Error during token exchange.');
    }
});

// Step 4: Use the refresh token to get a new access token
// router.post('/CBrefresh', async (req, res) => {
//     const refresh_token = 'EEE56950A5C44A5B779A063F21C107CFA439C7287A9008DF082F8A3278E6FEB1-1';

//     try {
//         const refreshResponse = await axios.post(token_url, new URLSearchParams({
//             grant_type: 'refresh_token',
//             client_id: client_id,
//             client_secret: client_secret,
//             refresh_token: refresh_token
//         }).toString(), {
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//         });

//         const newTokens = refreshResponse.data;
//         console.log('New Access Token:', newTokens.access_token);
//         console.log('New Refresh Token:', newTokens.refresh_token);

//         res.send('New tokens received successfully.');
//     } catch (error) {
//         console.error('Error refreshing tokens:', error.response ? error.response.data : error.message);
//         res.status(500).send('Error during token refresh.');
//     }
// });

router.post('/CBrefresh', async (req, res) => {
    let pool;
    try {
        // Connect to the database
        pool = await sql.connect(config);
        
        // Fetch the refresh token from the database
        const result = await pool.request()
            .query('SELECT refreshtoken FROM JobBoardAccount WHERE JBAID = 16');
        
        const refresh_token = result.recordset[0].refreshtoken;

        // Use the refresh token to get new tokens
        const refreshResponse = await axios.post(token_url, new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const newTokens = refreshResponse.data;
        console.log('New Access Token:', newTokens.access_token);
        console.log('New Refresh Token:', newTokens.refresh_token);

        // Update the refresh token in the database
        await pool.request()
            .query(`UPDATE JobBoardAccount SET refreshtoken = '${newTokens.refresh_token}' WHERE JBAID = 16`);

        res.send(newTokens.data);
    } catch (error) {
        console.error('Error refreshing tokens:', error.response ? error.response.data : error.message);
        res.status(500).send('Error during token refresh.');
    } finally {
        // Ensure the database connection is closed
        if (pool) {
            pool.close();
        }
    }
});




module.exports = router;