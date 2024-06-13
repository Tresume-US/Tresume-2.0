const express = require("express");
const router = express.Router();
const pool = require("./database");
var request = require("request");
var sql = require("mssql");
const axios = require("axios");
const nodemailer = require("nodemailer");
var crypto = require("crypto");
const bodyparser = require('body-parser');

const environment = process.env.NODE_ENV || "prod";
const envconfig = require(`./config.${environment}.js`);
const apiUrl = envconfig.apiUrl;

router.use(bodyparser.json());

const config = {
    user: "sa",
    password: "Tresume@123",
    server: "92.204.128.44",
    database: "Tresume",
    trustServerCertificate: true,
  connectionTimeout: 60000,
  };
  
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.mail.yahoo.com",
    auth: {
      user: "support@tresume.us",
      pass: "xzkmvglehwxeqrpd",
    },
    secure: true,
  });

  // router.post("/ssologin", async function (req, res) {

  //   var username = req.body.username;
  //   var password = req.body.password;
  //   var token = crypto.randomBytes(20).toString('hex');
  //   const key = "twothree";
  //   const encryptedPassword = encrypt(password, key);
  //   res.send(encryptedPassword);
  // });

  function generateKey(key) {
    const hash = crypto.createHash('sha256').update(key).digest();
    return hash;
  }
  
  // Encryption function
  function encrypter(text) {
    var key = 'NesaMani&Co';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', generateKey(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted;
  }

  function decrypter(encryptedText) {
    var key = 'NesaMani&Co';
    const iv = Buffer.from(encryptedText.slice(0, 32), 'hex'); 
    const encryptedData = encryptedText.slice(32); 
  
    const decipher = crypto.createDecipheriv('aes-256-cbc', generateKey(key), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

router.post('/ssologin', async (req, res) => {
  console.log(req);
  var UserName = req.body.username;
  var PWD = req.body.password;
  console.log(UserName);
  try {
    // const apiUrl = `https://tresume.us/api/Member/Login/${UserName}/${PWD}`;
    const apiUrl = `http://localhost:59983/api/Member/Login/${UserName}/${PWD}`;
    console.log(apiUrl);
    const response = await axios.get(apiUrl);

    const responseData = response.data; 
    console.log
    if (responseData.TraineeID) {
      
      var accessToken = randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

      sql.connect(config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
    
        var query = "select * from trainee where active = 1 and username like '%"+UserName+"%'";
    
        console.log(query);
        request.query(query,
          function (err, recordset) {
            if (err) console.log(err);
    
            var result = {
              flag: 1,
              result: recordset.recordsets[0],
              data:responseData,
            };
    
            res.send(result);
          }
        );
      });

      // try {
      //   await sql.connect(config);
      //   const query = `
      //     INSERT INTO AccessToken (UserName, TraineeID, accessToken, createtime, expires_at, ipaddress, active)
      //     VALUES (@UserName, @TraineeID, @accessToken, GETDATE(), DATEADD(minute, 3, GETDATE()), @ipaddress, 1)
      //   `;
      //   const request = new sql.Request();
      //   request.input('UserName', sql.VarChar, UserName);
      //   request.input('TraineeID', sql.Int, responseData.TraineeID);
      //   request.input('accessToken', sql.VarChar, accessToken);
      //   request.input('ipaddress', sql.VarChar, req.ip); 

      //   await request.query(query);
      //   res.status(200).json({ 
      //     message: 'Login successful' ,
      //     data:responseData,
      //     accessToken:accessToken
      //   });
      // } catch (error) {
      //   console.error('MSSQL Error:', error);
      //   res.status(500).json({ message: 'An error occurred while inserting the token' });
      // } finally {
      //   sql.close();
      // }


      
    } else {
      
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});


router.post('/getuseraccess', async (req, res) => {
  var UserName = req.body.username;

  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();

    var query = "SELECT RD.RoleName, RD.ViewOnly, RD.FullAccess, RD.DashboardPermission,RD.RoleID,MD.IsAdmin FROM MemberDetails MD INNER JOIN RolesNew RD ON MD.RoleID = RD.RoleID WHERE MD.UserEmail = '"+UserName+"' AND RD.Active = 1";

    console.log(query);
    request.query(query,
      function (err, recordset) {
        if (err) console.log(err);

        var result = {
          flag: 1,
          result: recordset.recordsets[0],
        };

        res.send(result);
      }
    );
  });
})

// router.post('/validateemail', async (req, res) => {
//   console.log(req);
//   var userEmail = req.body.email; 
//   console.log(userEmail);

//   var accessToken = randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  
//   try {
//     const query = "SELECT * FROM trainee WHERE UserName = '" + userEmail + "' AND Active = 1";

//     sql.connect(config, function (err) {
//       if (err) console.log(err);

//       var request = new sql.Request();

//       request.query(query, function (err, recordset) {
//         if (err) {
//           console.log(err);
//           res.status(500).json({ message: 'An error occurred while validating email' });
//         } else {
//           if (recordset.recordsets[0].length > 0) {
//             res.status(200).json({ message: 'Email is already registered' });
//           } else {
//             res.status(401).json({ message: 'Email is not valid' });
//           }
//         }
//       });
//     });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'An error occurred' });
//   }
// });

router.post('/validateemail', async (req, res) => {
  try {
    const username = req.body.email;

    await sql.connect(config);
    
    const request = new sql.Request();

    const query1 = 'SELECT * FROM trainee WHERE username = @username AND Active=1';
    request.input('username', sql.NVarChar, username);
    
    const recordset = await request.query(query1);

    const trainee = recordset.recordset[0]; 

    if (trainee) {
      const resetKey = randomString(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
      
      const query2 = 'UPDATE trainee SET resetkey = @resetKey WHERE username = @username AND Active = 1';
      request.input('resetKey', sql.NVarChar, resetKey);
      
      await request.query(query2);

      const resetUrl = `https://tresume.us/resetpassword/${resetKey}`;

      var subject = "Tresume Password Reset Request";
      var text = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;"><div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);"><p style="color: #333;">Hello,<br><br>You have requested to reset your password. Click on the following link to reset your password:<br><br><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">Reset Password</a><br><br>If you did not request this, please ignore this email.</p><p style="margin-top: 20px; font-style: italic; color: #666;">Regards,<br>Tresume</p></div></div>
      ` 
    
    
      const mailData = {
        from: "support@tresume.us",
        to: username,
        subject: subject,
        html: text,
      };
    
      transporter.sendMail(mailData, (error, info) => {
        if (error) {
         console.log(error);
        }
        console.log('Mail Send');
      });
      
      const data = {
        flag: 1,
        url: resetUrl,
      };
      res.send(data);
    } else {
      const data = {
        flag: 2,
        message: "Invalid username",
      };
      res.send(data);
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server Error');
  } finally {
    sql.close();
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    await sql.connect(config);
    const request = new sql.Request();

    const query1 = `SELECT * FROM trainee WHERE active = 1 AND username = '${username}'`;
    const { recordset: responseData } = await request.query(query1);

    if (responseData.length > 0) {
      const storedPassword = responseData[0].Password;
      if (storedPassword && storedPassword.length === 64) {
        const decryptedPassword = decrypter(storedPassword);
        if (password === decryptedPassword) {
          const query2 = `SELECT RD.RoleName, RD.ViewOnly, RD.FullAccess, RD.DashboardPermission, RD.RoleID, MD.IsAdmin,MD.AccessOrg 
                          FROM MemberDetails MD 
                          INNER JOIN RolesNew RD ON MD.RoleID = RD.RoleID 
                          WHERE MD.UserEmail = '${username}' AND RD.Active = 1`;

          const { recordset } = await request.query(query2);
          const result = {
            flag: 1,
            result: recordset,
            data: responseData,
          };
          res.json(result);
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.json({ flag: 2 });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  } finally {
    sql.close();
  }
});

router.post('/validatekey', async (req, res) => {
  console.log(req);
  var valdatekey = req.body.validatekey;
  
  try {
      sql.connect(config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
    
        var query = "SELECT * FROM trainee where resetkey ='"+valdatekey+"' AND Active = 1";
    
        console.log(query);
        request.query(query,
          function (err, recordset) {
            if (err) console.log(err);
            var trainee = recordset.recordsets[0];
            console.log(trainee);
            if(trainee.length === 1){
              var result = {
                flag: 1,
                message:'Valid key',
              };
              res.send(result);
            }else{
              var result = {
                flag: 2,
                message:'Not Valid Key',
              };
              res.send(result);
            }
          }
        );
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

router.post('/updatepassword', async (req, res) => {
  console.log(req);
  var password = req.body.password;
  var resetkey = req.body.resetkey;

  var encryptpassword = encrypter(password);
  try {
      sql.connect(config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
    
        var query = "UPDATE trainee set resetkey = '0', password = '"+encryptpassword+"' where resetkey ='"+resetkey+"'";

        request.query(query,
          function (err, recordset) {
            if (err) console.log(err);
        
              var result = {
                flag: 1,
                message:'Password Updated Succesfully',
              };
              res.send(result);
          }
        );
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});


router.get('/getCB-token', async (req, res) => {
  const data = new URLSearchParams();
  data.append('grant_type', 'authorization_code');
  data.append('client_id', 'Ca9b88b95');
  data.append('client_secret', 'ITATVWZFQhy2iVO111IuVjMaK8V8hzEjofDd6gxAA2jDJEPMIE5lN7cJtVVSxv0SZH5nSsVf7rYbXtmlcLhMuw==');
  data.append('code', 'ADC1498B73EED72A59418198195A872613E09D4FFC7A3AD99FA1651A3BF27995-1');
  data.append('redirect_uri', 'https://tresume.us');
  data.append('scope', 'openid offline_access');

  try {
    const response = await axios.post('https://auth.careerbuilder.com/connect/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching token:', error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

module.exports = router;
