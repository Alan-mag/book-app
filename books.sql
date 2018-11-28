DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  authors VARCHAR(255),
  title VARCHAR (255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  book_description TEX,
  bookshelf VARCHAR(255)
);

INSERT INTO books(authors, title, isbn, image_url, book_description, bookshelf)
VALUES(
        'James Baldwin',
        'Notes of a Native Son',
        'ID-12',
        'http://books.google.com/books/content?id=wmnVhmw3zVoC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
        'In an age of Black Lives Matter, James Baldwin''s essays on life in Harlem, the protest novel, movies, and African 
        Americans abroad are as powerful today as when they were first written. With documentaries like I Am Not Your Negro bringing 
        renewed interest to Baldwin''s life and work, Notes of a Native Son serves as a valuable introduction. Written during the 1940s and early 1950s, 
        when Baldwin was only in his twenties, the essays collected in Notes of a Native Son capture a view of black life and black thought at the dawn of 
        the civil rights movement and as the movement slowly gained strength through the words of one of the most captivating essayists and foremost 
        intellectuals of that era. Writing as an artist, activist, and social critic, Baldwin probes the complex condition of being black in America.',
         'favorites'
         ),
         (
           'James Baldwin',
            'Nobody Knows My Name',
            'ID-13',
            'http://books.google.com/books/content?id=UcxWAAAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
            'Told with Baldwin''s characteristically unflinching honesty, this collection of illuminating, deeply felt essays examines topics ranging from race relations 
            in the United States to the role of the writer in society, and offers personal accounts of Richard Wright, Norman Mailer and other writers.',
            'favorites'
         )

