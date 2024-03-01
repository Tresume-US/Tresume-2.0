const express = require("express");
const router = express.Router();
const pool = require("./database");
var request = require("request");
var sql = require("mssql");
const axios = require("axios");
const nodemailer = require("nodemailer");
var crypto = require("crypto");
const bodyparser = require('body-parser');
const fs = require('fs');
const path = require('path');


const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
const apiUrl = envconfig.apiUrl;

const username = 'nithya@tresume.us';
const password = 'tresume';

router.use(bodyparser.json());

const config = {
    user: "sa",
    password: "Tresume@123",
    server: "92.204.128.44",
    database: "Tresume",
    trustServerCertificate: true,
  };

  router.post('/optresumesearch', async (req, res) => {
    try {
      // const { keywords, location, page } = req.query;
      var keywords = req.body.keywords;
      var location = req.body.location;
      var page = req.body.page
      console.log(req.page);
      const apiUrl = 'https://optnation.com/api/resumesearch';
      const queryParams = {
        username,
        password,
        keywords: keywords || '',
        location: location || '',
        sort:  'date',
        start: 0,
        limit: 10,
        page: page || 1,
      };
      console.log(queryParams);
      const response = await axios.get(apiUrl, { params: queryParams });

      res.json(response.data.msg);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
    });

    router.post('/optresumeopen', async (req, res) => {
      try {
        var resumeid  = req.body.resumeid;

        const apiUrl = 'https://optnation.com/api/resumeopen';
        const queryParams = {
          username,
          password,
          resumeid,
        };
  
      const response = await axios.get(apiUrl, { params: queryParams });
  
      // if (response.data && response.data.downloadLink && response.data.resumeBase64) {
        var data = response.data.msg;
        res.send(data);
      // } else {
      //   res.status(500).json({ error: 'Invalid response from the external API' });
      // }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/optpostjob', async (req, res) => {
    try {
      const {
        title,
        skill,
        location,
        jobcat,
        description,
        benefits,
        indtype,
        s1,
        s2,
        stype,
        hires,
        jobtype,
        minexp,
        maxexp,
      } = req.body;
  
      // Make sure required parameters are provided
      if (
        !title ||
        !skill ||
        !jobcat ||
        !description ||
        !indtype ||
        !s1 ||
        !s2 ||
        !stype ||
        !hires ||
        !jobtype ||
        !minexp ||
        !maxexp
      ) {
        return res.status(400).json({ error: 'All required parameters must be provided.' });
      }

      const apiUrl = 'https://optnation.com/api/postjob';

      const requestData = {
        username,
        password,
        title,
        skill,
        location: location || '',
        jobcat,
        description,
        benefits: benefits || '',
        indtype,
        s1,
        s2,
        stype,
        hires,
        jobtype,
        minexp,
        maxexp,
      };
  
      const response = await axios.post(apiUrl, requestData);
  
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/download-pdf', async (req, res) => {
    var filename = randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')+'.pdf';
    const { url } = req.query;
  
    try {
      // Fetch the PDF from the provided URL using Axios.
      const response = await axios.get(url, {
        responseType: 'stream',
      });
  
      if (response.status === 200) {
        // Define the path where you want to save the PDF.
        const pdfPath = path.join(__dirname, 'pdfs', filename);
  
        // Create a write stream to save the PDF.
        const writer = fs.createWriteStream(pdfPath);
  
        // Pipe the response data into the write stream.
        response.data.pipe(writer);
  
        // Once the write operation is complete, send a success response.
        writer.on('finish', () => {
          res.status(200).send('PDF downloaded and saved successfully.');
        });
      } else {
        // Handle errors or invalid responses from the URL.
        res.status(500).send('Failed to download PDF.');
      }
    } catch (error) {
      // Handle any errors that occurred during the request.
      res.status(500).send('Error while fetching PDF.');
    }
  });

  router.post('/optSaveResume', async (req, res) => {
    try {
      const { pdfUrl, Filename, userName, emailID } = req.body;
  
      // Validate inputs
      if (!pdfUrl || !Filename || !userName || !emailID) {
        return res.status(400).json({ error: 'Invalid input. Please provide all required fields.' });
      }
  
      // Download PDF from the specified URL
      const response = await axios.get(pdfUrl, { responseType: 'stream' });
  
      // Set up file paths and streams
      const fileName = path.basename(Filename);
      const filePath = path.join('C:/inetpub/vhosts/tresume.us/httpdocs/Content/', fileName);
      const writer = fs.createWriteStream(filePath);
  
      // Pipe the response stream to the writer
      response.data.pipe(writer);
  
      // Wait for the write stream to finish writing
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
  
      // Save information to the database
      await sql.connect(config); // Make sure 'config' is properly defined
      const request = new sql.Request();
      request.input("FileName", sql.VarChar, Filename);
      request.input("FileLocation", sql.VarChar, "Content/" + Filename);
      request.input("UserName", sql.VarChar, userName);
      request.input("Email", sql.VarChar, emailID);
  
      const result = await request.execute("InsertJobBoardResume");
  
      // Close the database connection
      await sql.close();
  
      return res.json({ success: true, filePath, databaseResult: result });
    } catch (error) {
      console.error('Error saving resume:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


  function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
  module.exports = router;
  
  