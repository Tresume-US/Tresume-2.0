const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const pool = require("./database");
const sql = require('mssql');
const mailchimp = require('@mailchimp/mailchimp_marketing');
require('dotenv').config();

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
  });
  
  async function sendMassEmail(campaignId) {
    try {
      const response = await mailchimp.campaigns.send(campaignId);
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async function createCampaign(listId, subject, fromName, replyTo, htmlContent) {
    try {
      const response = await mailchimp.campaigns.create('regular', {
        recipients: {
          list_id: listId,
        },
        settings: {
          subject_line: subject,
          from_name: fromName,
          reply_to: replyTo,
        },
      });
      
      const campaignId = response.id;
  
      // Set the campaign content
      await mailchimp.campaigns.setContent(campaignId, {
        html: htmlContent,
      });
  
      return campaignId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  router.post('/mailchimp', async (req, res) => {
    try {
        console.log("inside the mailchimp",req.body)
      const { apiKey, secretKey } = req.body;
      const mailChimp = await MailChimp.create({ apiKey, secretKey });
      res.status(200).json(mailChimp);
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  router.post('/create-campaign', async (req, res) => {
    const { listId, subject, fromName, replyTo, htmlContent } = req.body;
    
    try {
      const campaignId = await createCampaign(listId, subject, fromName, replyTo, htmlContent);
      res.status(200).json({ campaignId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post('/send-campaign', async (req, res) => {
    const { campaignId } = req.body;
    
    try {
      const response = await sendMassEmail(campaignId);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;