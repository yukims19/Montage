const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("customers.db");
db.serialize(() => {
  // create a new database table:
  db.run(
    "CREATE TABLE customers (name TEXT, url TEXT, twitter TEXT, github TEXT, tiwtterAvatarUrl TEXT, location TEXT)"
  );

  // insert 3 rows of data:
  db.run(
    "INSERT INTO customers VALUES ('Youxi Li', 'http://yosili.com', 'yukims19', 'yukims19', 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png', 'San Diego, CA')"
  );
  db.run(
    "INSERT INTO customers VALUES ('Sean Grove', 'http://www.riseos.com', 'sgrove', 'sgrove', 'https://pbs.twimg.com/profile_images/913444398133735427/7zjUK6pp_normal.jpg', 'San Francisco, CA')"
  );

  console.log("successfully created the users_to_pets table in pets.db");

  // print them out to confirm their contents:
  db.each("SELECT * FROM customers", (err, row) => {
    console.log(row.name + ": " + row.url + " - " + row.twitter + row.github);
  });
});

db.close();
