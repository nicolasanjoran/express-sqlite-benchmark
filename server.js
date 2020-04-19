let port = 3000

const express = require('express')
const Database = require('better-sqlite3');
const db = new Database('test.sqlite');

const crypto = require('crypto')

//db.pragma('journal_mode = DELETE');
db.pragma('journal_mode = WAL'); // default with sqlite3: DELETE
db.pragma('synchronous = NORMAL') // default with sqlite3: FULL


db.exec('CREATE TABLE IF NOT EXISTS test(userid varchar(100) not null, name varchar(100) not null, age integer not null)')
//db.exec("DELETE FROM TEST");

const stmt = db.prepare('INSERT INTO test(userid, name, age) VALUES(@uid,@name,@age)')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('/user', async (req, res) => {
	
	let result = stmt.run(req.body)
	res.send(result)

})

app.get('/hash/:string', async (req, res) => {
  let hmac = crypto.createHmac("sha1", "mypassword")
  let hash = hmac.update(req.params.string).digest("hex")
  res.send(hash)
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))