import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { CADFile, ProjectState } from "./types";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl, S3RequestPresigner} from "@aws-sdk/s3-request-presigner";
const multer = require("multer");
const mysql = require("mysql2/promise");
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

const fileSizeLimitErrorHandler = (err: any, req: any, res: any, next: any) => {
    if (err) {
        console.log("too big!");
      res.send(413);
    } else {
      next();
    }
  }

const upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024
    },
    storage: multerS3({
        s3: s3,
        bucket: "glassy-pdm",
        ACL: "public-read", // anyone w/ link can read
        //limits: { fileSize: 50 * 1000 * 1000},
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

const pool = mysql.createPool(process.env.DATABASE_URL);

//db.connect();

app.get("/", (req: any, res: any) => {
    res.send({"nerd": "lmao"});
});

// get files changed in latest commit
app.get("/info/commit/latest", (req: any, res: any) => {
    console.log("GET @ /info/latest");
    res.send("test");
});

// get a specific commit by id
app.get("/info/commit/:commit", (req: any, res: any) => {
    res.send("test");
});

// get the current state of the repository
// commit # and latest revision of each path
app.get("/info/project", async(req: any, res: any) => {
    console.log("GET @ /info/project");
    try {
        let output: ProjectState = {
            commit: 0,
            files: []
        };
        // get latest commit #
        let [rows, fields] = await pool.execute(
            "SELECT MAX(commit) as latest FROM file", []
        );
        output.commit = rows[0]["latest"];

        // get files
        [rows, fields] = await pool.execute(
            "SELECT a.path, a.commit, a.size, a.hash FROM file a \
            INNER JOIN ( \
                SELECT path, MAX(id) id \
                FROM file \
                GROUP BY path \
            ) b ON a.path = b.path AND a.id = b.id \
            "
        );
        output.files = rows;

        // send response
        res.send(JSON.stringify(output));
    } catch(err) {
        console.error(err);
    }
});

// get all revisions of a file
app.get("/info/file/:path", (req: any, res: any) => {
    console.log("GET @ /info/file/:path");
    try {
        const param: string = req.params.path;
        const path = param.replaceAll("|", "\\");
        console.log(path);
        pool.execute(
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
    console.log("GET @ /info/repo");
    pool.execute(
        'SELECT * FROM file',
        function(err: any, results: any, fields: any) {
            console.log(results);
            console.log(fields);
        }
    );
    res.send("asdf");
});

// download a file by its s3 key
app.get("/download/s3/:key", (req: any, res: any) => {
    console.log("GET @ /download/s3/:key");
    const key: string = req.params.key;
    res.send("lmao");
});

// download a file's latest revision by path
app.get("/download/file/:path", async(req: any, res: any) => {
    console.log("GET @ /download/file/:path");
    const param: string = req.params.path;
    const path = param.replaceAll("|", "\\");

    // get s3 key by path, with latest revision
    const [rows, fields] = await pool.execute(
        "SELECT s3key FROM file WHERE path = ? GROUP BY id ", [path]
    )
    const key: string = rows[0]["s3key"].toString();
    console.log(key);
    const command = new GetObjectCommand({
        Bucket: "glassy-pdm",
        Key: key,
    });
    // presigned url, expires in 10 minutes
    const url = await getSignedUrl(s3, command, {expiresIn: 600} );
    console.log(url);
    res.send({"s3Url": url});
});

app.post("/ingest", upload.single("key"), fileSizeLimitErrorHandler, (req: any, res: any) => {
    console.log("POST @ /ingest");
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

        pool.execute(
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