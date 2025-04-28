const express = require('express')
const fs=require('fs')

const app = express()
app.use(express.json());
app.use(express.static('public'))
const port = 3000

const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://tempuser:Password123@cluster0.yawcomh.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


/* HTML ENDPOINTS */
app.get('/', (req, res)=> {
	res.send(fs.readFileSync('./public/index.html','utf8'));
})

app.get('/mydecks', (req, res)=> {
	res.send(fs.readFileSync('./public/mydecks.html', 'utf8'));
})

app.get('/login', (req, res)=> {
	res.send(fs.readFileSync('./public/login.html', 'utf8'));
})


/* API ENDPOINTS */
/* API POST */
app.post('/api/createUser', (req, res)=> {
	let filename=(new Date()).toISOString().replace(/[^a-zA-Z0-9]/g,'')
	let content=req.body;
	fs.writeFileSync(`./data/${filename}.json`,JSON.stringify(content));
	
    res.setHeader('filename',filename);
	res.json(content);
})

/* API GETS */
app.get('/users/:username', (req, res)=> {
	let content=fs.existsSync(`./data/${req.params.documentid}.json`) ? JSON.parse(fs.readFileSync(`./data/${req.params.documentid}.json`,'utf8')) : {}
	res.json(content);
})


/* API PUTS */
app.put('/api/:documentid', (req, res)=> {
	let content=req.body
	fs.writeFileSync(`./data/${req.params.documentid}.json`,JSON.stringify(content));
	res.json(content);
})

/* API DELETE */
app.delete('/api/:documentid', (req, res)=> {
	if(fs.existsSync(`./data/${req.params.documentid}.json`)) fs.unlinkSync(`./data/${req.params.documentid}.json`)
	res.json({message:'data deleted'});
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

