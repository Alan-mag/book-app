'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodoverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

// application middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(methodoverride((req, res) => {
  if(typeof(req.body) === 'object' && '_method' in req.body){
    let method = req.body._method;
    delete(req.body._method);
    return method;
  }
}));

app.get('/', (req, res) => {
  res.render('pages/index');
});

// ROUTES
app.get('/saved', getBookCollection);
app.get('/searches', getBook);
app.post('/searches', buildSearch);

//error page
app.get('/error', (req, res) =>{ res.render('pages/error'); });

// ------------- BOOK ----- //
function Book(data) {
  this.title = data.volumeInfo.title ? data.volumeInfo.title : 'No Title';
  this.author = data.volumeInfo.authors ? data.volumeInfo.authors : 'Author(s) Unknown';
  this.isbn = data.volumeInfo.industryIdentifiers.type ? data.volumeInfo.industryIdentifiers.type : 'no isbn';
  this.publisher = data.volumeInfo.publisher ? data.volumeInfo.publisher : 'Publisher Unknown';
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'Description Unknown';
  this.page_count = data.volumeInfo.pageCount ? data.volumeInfo.pageCount : 'Page Count Unknown';
  this.category = data.volumeInfo.mainCategory ? data.volumeInfo.mainCategory : 'Genre/Category Unknown';
  this.avg_rating = data.volumeInfo.averageRating ? data.volumeInfo.averageRating : 'Rating Unknown';
  this.image = data.volumeInfo.imageLinks.smallThumbnail ? data.volumeInfo.imageLinks.smallThumbnail : 'No Link';
  this.language = data.volumeInfo.language ? data.volumeInfo.language : 'Unknown Language';
}

function buildSearch(req, res) {
  console.log(req.body)
  let url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}`;
  if (req.body.searchType === 'title') { url += `+intitle:${req.body.search}`;}
  if (req.body.searchType === 'author') { url += `+inauthor:${req.body.search}`;}

  return superagent.get(url)
    .then(result => {
      console.log('Got data from API');
      if (!result.body) { res.render('pages/error'); }
      else {
        return result.body.items.slice(0, 10).map(searchedBook => {
          return new Book(searchedBook);
        });
      }
    })
    .then(results => res.render('pages/searches/show', {searchResults: results}))
    .catch(err => {
      handleError(err, res);
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
      handleError(err, res);
    })
}

// for when we setup db
function getBook(req, res) {
  Book.fetch(req.query.search, req.query.searchType).then(data => {
    res.send(data);
  })
}

function getBookCollection(req, res) {
  const SQL = `SELECT * FROM books;`;

  return client.query(SQL)
    .then(results => res.render('pages/saved', {books: results.rows}))
    .catch(handleError);
}

// ERROR HANDLER //
function handleError(error, res){
  res.render('pages/error', {error: 'Uh Oh'});
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
