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
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// database connect
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(methodoverride((req, res) => {
  if (typeof (req.body) === 'object' && '_method' in req.body) {
    let method = req.body._method;
    delete (req.body._method);
    return method;
  }
}));


// INDEX
app.get('/', (req, res) => {
  res.render('pages/index');
});

// ROUTES
app.get('/saved', getBookCollection);
app.get('/books/:book_id', getSingleBook);
app.post('/searches', bookSearch);
app.post('/books', saveBook);
app.post('/update', updateBook);
app.post('/delete', deleteBook);

//error page
app.get('/error', (req, res) => { res.render('pages/error'); });

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

function bookSearch(req, res) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}`;
  if (req.body.searchType === 'title') { url += `+intitle:${req.body.search}`; }
  if (req.body.searchType === 'author') { url += `+inauthor:${req.body.search}`; }

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
    .then(results => res.render('pages/searches/show', { searchResults: results }))
    .catch(err => {
      handleError(err, res);
    })
}

function getBookCollection(req, res) {
  const SQL = `SELECT * FROM books;`;

  return client.query(SQL)
    .then(results => {
      if (results.rows[0]) {
        res.render('pages/saved', { books: results.rows })
      } else {
        console.log('no saved book results')
        res.render('pages/index');
      }
    })
    .catch(err => handleError(err, res));
}

function getSingleBook(req, res) {
  let SQL = `SELECT * FROM books WHERE id=$1;`;
  let values = [req.params.book_id];
  return client.query(SQL, values)
    .then(result => res.render('pages/books/show', { book: result.rows[0] }))
    .catch(handleError);
}

function saveBook(req, res) {
  const SQL = `
    INSERT INTO books (authors, title, isbn, image_url, book_description, bookshelf)
    VALUES($1, $2, $3, $4, $5, $6) RETURNING id;
  `;
  let values = [req.body.authors, req.body.title, req.body.isbn, req.body.image_url, req.body.book_description, req.body.bookshelf];

  return client.query(SQL, values)
    .then(book => {
      res.redirect(`/books/${book.rows[0].id}`)
    })
    .catch(error => handleError(error))
}

function updateBook(req, res) {
  const updates = [req.body.authors, req.body.title, req.body.isbn, req.body.image_url, req.body.book_description, req.body.bookshelf, req.body.id];
  let pathSQL = 'UPDATE books SET authors=$1, title=$2, isbn=$3, image_url=$4, book_description=$5, bookshelf=$6 WHERE id=$7;';
  return client.query(pathSQL, updates)
    .then(() => {
      res.redirect(`/books/${req.body.id}`)
    })
    .catch(error => handleError(error))
}

function deleteBook(req, res) {
  const values = [req.body.id];
  const SQL = `DELETE FROM books WHERE id=$1;`;
  client.query(SQL, values);
  res.redirect(`/saved`);
}

// ERROR HANDLER //
function handleError(error, res) {
  res.render('pages/error', { error: 'Uh Oh' });
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
