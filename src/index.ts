import express from "express";
import cors from "cors";
import { config } from "dotenv";

const multer = require("multer");
const mysql = require("mysql2");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

config();

const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        accessKeyId: process.env.S3_ACCESS_KEY_ID
    }
})

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "glassy-pdm",
        ACL: "public-read", // anyone w/ link can read
        metadata: function(req: any, file: any, cb: any) {
            cb(null, { fieldName: file.fieldname })
        },
        key: function(req: any, file: any, cb: any) {
            cb(null, Date.now().toString());
        }
    })
});

const app = express();
app.use(cors());

const dbConnection = mysql.createConnection(process.env.DATABASE_URL);

dbConnection.connect();

app.get("/", (req: any, res: any) => {
    console.log(req.body);
    res.send("nerd");
});

// get files changed in latest commit
app.get("/info/commit/latest", (req: any, res: any) => {
    console.log("GET @ /info/latest");
    res.send("test");
});

// get a specific commit by id
app.get("/info/commit/:commit", (req: any, res: any) => {

});

// get the current state of the repository
// commit # and latest revision of each path
app.get("/info/state", (req: any, res: any) => {

});

// get all revisions of a file
app.get("/info/file/:path", (req: any, res: any) => {
    try {
        const param: string = req.params.path;
        const path = param.replaceAll("|", "\\");
        console.log(path);
        dbConnection.execute(
            'SELECT * FROM file WHERE path = ?', [path],
            function(err: any, results: any, fields: any) {
                console.log(results);
            }
        );
    } catch(err) {
        console.error(err);
    }

    res.send("asdf");
});

// get latest revision of each file
app.get("/info/repo", (req: any, res: any) => {
    dbConnection.execute(
        'SELECT * FROM file',
        function(err: any, results: any, fields: any) {
            console.log(results);
            console.log(fields);
        }
    );
    res.send("asdf");
});

// download a file by its s3 key
app.get("/download/:key", (req: any, res: any) => {
    const key: string = req.params.key;
    res.send("lmao");
});

app.post("/ingest", upload.single("key"), (req: any, res: any) => {
    console.log("POST @ /ingest");
    console.log(req.body);
    try {
        const body = req.body;
        const path = body["path"];
        const commit = body["commit"];
        const size = body["size"];
        const hash = body["hash"];
        const s3key = req.file.key;
        console.log(path);
        console.log(commit);
        console.log(size);
        console.log(hash);
        console.log(s3key);

        dbConnection.execute(
            'INSERT INTO file(path, commit, size, hash, s3key) VALUES (?, ?, ?, ?, ?)',
            [path, commit, size, hash, s3key],
            function(err: any, results: any, fields: any) {
                console.log(results);
                console.log(fields);
            }
        );
    } catch(err: any) {
        console.error(err.message);
    }
    res.send("bro");
});

app.listen(process.env.PORT || 5000, () => {
    console.log("listening on port ", process.env.PORT || 5000);
});