'use strict';
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));