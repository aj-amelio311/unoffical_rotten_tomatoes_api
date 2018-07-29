const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const RateLimit = require("express-rate-limit");

var app = express();

const limiter = new RateLimit({
  windowMs: 2000,
  max: 10,
  delayMs: 0
});

app.use(limiter);

function format(string) {
  let array = string.split(" ");
  let newArray = []
  for (var i = 0; i < array.length; i++) {
    newArray.push(array[i][0].toUpperCase() + array[i].substring(1))
  }
  let output = newArray.join(" ");
  return output;
}

app.get("/movie/:movie", (req, resp) => {
  let movieTitle = req.params.movie.replace(/ /g,"_");;
  axios.get(`https://www.rottentomatoes.com/m/${encodeURIComponent(movieTitle)}`).then((response) => {
    if (response.status == 200) {
      let html = response.data;
      let $ = cheerio.load(html);
      let results = [];
      let year;
      $(".meter-value").each(function(index, element) {
        results.push($(this).text().trim());
      })
      $(".year").each(function(index, element) {
        year = $(this).text().trim().replace("(", "").replace(")", "");
      })
      let respObject = {
        title: format(decodeURIComponent(req.params.movie)),
        year: year,
        critic_score: results[0],
        audience_score: results[2],
        status: 200
      }
      resp.send(respObject)
    }
  }).catch((e) => {
    resp.send({
      error: "No results found",
      status: 404
    })
  })
})

app.listen(3000, () => {
  console.log("started...")
})
