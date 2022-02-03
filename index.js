const express = require('express')
const app = express()
const fs = require("fs")
const cors = require("cors")
const bodyParser = require("body-parser")
const words = require("./words.js")

app.use(cors({
    origin: "http://localhost:3000"
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post('/checkWord', function (req, res) {
    console.log(req.body)
    if (req.body.guessWord) {
        fs.readFile( __dirname + "/dailyWords.json", 'utf8', function (err, data) {
            data = JSON.parse(data)

            const guessWord = req.body.guessWord
            const today = new Date()
            const dateString = `${today.getDate()}${today.getMonth()}${today.getFullYear()}`

            if (!data[dateString]) {
                const index = Math.floor(Math.random() * (15918 - 0) + 0)
                data[dateString] = words.dict[index].toUpperCase()
                fs.writeFileSync(__dirname + "/dailyWords.json", JSON.stringify(data, null, 2))
            }

            correctWord = data[dateString]

            let results = []

            if (guessWord === correctWord) {
                results = [1, 1, 1, 1, 1]
            } else {
                guessWord.split("").forEach((letter, index) => {
                    let indices = []
                    correctWord.split("").forEach((l, i) => {
                        if (l === letter) {
                            indices.push(i)
                        }
                    })

                    if (indices.length === 0) {
                        results.push(-1)
                    } else if (indices.indexOf(index) !== -1) {
                        results.push(1)
                    } else {
                        results.push(0)
                    }

                    // if (correctWord.split("").indexOf(letter) === -1) {
                    //     results.push(-1)
                    // } else if (indices.indexOf(index) !== -1) {
                    //     results.push(1)
                    // } else {
                    //     results.push(0)
                    // }

                    // if (letterIndex === -1) {
                    //     results.push(-1)
                    // } else if (letterIndex !== -1 && letterIndex !== index) {
                    //     results.push(0)
                    // } else {
                    //     results.push(1)
                    // }
                });
            }

            res.end(JSON.stringify(results));
        });
    } else {
        res.send("No guess word provided")
    }
})

const server = app.listen(8081, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})