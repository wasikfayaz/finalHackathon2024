const dialogflow = require('@google-cloud/dialogflow');
const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const express = require("express")
const cors = require("cors");
var nodemailer = require("nodemailer");
require('dotenv').config();

const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.API_KEY;

async function runChat(queryText) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 50,
    };
    const chat = model.startChat({
        generationConfig,
        history: [
        ],
    });
    const result = await chat.sendMessage(queryText);
    const response = result.response;
    return response.text();
}
const app = express();
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});
app.get('/', (req, res) => {
    res.sendStatus(200);
    res.send("Status Okay")
});
app.use(cors());




const PORT = process.env.PORT || 8080;

app.post("/webhook", async (req, res) => {
    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({ request: req, response: res });

    function hi(agent) {
        console.log(`intent  =>  hi`);
        agent.add("Welcome to SMIT Assistant. How can I assist you?")
    }

    function enrollStudent(agent) {
      const {
        stdname, stdemail, stdgender, stdcourses, stdphone, stdCNIC, stdDOB  
      } = agent.parameters;

      const dateObject = new Date(stdDOB);
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1; // Months are zero-based, so we add 1
    const day = dateObject.getDate();
    const DOB=`${month}-${day}-${year}`

      agent.add("Please check your email")
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "prof.owaisrazakhan@gmail.com",
            pass: process.env.APP_PASSWORD,
          },
        });
    
        var maillist=["prof.owaisrazakhan@gmail.com",stdemail]
        var mailOptions = {
          from: "prof.owaisrazakhan@gmail.com",
          to: maillist,
          subject: "SMIT Courses",
          html: `<body style="font-family: Arial, sans-serif; margin: 0; margin-top: 5px; padding: 0;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 0px; background-color: #f9f9f9;">
        
        <div style="padding: 20px; padding-top: 5px;">
            <p style="text-align: center;">Hey ${stdname.name},</p>
            <p style="text-align: center;">I am very happy to inform you that you have enrolled in our ${stdcourses} course</p>
            <p style="text-align: center;">Your's Details:</p>

            <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 10px;"><strong>Course Name:</strong> ${stdcourses}</li>
                <li style="margin-bottom: 10px;"><strong>Your CNIC No Date:</strong> ${stdCNIC}</li>
                <li style="margin-bottom: 10px;"><strong>E-mail:</strong> ${stdemail}</li>
                <li style="margin-bottom: 10px;"><strong>Date of Birth:</strong> ${DOB}</li>
                <li style="margin-bottom: 10px;"><strong>Phone No:</strong> ${stdphone}</li>
                <li style="margin-bottom: 10px;"><strong>Gender:</strong> ${stdgender}</li>
                

            </ul>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #777; text-align: center;">
            <p>Stay connect with us</p>
        </div>
    </div>
</body>`
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        
      }
    

    async function fallback() {
        let action = req.body.queryResult.action;
        let queryText = req.body.queryResult.queryText;

        if (action === 'input.unknown') {
            let result = await runChat(queryText);
            agent.add(result);
            console.log(result)
        }else{
            agent.add(result);
            console.log(result)
        }
    }


    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', hi); 
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('sendemail', enrollStudent);
    agent.handleRequest(intentMap);
})
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
