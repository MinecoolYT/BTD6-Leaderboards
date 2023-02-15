const express = require("express");
const app = express();
const fetch = require('node-fetch');
const cors = require('cors')
app.use(cors())

app.listen(3000, () => {
  console.log("Proxy Online");
})

app.get("/", async (request, response) => {
  try {
  const url = request.query.url || '';
  if (!url) return response.send('404');
  const data = await fetch(url);
  const text = await data.text();
  response.send(text);
  } catch (err) {
    response.send(err)
  }
})
