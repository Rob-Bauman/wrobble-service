if (process.env.NODE_ENV !== 'production') {
    console.log("loading env")
    require('dotenv').config();
}
const express = require('express')
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")

app.use(cors({
    origin: "*"
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.dbuser,
  host: process.env.dbhost,
  database: process.env.dbname,
  password: process.env.dbpw,
  port: process.env.dbport,
})

const getDailyWord = (date) => {
    return pool.query("SELECT * FROM daily_words WHERE date = $1", [date], (error, results) => {
        if (error) {
            throw error;
        }
        return results.rows;
    });
}

// app.post('/insertWords', (req, res) => {
//     words.dict.forEach(word => {
//         pool.query("INSERT INTO words (word) VALUES ($1)", [word], (error, result) => {
//             console.log(word + ' inserted')
//         })
//     })
// })

app.post('/checkWord', function (req, res) {
    console.log(req.body)
    if (req.body.guessWord) {
        const today = new Date()
        const dateString = `${today.getDate()}${today.getMonth()}${today.getFullYear()}`
        let correctWord = ""
        pool.query("SELECT * FROM daily_words WHERE date = $1", [dateString], (error, results) => {
            if (error) {
                throw error
            }

            if (results.rows.length === 0) {
                pool.query("SELECT * FROM words ORDER BY random() LIMIT 1", (error, results) => {
                    if (error) {
                        throw error
                    }

                    correctWord = results.rows[0].word.toUpperCase()
                    console.log("Retrieved new word: " + correctWord)

                    pool.query("INSERT INTO daily_words (date, word) VALUES ($1, $2)", [dateString, correctWord], (error, results) => {
                        if (error) {
                            throw error
                        }
                    })
                })
            } else {
                correctWord = results.rows[0].word.toUpperCase()
            }

            const guessWord = req.body.guessWord.toUpperCase()

            let guessResults = []

            if (guessWord === correctWord) {
                guessResults = [1, 1, 1, 1, 1]
            } else {
                guessWord.split("").forEach((letter, index) => {
                    let indices = []
                    correctWord.split("").forEach((l, i) => {
                        if (l === letter) {
                            indices.push(i)
                        }
                    })

                    if (indices.length === 0) {
                        guessResults.push(-1)
                    } else if (indices.indexOf(index) !== -1) {
                        guessResults.push(1)
                    } else {
                        guessResults.push(0)
                    }
                });
            }

            res.end(JSON.stringify(guessResults));
        });
    } else {
        res.send("No guess word provided")
    }
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8081;
}

const server = app.listen(port, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})