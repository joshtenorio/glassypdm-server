import express from "express";
import cors from "cors";
import { config } from "dotenv";
//import mysql from "mysql2";

const multer = require("multer");
const mysql = require("mysql2");
const upload = multer();

const app = express();
app.use(cors());

config();

const dbConnection = mysql.createConnection(process.env.DATABASE_URL);

dbConnection.connect();

app.get("/", (req: any, res: any) => {
    console.log(req.body);
    dbConnection.query('SELECT * FROM file', function (err: any, rows: any, fields: any) {
        if (err) throw err
    
        res.send(rows)
      })
});

// upload.none() is text only multipart form
app.post("/ingest", upload.single("key"), (req: any, res: any) => {
    console.log("brrrr");
    console.log(req.body); //req.body["path"]
    console.log(req.file);
    res.send("no");
});

app.listen(5000, () => {
    console.log("listening on port 5000");
})