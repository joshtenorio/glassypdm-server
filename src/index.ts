import { config } from "dotenv";

config();

import express from "express";
import cors from "cors";
import clerk from "@clerk/clerk-sdk-node";
import { CADFile, DownloadInfo, ProjectState } from "./types";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl, S3RequestPresigner} from "@aws-sdk/s3-request-presigner";
import { getPermissionLevel, pool, turso } from "./db";
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");


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
        fileSize: 900 * 1024 * 1024
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
app.use(express.json());


//db.connect();
let fails = 0;
let CLIENT_VERSION = "0.5.0";

app.get("/", (req: any, res: any) => {
    res.send(
    {
        "hmm": "lol",
        "failures": fails,
        "version": CLIENT_VERSION
    }
    );
});

app.get("/version", (req: any, res: any) => {
    res.send({
        "version": CLIENT_VERSION
    });
});

// get files changed in latest commit
// TODO
app.get("/info/commit/latest", (req: any, res: any) => {
    console.log("GET @ /info/latest");
    res.send("test");
});

// get most recent 5 commits
// TODO generalize to recent n commits
// TODO get files as well
app.get("/info/commit/recent", async(req: any, res: any) => {
    console.log("GET @ /info/commit/recent")
    try {
        let result = await turso.execute(
            "SELECT * FROM `commit` ORDER BY `id` DESC LIMIT 5;"
        );
        let rows: any = result.rows;
        
        for(let i = 0; i < rows.length; i++) {
            let user = await clerk.users.getUser(rows[i]["authorid"]);
            rows[i].authorID = user.firstName + " " + user.lastName;
        }
        res.send(rows);
        return;
    } catch(err: any) {
        console.error(err);
    }
    res.send("lol");
});

// get a specific commit by id
app.get("/info/commit/:commit", async(req: any, res: any) => {
    const commitid = req.params.commit;
    try {
        const result = await turso.execute({
            sql: "SELECT * FROM `commit` WHERE `id` = ?;",
            args: [commitid]
        });
        const rows: any = result.rows;

        let user = await clerk.users.getUser(rows[0]["authorid"]);
        let author = user.firstName + " " + user.lastName;

        const results = await turso.execute({
            sql: "SELECT * FROM `file` WHERE `commitid` = ?;",
            args: [commitid]
        });
        const files = results.rows;
        let output = {
            author: author,
            id: rows[0].id,
            message: rows[0].message,
            timestamp: rows[0].timestamp,
            count: files.length,
            files: files
        }
        res.json(output);
    } catch(err: any) {
        console.error(err);
    }
});

// get a user's permission by their email
// TODO project id ??
app.get("/info/permissions/:email", async(req: any, res: any) => {
    const email = req.params.email
    const users = await clerk.users.getUserList({
        emailAddress: [email]
    })
    if(users.length === 0) {
        console.log("no users found");
        res.send({
            "result": false
        });
        return;
    }
    const id: string = users[0]["id"];
    console.log(id)
    try {
        const result = await turso.execute({
            sql: "SELECT * FROM `permission` WHERE `userid` = ? ORDER BY `id` DESC LIMIT 1;",
            args: [id]
        });
        const rows: any = result.rows;
        if(rows.length === 0) {
            await turso.execute({
                sql:"INSERT INTO `permission`(userid, projectid, level) VALUES (?, 0, 0)",
                args: [id],
            });
            res.send({
                "result": true,
                "level": 0
            });
            return;
        }
        
        res.send({
            "result": true,
            "level": rows[0]["level"]
        });
        return;
    } catch(err: any) {
        console.error(err);
    }
    res.send({
        "result": false,
    });
})

app.post("/permissions", async(req: any, res: any) => {
    try {
        const body = req.body;
        const setterID = body["setterID"];
        const userEmail = body["userEmail"];
        const projectID = body["projectID"];
        const permissionLevel = body["permissionLevel"];
        const users = await clerk.users.getUserList({
            emailAddress: [userEmail]
        });
        if(users.length === 0) {
            console.log("no users found");
            res.send({
                "result": "user dne"
            });
            return;
        }
        const userID = users[0]["id"];
        const userLevel: any = await getPermissionLevel(userID, projectID);

        // get the permission level of the setter
        let setterLevel: any = await getPermissionLevel(setterID, projectID);
        if (setterLevel < 2 || (permissionLevel >= setterLevel && setterLevel != 3) || userLevel >= setterLevel) {
            res.send({
                "result": "no permission"
            });
            return;
        }

        // set the permission level
        try {
            await turso.execute({
                sql: "INSERT INTO `permission`(userid, projectid, level) VALUES (?, ?, ?)",
                args: [userID, projectID, permissionLevel],
            });
        } catch(e: any) {
            console.error(e.message);
        }

    } catch(e: any) {
        console.error(e.message);
    }
    res.send({
        "result": "success"
    });
})

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
        const results = await turso.execute(
            "SELECT MAX(`commitid`) as latest FROM `file`"
        );
        const rows: any = results.rows;
        output.commit = rows[0]["latest"];

        // get files
        const fileResults = await turso.execute(
            "SELECT a.path, a.commitid, a.size, a.hash, a.s3key FROM `file` a \
            INNER JOIN ( \
                SELECT path, MAX(id) id \
                FROM `file` \
                GROUP BY path \
            ) b ON a.path = b.path AND a.id = b.id \
            "
        );
        const fileRows: any = fileResults.rows;
        output.files = fileRows;

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
        turso.execute({
            sql: 'SELECT * FROM `file` WHERE `path` = ?',
            args: [path],
        });
    } catch(err) {
        console.error(err);
    }

    res.send("asdf");
});

// get latest revision of each file
app.get("/info/repo", (req: any, res: any) => {
    console.log("GET @ /info/repo");
    res.send("asdf");
});

// download a file by its s3 key
app.get("/download/s3/:key", async(req: any, res: any) => {
    console.log("GET @ /download/s3/:key");
    const key: string = req.params.key;
    console.log(key)
    if (key) {
        // get filename by key
        try {
            const result = await turso.execute({
                sql: "SELECT `path` FROM `file` WHERE `s3key` = ?",
                args: [key]
            });
            const rows: any = result.rows;
            console.log(rows[0].path)
            const filename = rows[0].path.split("\\")[rows[0].path.split("\\").length - 1];

            console.log(key);
            const command = new GetObjectCommand({
                Bucket: "glassy-pdm",
                Key: key,
                ResponseContentDisposition: "attachment;filename=" + filename
            });
            // presigned url, expires in 60 minutes
            const url = await getSignedUrl(s3, command, {expiresIn: 3600} );
            console.log(url);
            res.send({
                "s3Url": url,
                "key": key
            });
        } catch(err: any) {
            console.error(err);
        }

    }
});


// download a file's latest revision by path. i.e. it returns presigned s3 URLs
app.get("/download/file/:path", async(req: any, res: any) => {
    console.log("GET @ /download/file/:path");
    const param: string = req.params.path;
    const path = param.replaceAll("|", "\\");

    // get s3 key by path, with latest revision
    const result = await turso.execute({
        sql: "SELECT s3key FROM file WHERE path = ? AND id = (SELECT MAX(id) FROM file WHERE path = ?);",
        args: [path, path]
    });
    const rows: any = result.rows;
    if(rows.length == 0) {
        res.send({
            "s3Url": "dne",
            "key": "dne",
            "relPath": path
        });
        return;
    }
    const key: any = rows[0]["s3key"];
    if (key) {
        console.log(key);
        const command = new GetObjectCommand({
            Bucket: "glassy-pdm",
            Key: key.toString(),
        });
        // presigned url, expires in 10 minutes
        const url = await getSignedUrl(s3, command, {expiresIn: 600} );
        console.log(url);
        res.send({
            "s3Url": url,
            "key": key.toString(),
            "relPath": path
        });
    }
    else {
        // TODO ????
        res.send({
            "s3Url": "delete",
            "key": "lol",
            "relPath": path
        });
    }

});

app.post("/commit", async(req: any, res: any) => {
    console.log("POST @ /commit");
    // check if commit already exists
    // if it does, return some sort of error
    // otherwise proceed normally
    try {
        const body = req.body;
        console.log(req.body)
        const commitID = body["commitid"];
        const projectID = body["projectID"];
        const authorID = body["authorID"];
        let message: string = body["message"];
        // limit the message so it fits in database
        message = message.substring(0, 500); 
        const fileCount = body["fileCount"];
        const timestamp = Date.now().toString();
        const results = await turso.execute({
            sql: "SELECT * FROM `commit` WHERE `id` = ?;",
            args: [commitID]
        });
        const rows: any = results.rows;
        console.log(rows[0]);
        if(rows[0]) {
            // commit already exists so return an error
            res.send({"isCommitFree": false});
            return;
        }

        // at this point; we can create a commit
        turso.execute({
            sql: 'INSERT INTO `commit`(id, projectid, authorid, message, filecount, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            args: [commitID, projectID, authorID, message, fileCount, timestamp],
        });
        res.send({"isCommitFree": true});
        return;
    } catch(err: any) {
        console.error(err);
    }
    res.send({"isCommitFree": false});
});

app.post("/ingest", upload.single("key"), fileSizeLimitErrorHandler, (req: any, res: any) => {
    console.log("POST @ /ingest");
    try {
        const body = req.body;
        console.log(body);
        const path = body["path"];
        const commit = body["commit"];
        const size = body["size"];
        const hash = body["hash"];
        const project = body["project"];
        //const changeType = body["changeType"];
        //console.log(changeType)
        if(req.file) {
            const s3key = req.file.key;
            turso.execute({
                sql: 'INSERT INTO `file`(`path`, `commitid`, `size`, `hash`, `s3key`, `projectid`) VALUES (?, ?, ?, ?, ?, ?)',
                args: [path, commit, size, hash, s3key, project],
            });
            res.send({
                "result": true,
                "s3key": req.file.key,
                "path": path
            });
            return;
        }
        else {
            turso.execute({
                sql: 'INSERT INTO `file`(path, commitid, size, hash, projectid) VALUES (?, ?, ?, ?, ?)',
                args: [path, commit, size, hash, project],
            });
            res.send({
                "result": true,
                "s3key": "deleted",
                "path": path
            });
            return;
        }

    } catch(err: any) {
        console.error(err);
    }
    fails += 1;
    res.send({ "result": false, "s3key": "oops" });
});

let server = app.listen(process.env.PORT || 5000, () => {
    console.log("listening on port ", process.env.PORT || 5000);
});
