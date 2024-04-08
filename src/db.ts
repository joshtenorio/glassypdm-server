const mysql = require("mysql2/promise");
import { createClient } from "@libsql/client";

export const turso = createClient({
    url: process.env.TURSO_URL as string,
    authToken: process.env.TURSO_TOKEN as string,
});

export const pool = mysql.createPool(process.env.DATABASE_URL);

export async function getPermissionLevel(userid: string, projectid: string) {
    try {
        const results = await turso.execute({
            sql: "SELECT * FROM `permission` WHERE `userid` = ? and `projectid` = ? ORDER BY `id` DESC LIMIT 1",
            args: [userid, projectid]
        });
        const rows: any = results.rows;
        if(rows.length === 0) {
            await turso.execute({
                sql: "INSERT INTO `permission`(userid, projectid, level) VALUES (?, ?, 0)",
                args: [userid, projectid]
            });
            return 0;
        }
        else {
            return rows[0]["level"];
        }
    } catch(err: any) {
        console.error(err.message);
    }
}
