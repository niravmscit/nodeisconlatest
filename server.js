// All modules which are required for the application to run
var express= require("express");
var bodyParser= require("body-parser");
var session= require("express-session");
var morgan= require('morgan');
var querystring = require('querystring');
var https= require('https');
var request = require("https");
var fs=require('fs');
// configuration for OpenSSL to run url on HTTPS. 
var serverOptions = {
  key: fs.readFileSync( './ssldata/localhost.key' ),
  cert: fs.readFileSync( './ssldata/localhost.cert' ),
  requestCert: false,
  rejectUnauthorized: false
};
// initiate App with express module.
var app=express();
//app.set('port',9055);
// set all configuration related to url enconding and Create server to serve https request. 
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
var server = https.createServer( serverOptions, app );
var port = process.env.PORT || 443;

// API KEY for elvanto Website
var strAPIKey="5hGcHpRQWjMLzN08jZlnWXEek3jwIHmz"; 
var strAPIHostName="api.elvanto.com";

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

//Iframe page for the Check Session. 
app.route('/checksession').get((objReq, objResMain) => {
  // Check Session exist or not and based on it display message. 
  if( objReq.session.loggedUser != undefined && objReq.session.loggedUser!="")
    {
      objResMain.write(objReq.session.loggedUser);
    //  objResMain.send(objReq.session.loggedUser);
    const postData = querystring.stringify({
      //'search[firstname]': 'maunish'
      'search[email]': objReq.session.loggedUser
    });
    var options = {
      "method": "POST",
      "hostname": strAPIHostName,
      "path": "/v1/people/search.json",
      "headers": {
        "username": strAPIKey,
        "password": "x",
        "Authorization": "Basic NWhHY0hwUlFXak1Mek4wOGpabG5XWEVlazNqd0lIbXo6eA==",
        "Cache-Control": "no-cache",
         'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    var objReqApi = https.request(options, function (objResApi) {
      var strChunks = [];
    
      objResApi.on("data", function (chunk) {
        strChunks.push(chunk);
      });
    
      objResApi.on("end", function () {
        var strBody = Buffer.concat(strChunks);
        console.log(strBody.toString());
        objResMain.end(strBody.toString());
      });
    });
    // write data to request body
    objReqApi.write(postData);  
    objReqApi.end();
    }
  else
  {
    objResMain.send("No Session Set yet");
  }
    });

// API Call using API Key to Register Users
app.route("/register").post((objReq,objResMain) => {
 
    
  objResMain.header('Access-Control-Allow-Origin', 'http://localhost');
  objResMain.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  objResMain.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  objResMain.header('Access-Control-Allow-Credentials', 'true');
 
  var strFirstName=objReq.body.firstname;
    var strLastName=objReq.body.lastname;
    var strEmail=objReq.body.email;
    var strPhone=objReq.body.phone;
    var strMobile=objReq.body.mobile;
    strUserName=objReq.body.username;
    strPassword=objReq.body.password;

  const postData = querystring.stringify({
    'firstname': strFirstName, 
     'lastname': strLastName,
     'email':strEmail,
     'phone':strPhone,
     'mobile':strMobile,
     'username':strUserName,
     'password':strPassword
  });
  const options = {
    "method": "POST",
    "hostname": strAPIHostName,
    "path": "/v1/people/create.json",
    "headers": {
      "username": strAPIKey,
      "password": "x",
      "Authorization": "Basic NWhHY0hwUlFXak1Mek4wOGpabG5XWEVlazNqd0lIbXo6eA==",
      "Cache-Control": "no-cache",
       'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
  }
}; 
   var objReqApi = https.request(options, function (objResApi) {
    var strChunks = [];
  
    objResApi.on("data", function (chunk) {
      strChunks.push(chunk);
    });
  
    objResApi.on("end", function () {
      var strBody = Buffer.concat(strChunks);
      var resultAPI = JSON.parse(strBody);
      var strResult = "success";
      if(resultAPI.status=="fail")
      {
        strResult=resultAPI.error.message;
      }
      console.log(strBody.toString());
      objResMain.send(strResult);
      objResMain.end();
      //objResMain.end(strBody.toString());
    });
  });
  // write data to request body
  objReqApi.write(postData);  
  objReqApi.end();
  });

// End API Call using API Key to Register Users

// Registration Data 

// Login page Configuration. 
app.route('/login').get((objReq, objResMain) => {
  // Login Get Request 
  objResMain.sendFile(__dirname + '/public/login.html');
    }).post((objReq, objResMain) => {
  // Login Post Request 
      // Set headers to allow cross domain request and Session. 
      objResMain.header('Access-Control-Allow-Origin', 'http://localhost');
      objResMain.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      objResMain.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      objResMain.header('Access-Control-Allow-Credentials', 'true');
      // Read Username and password
      var strUserName = objReq.body.username,
        strPassword = objReq.body.password;
        var strStatusCode ="";
        objReq.session.loggedUser="";
        // username="maunishpshah";
        // password="Maunish12!";
        var strHostName='iskcon-build.elvanto.net';
        var strPath='/login';
        //var strRedirectURL="https://iskcon-build.elvanto.net";

if(strUserName.trim()=="" || strPassword.trim()=="")
{
  objResMain.send("0");    
}
// Prepare Request for Elvanto Login page to validate the user
 const postData = querystring.stringify({
    'login_username': strUserName, 
     'login_password': strPassword,
     'login_to':'member'
  });
  const options = {
    hostname: strHostName,
    port: 443,
    path: strPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  const reqElvanto = https.request(options, (resElvanto) => {
    console.log(`STATUS: ${resElvanto.statusCode}`);
    strStatusCode=resElvanto.statusCode;
    resElvanto.setEncoding('utf8');
      console.log(`HEADERS: ${JSON.stringify(resElvanto.headers)}`);
      if(strStatusCode=="302")
      {
        console.log(resElvanto.headers['set-cookie']);
        var objCookies=resElvanto.headers['set-cookie'];
        if(resElvanto.headers['set-cookie']!=undefined)
        {
          var strCookies=JSON.stringify(resElvanto.headers['set-cookie']);
          if(strCookies.indexOf(strUserName)>-1)
          {
            objReq.session.loggedUser=strUserName;
            objReq.session.save(); // This saves the modifications
            console.log(objReq.session.loggedUser);
            console.log("print Report");
            objResMain.send("1"); 
          }
          else
          {
            objResMain.send("0");    
          }
        }
        else
        {
          objResMain.send("0");    
        }
      }
      else
      {
        // Return on Fail
        objResMain.send("0");
      }
    
  });
  
  reqElvanto.on('error', (e) => {
    objResMain.send("0");
    console.error(`problem with request: ${e.message}`);
  });
  // write data to request body
  reqElvanto.write(postData);
  reqElvanto.end();
    });
    // Server Start to listen request 
server.listen(port, () => console.log(`App started on port ${port}`));    