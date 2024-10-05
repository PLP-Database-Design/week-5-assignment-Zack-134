const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());  // Configures the app to use the cors middleware

app.set('view engine', 'ejs'); // Sets the default view engine

app.use(express.static(path.join(__dirname, 'views'))); // Serve static files from the views folder

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL database');
});
//  A funtion to fomart the dates
function fDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = (d.getMonth() + 1).toString().padStart(2, '0'); 
    let day = d.getDate().toString().padStart(2, '0'); 
  
    return `${year}-${month}-${day}`;
  }

// 1) Create a GET end-point that retrieves the patient data
app.get('/patients', (req, res) => {
    const sql = 'SELECT patient_id, first_name, last_name, date_of_birth FROM patients';
    db.query(sql, (err, result) => {
        if (err) throw err;

        // format the dates of birth
        const frdDate = result.map(patient => ({
            ...patient,
            date_of_birth: fDate(patient.date_of_birth),
        }))
        res.render('patients', { patients: frdDate });
    });
});

// 2) Create a GET end-point that displays all providers
app.get('/providers', (req, res) => {
    const sql = 'SELECT first_name, last_name, provider_specialty FROM providers';
    db.query(sql, (err, result) => {
        if(err) throw err;
        res.render('providers', { providers: result });
    });
});

// 3) Create a GET end-point that retrieves all the patients by their last name
app.get('/patients/firstname:firstName', (req, res) => {
    const { firstName } = req.params;
    const sql = 'SELECT * FROM patients WHERE first_name = ?';
    db.query(sql, [firstName], (err, result) => {
        if (err) throw err;

        // format the dates of birth
        const frdDate = result.map(patient => ({
            ...patient,
            date_of_birth: fDate(patient.date_of_birth),
        }))
        res.render('patients', { patients: frdDate });
    });
});

// 4) Create a GET end-point that retrives all providers by there speciality
app.get('/providers/specialty:specialty', (req, res) => {
    const { specialty } = req.params;
    const sql = 'SELECT * FROM providers WHERE provider_specialty = ?';
    db.query(sql, [specialty], (err, result) => {
        if (err) throw err;
        res.render('providers', { providers: result });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});