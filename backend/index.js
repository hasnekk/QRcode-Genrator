import express from 'express';
import pg from 'pg';
import * as dotenv from 'dotenv';
import QRCode from 'qrcode';
import cors from 'cors';

dotenv.config();

const PORT = 3000;
const CORS_OPTIONS = {
  origin: process.env.ALLOWED_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST'],
};

// #region CONNECT TO DB
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  pplication_name: 'QrCode Generator',
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

// #region APP MIDDLWARE

app.use(cors(CORS_OPTIONS));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// #endregion

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

app.get('/ticket/:id', async (req, res) => {
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

    return res.status(200).json({ msg: 'Success', data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Server Error.', error: true });
  }
});

app.post('/ticket', async (req, res) => {
  const { vatin, firstName, lastName } = req.body;

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

    const qrCodeImage = await QRCode.toDataURL(url);

    return res.status(200).json({ msg: 'Success', data: qrCodeImage });
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
