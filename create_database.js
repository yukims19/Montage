const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("montage.db");
db.serialize(() => {
  //customers table
  db.run(
    "CREATE TABLE people (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, url TEXT, twitter TEXT, github TEXT, AvatarUrl TEXT, location TEXT, email TEXT, producthunt_id TEXT, CONSTRAINT con_emp_name_unique UNIQUE (name, url, twitter, github, AvatarUrl, location, email));"
  );

  //votes table
  db.run("CREATE TABLE votes (uid NUM, pid NUM)");

  //posts table
  db.run(
    "create table posts(id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT, cursor TEXT, CONSTRAINT unique_slug UNIQUE(slug))"
  );
  console.log("successfully created the tables");
});

db.close();
