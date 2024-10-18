import express from 'express';
import pg from 'pg';
import * as dotenv from 'dotenv';
import QRCode from 'qrcode';
import cors from 'cors';
import { auth } from 'express-oauth2-jwt-bearer';
import session from 'express-session';
import pkg from 'express-openid-connect';
const { auth: OIDCAuth, requiresAuth } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import pgSession from 'connect-pg-simple';

dotenv.config();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const PORT =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4000;

// #region CONFIGS
const AUTH_SEVRER = 'https://dev-nunmbneef5z3z1bw.us.auth0.com';
const jwtCheck = auth({
  audience: 'https://ticket-qr-generator.com',
  issuerBaseURL: AUTH_SEVRER,
  tokenSigningAlg: 'RS256',
});
const config = {
  authRequired: false,
  auth0Logout: true,
  idpLogout: true,
  secret: process.env.OIDC_SECRET,
  clientID: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  issuerBaseURL: AUTH_SEVRER,
  baseURL: externalUrl || `http://localhost:${PORT}`,
  authorizationParams: {
    response_type: 'code',
  },
};
// #endregion

// #region CONNECT TO DB
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  pplication_name: 'QrCode Generator',
  ssl: {
    rejectUnauthorized: false,
    require: process.env.PGSSLMODE,
  },
});

pool
  .connect()
  .then(() => console.info('Connected to DB.'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
// #endregion

const app = express();
app.set(
  'views',
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'src', 'views'),
);
app.set('view engine', 'pug');

// #region APP MIDDLWARE
app.use(
  '/static',
  express.static(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'src', 'public'),
  ),
);

app.use(
  session({
    store: new (pgSession(session))({
      pool: pool,
    }),
    secret: process.env.OIDC_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.SECURE_COOKIE },
  }),
);

app.use(OIDCAuth(config));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// #endregion

// FRONTEND SERVE PUG
app.get('/', (req, res) => {
  let username;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }
  res.render('index', { username });
});

app.get('/qrcode/:id', (req, res) => {
  const ticketId = req.params.id;
  let username;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
    return res.render('qrcode', { ticketId, username });
  } else {
    res.oidc.login();
  }
});

// API ENDPOINTS
app.get('/ticket', async (req, res) => {
  const query = 'SELECT COUNT(*) FROM ticket;';

  try {
    const response = await pool.query(query);

    return res
      .status(200)
      .json({ msg: 'Success', data: response.rows[0].count });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Server Error.', error: true });
  }
});

app.get('/ticket/:id', requiresAuth(), async (req, res) => {
  const query = {
    text: 'SELECT * FROM ticket WHERE ticket_id=$1;',
    values: [req.params.id],
  };

  try {
    const ticket = await pool.query(query);

    if (!ticket) {
      return res
        .status(400)
        .json({ error: true, msg: 'This ticket does not exist.' });
    }

    const data = ticket.rows[0];

    const url = `${req.protocol}://${req.hostname}/qrcode/${data.ticket_id}`;
    const qrCodeImage = await QRCode.toDataURL(url);

    data.qrCode = qrCodeImage;

    data.userName = req.oidc?.user?.name;
    data.userNickName = req.oidc?.user?.nickname;

    return res.status(200).json({ msg: 'Success', data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Server Error.', error: true });
  }
});

app.post('/ticket', jwtCheck, async (req, res) => {
  const { vatin, firstName, lastName } = req.body;

  const accessToken = req.auth?.token;

  if (!accessToken) {
    return res.status(401).json({ msg: 'Unauthorized.', error: true });
  }

  if (!vatin || !firstName || !lastName) {
    return res.status(400).json({
      msg: 'You are missing some properties. Please include: "vatin", "firstName", "lastName".',
      error: true,
    });
  }

  const queryCheckNumOfTickets = {
    text: 'SELECT COUNT(*) FROM ticket WHERE vatin=$1;',
    values: [vatin],
  };

  const queryCrateTicket = {
    text: 'INSERT INTO ticket (vatin, firstName, lastName) VALUES ($1, $2, $3) RETURNING ticket_id;',
    values: [vatin, firstName, lastName],
  };

  let insertedEntryId = null;
  try {
    // check if there are already 3 tickets for the vatin
    const numOfVatinTickets = await pool.query(queryCheckNumOfTickets);

    if (numOfVatinTickets.rows[0].count >= 3) {
      return res.status(400).json({
        msg: 'There are already 3 tickets registrated on given VATIN.',
        error: true,
      });
    }

    const dbEntry = await pool.query(queryCrateTicket);
    insertedEntryId = dbEntry.rows[0].ticket_id;

    // create qr code
    const url = `${req.protocol}://${req.hostname}/qrcode/${insertedEntryId}`;

    // const qrCodeImage = await QRCode.toDataURL(url);
    const qrCodeImage = await QRCode.toBuffer(url);

    res.set('Content-Type', 'image/png');
    res.send(qrCodeImage); // Send the image as a response
  } catch (e) {
    if (insertedEntryId) {
      const queryDeleteTicket = {
        text: 'DELETE FROM ticket WHERE ticket_id=$1;',
        values: [insertedEntryId],
      };
      await pool.query(queryDeleteTicket);
    }

    console.error(e);
    return res.status(500).json({ msg: 'Server Error.', error: true });
  }
});

if (externalUrl) {
  const hostname = '0.0.0.0';
  app.listen(PORT, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${PORT}/ and from
  outside on ${externalUrl}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}/`);
  });
}
