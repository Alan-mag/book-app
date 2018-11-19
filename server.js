'use strict';
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('pages/index');
});

// ROUTES
app.get('/searches', getBook);
app.post('/searches', buildSearch);

// ------------- BOOK ----- //
function Book(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors;
  this.publisher = data.volumeInfo.publisher;
  this.description = data.volumeInfo.description;
  this.page_count = data.volumeInfo.pageCount;
  this.category = data.volumeInfo.mainCategory;
  this.avg_rating = data.volumeInfo.averageRating;
  this.image = data.volumeInfo.imageLinks.small;
  this.language = data.volumeInfo.language;
}

function buildSearch(req, res) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${req.query.search}`;
  if (req.query.searchType === 'title') { url+= `+intitle:${req.query.search}`;}
  if (req.query.searchType === 'author') { url+= `+inauthor:${req.query.search}`;}
  
  return superagent.get(url)
    .then(result => {
      console.log('Got data from API');
      if (!result.body) { throw 'No Data'; }
      else {
        return result.body.items.slice(0, 10).map(searchedBook => {
          return new Book(searchedBook);
        });
      }
    })
    .then(results => res.render('pages/searches/show', {searchResults: results}))
    .catch(err => {
      handleError(err);
    })
}

Book.fetch = (query, searchType) => {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${query}`;
  if (searchType === 'title') { url+= `+intitle:${query}`;}
  if (searchType === 'author') { url+= `+inauthor:${query}`;}
  
  return superagent.get(url)
    .then(result => {
      console.log('Got data from API');
      if (!result.body) { throw 'No Data'; }
      else {
        return result.body.items.slice(0, 10).map(searchedBook => {
          return new Book(searchedBook);
        });
      }
    })
    .catch(err => {
      handleError(err);
    })
}

// for when we setup db
function getBook(req, res) {
  Book.fetch(req.query.search, req.query.searchType).then(data => {
    res.send(data);
    res.render('pages/searches/show', {searchResults: data});
  })
}

// ERROR HANDLER //
function handleError(err, response) {
  console.error('ERR', err);
  if (response) {
    response.status(500).send('Sorry you got this error, maybe break time?');
  }
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));