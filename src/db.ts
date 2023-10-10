const mysql = require("mysql2/promise");

export const pool = mysql.createPool(process.env.DATABASE_URL);

export async function getPermissionLevel(userid: string, projectid: string) {
    try {
        const [rows, fields] = await pool.execute(
            "SELECT * FROM permission WHERE userid = ? and projectid = ? ORDER BY id DESC LIMIT 1",
            [userid, projectid]
        );
        if(rows.length === 0) {
            await pool.execute(
                "INSERT INTO permission(userid, projectid, level) VALUES (?, ?, 0)",
                [userid, projectid]
            );
            return 0;
        }
        else {
            return rows[0]["level"];
        }
    } catch(err: any) {
        console.error(err.message);
    }
}