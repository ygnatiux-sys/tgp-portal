import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8080;

const oauth2Client = new google.auth.OAuth2(
  process.env.GCP_CLIENT_ID,
  process.env.GCP_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URI || 'http://localhost:8080/oauth2callback'
);

app.get('/auth/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/photoslibrary.readonly'
    ]
  });
  res.json({ url });
});

app.listen(port, () => {
    console.log(`tgp-picker-api listening on port ${port}`);
});
