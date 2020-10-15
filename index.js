const express = require('express')
const app = express()
const port = 5000;
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;



const uri = `mongodb+srv://programmingHero:assignment10@cluster0.843ii.mongodb.net/creativeAgency?retryWrites=true&w=majority`;
require('dotenv').config()

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('clients'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

client.connect(err => {
  const clientCollection = client.db("creativeAgency").collection("client");
  
  app.post('/addClient', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const course = req.body.course;
    const detail = req.body.detail;
    const price = req.body.price;
    const filePath = `${__dirname}/clients/${file.name}`;

    file.mv(filePath, err => {
      if(err){
        console.log(err);
        res.status(500).send({msg: "Failed To Upload Image"})
    }
    });

    const newImg = fs.readFileSync(filePath);
    const encImg = newImg.toString('base64');

    const image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: new Buffer.from(encImg, 'base64')
    };

    // const newClient = {
    //   image: image,
    //   name: name,
    //   email: email,
    //   course: course,
    //   detail: detail,
    //   price: price
    // }
    // console.log(newClient);

    clientCollection.insertOne({name, email, image})
    .then(result => {
      fs.remove(filePath, error => {
        if(error){console.log(error)}
        res.send(result.insertedCount > 0)
      })
    });
  })


  // Get Datas from DB 
  app.get('/client-list', (req, res) => {
    clientCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
})

});


client.connect(err => {
  const reviewCollection = client.db("creativeAgency").collection("review");

  // Save Data into DB 
  app.post('/addReview', (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview)
        .then(result => {
            res.send(result.insertedCount > 0);
            console.log(result);
        })
})
})



// app.listen(process.env.PORT || port)
app.listen(port);