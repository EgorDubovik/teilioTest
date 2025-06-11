// server.mjs
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const { AccessToken } = twilio.jwt;
const VoiceGrant = AccessToken.VoiceGrant;
const VoiceResponse = twilio.twiml.VoiceResponse;

app.get("/token", (req, res) => {
   const identity = req.query.identity || "user";

   const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWIML_APP_SID,
      incomingAllow: true,
   });

   const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity }
   );
   token.addGrant(voiceGrant);
   res.json({ token: token.toJwt() });
});

app.post("/voice", (req, res) => {
   console.log("OUTBOUND:", req.body);
   const to = req.body.To;
   const from = req.body.From; // ← номер, с которого хотим звонить (один из купленных в Twilio)

   const twiml = new VoiceResponse();

   if (!from) {
      return res.status(400).json({ error: "Missing From parameter" });
   }
   const dial = twiml.dial({ callerId: "+14699911174" });

   if (to) {
      dial.number(to);
   }

   res.type("text/xml");
   res.send(twiml.toString());
});

app.post("/voice-inbound", (req, res) => {
   console.log("INBOUND:", req.body);
   const twiml = new VoiceResponse();

   // twiml.dial().client('dispatcher');
   twiml.say("Hello, this is a test call");
   res.type("text/xml");
   res.send(twiml.toString());
});

app.get("/status", (req, res) => {
   res.json({ status: "Server is running" }, 200);
});

app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});
