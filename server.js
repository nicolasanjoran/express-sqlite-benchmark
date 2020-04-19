let port = 3000

const express = require('express')
const Database = require('better-sqlite3');
const db = new Database('test.sqlite');

const JWT_SECRET = process.env.JWT_SECRET || "mysecret"


const crypto = require('crypto')

//db.pragma('journal_mode = DELETE');
db.pragma('journal_mode = WAL'); // default with sqlite3: DELETE
db.pragma('synchronous = NORMAL') // default with sqlite3: FULL


db.exec('CREATE TABLE IF NOT EXISTS test(userid varchar(100) not null, name varchar(100) not null, age integer not null)')
//db.exec("DELETE FROM TEST");

const stmt = db.prepare('INSERT INTO test(userid, name, age) VALUES(@uid,@name,@age)')
const select = db.prepare('SELECT * FROM test LIMIT 1;')
const jwt = require('jsonwebtoken')


const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Hello World!')
})

function processToken(req, res, next) {
  let token = extractToken(req)
  let decoded = null

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
      if (error) {
          return res.status(401).send({ error })
      }
      req.jwt = decoded
      next(null)
  })
}

app.use(processToken)

app.get('/user', async (req, res) => {
	
	let result = select.get()
	res.send(result)

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

function extractToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { // Authorization: Bearer g1jipjgi1ifjioj
        // Handle token presented as a Bearer token in the Authorization header
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        // Handle token presented as URI param
        return req.query.token;
    } else if (req.cookies && req.cookies.token) {
        // Handle token presented as a cookie parameter
        return req.cookies.token;
    }
}