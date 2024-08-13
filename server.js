const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// MySQL connection
const db = mysql.createConnection({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12725009',
  password: 'tv78mirQVw',
  database: 'sql12725009'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database.');
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage });

// Route to add student data
app.post('/api/add-student', upload.fields([
  { name: 'supplierPI' }, 
  { name: 'supplierInvoice' },
  { name: 'outwardRemittance' },
  { name: 'boeAttachment' },
  { name: 'customerInvoice' },
  { name: 'customerPO' },
  { name: 'testReport' },
  { name: 'customerPaymentDetails' },
  { name: 'exportShipmentBill' },
  { name: 'airwayBill' },
  { name: 'partPhoto' }
]), (req, res) => {
  const formData = req.body;
  const files = req.files;

  const attachments = {};

  for (const key in files) {
    attachments[key] = files[key][0].path.replace(/\\/g, '/');
  }

  const studentData = {
    partNumber: formData.partNumber,
    manufacturer: formData.manufacturer,
    quantity: formData.quantity,
    supplierName: formData.supplierName,
    supplierQuantity: formData.supplierQuantity,
    dateCode: formData.dateCode,
    costPerPieceUSD: formData.costPerPieceUSD,
    costPerPieceINR: formData.costPerPieceINR,
    totalCostUSD: formData.totalCostUSD,
    totalCostINR: formData.totalCostINR,
    customerName: formData.customerName,
    customerQuantity: formData.customerQuantity,
    invoiceNumber: formData.invoiceNumber,
    customerCostPerPieceUSD: formData.customerCostPerPieceUSD,
    customerCostPerPieceINR: formData.customerCostPerPieceINR,
    customerTotalCostUSD: formData.customerTotalCostUSD,
    customerTotalCostINR: formData.customerTotalCostINR,
    boe: formData.boe,
    importDate: formData.importDate,
    dutyPayment: formData.dutyPayment,
    remarks: formData.remarks,
    attachments: JSON.stringify(attachments)
  };

  const sql = 'INSERT INTO students SET ?';

  db.query(sql, studentData, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error inserting data into the database.');
    }
    res.send({ message: 'Data submitted successfully' });
  });
});

// Route to get all students data
app.get('/api/get-students', (req, res) => {
  const sql = 'SELECT * FROM students';

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving data from the database.');
    }

    // Parse attachments JSON
    const parsedResults = results.map(result => ({
      ...result,
      attachments: JSON.parse(result.attachments)
    }));

    res.send(parsedResults);
  });
});

// Route to delete student data
app.delete('/api/delete-student/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM students WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error deleting data from the database.');
    }
    res.send({ message: 'Data deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
