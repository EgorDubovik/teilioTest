// server.mjs
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const { AccessToken } = twilio.jwt;
const { VoiceGrant } = twilio.jwt;

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

app.get("/status", (req, res) => {
   res.json({ status: "Server is running" }, 200);
});

app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});
