const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true";
const dbName = "demo";

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

// to figure out what catImageUrl is so I don't get an error on page load
app.get('/', async (req, res) => {
  try {
    const messages = await db.collection('messages').find().toArray();
    const currentCat = await db.collection('currentCatImage').findOne({});

    res.render('index.ejs', {
      messages,
      catImageUrl: currentCat?.catImageUrl || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

// 2nd get route to handle the current cat image - reference fetchCatImage() in main.js file
app.get('/current-cat', (req, res) => {
  db.collection('currentCatImage').findOne({}, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result || {});
  });
});

app.post('/messages', (req, res) => {
  const { name, msg } = req.body;
  db.collection('messages').insertOne({
    name,
    msg
  }, (err, result) => {
    if (err) return console.log(err);
    console.log('saved to database');
    res.redirect('/');
  });
});

app.post('/current-cat', (req, res) => {
  const { catImageUrl } = req.body;
  db.collection('currentCatImage').updateOne(
    {},
    { $set: { catImageUrl } },
    { upsert: true }, // create it if it doesn't exist
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('Cat image updated');
    }
  );
});

// // Updated endpoints so they don't share same name
// app.put('/messages/upvote', (req, res) => {
//   db.collection('messages')
//   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
//     $inc: { thumbUp: 1 }
//   }, {
//     // In descending order, grab first match in the database if there are identical things with same values (name, message, likes)
//     sort: {_id: -1},
//     // true = if value does not exist, create it in the database
//     upsert: true
//   }, (err, result) => {
//     if (err) return res.send(err)
//     res.send(result)
//   })
// })

// Updated endpoints so they don't share same name
// app.put('/messages/downvote', (req, res) => {
//   db.collection('messages')
//   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
//    $inc: { thumbUp: -1 }
//   }, {
//     sort: {_id: -1},
//     upsert: true
//   }, (err, result) => {
//     if (err) return res.send(err)
//     res.send(result)
//   })
// })

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
