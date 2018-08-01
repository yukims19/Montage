const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("montage.db");
db.serialize(() => {
  //customers table
  db.run(
    "CREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT, url TEXT, twitter TEXT, github TEXT, AvatarUrl TEXT, location TEXT, email TEXT)"
  );
  db.run(
    "INSERT INTO customers VALUES (1,'Youxi Li', 'http://yosili.com', 'yukims19', 'yukims19', 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png', 'San Diego, CA', 'yukims19@gmail.com')"
  );
  db.run(
    "INSERT INTO customers VALUES (2,'Sean Grove', 'http://www.riseos.com', 'sgrove', 'sgrove', 'https://pbs.twimg.com/profile_images/913444398133735427/7zjUK6pp_normal.jpg', 'San Francisco, CA', 'sgrove@gmail.com')"
  );

  console.log("successfully created the users_to_pets table in pets.db");
  db.each("SELECT * FROM customers", (err, row) => {
    console.log(row.name + ": " + row.url + " - " + row.twitter + row.github);
  });
  //votes table
  db.run("CREATE TABLE votes (uid NUM, pid NUM)");
  db.run("INSERT INTO votes VALUES (1 , 1)");
  db.run("INSERT INTO votes VALUES (2 , 2)");
  db.run("INSERT INTO votes VALUES (2 , 3)");

  db.each("SELECT * FROM votes", (err, row) => {
    console.log(row.pid + "," + row.uid);
  });

  //posts table
  db.run("create table posts(id INTEGER PRIMARY KEY,title TEXT)");
  db.run(
    "    insert into posts (title) values ('example1'), ('example2'), ('example3') "
  );
});

db.close();
