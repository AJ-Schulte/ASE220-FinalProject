const express = require('express')
const fs=require('fs')
const jwt = require('jsonwebtoken');
const app = express()
app.use(express.json());
app.use(express.static('public'))
const port = 3000
const SECRET_KEY = 'aosufbogw9f203rteihbw109u21hr';

const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://tempuser:Password123@cluster0.yawcomh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

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
app.post('/users/createUser', async (req, res) => {
	try {
		const username = req.body.username;
		const email = req.body.email;
		const password = req.body.password;

	  if (!username || !email || !password) {
		return res.status(400).json({ error: "All fields are required" });
	  }
  
	  // Check if user already exists
	  const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
	  if (existingUser) {
		return res.status(409).json({ error: "Username or Email already in use" });
	  }
  
	  const newUser = { username, email, password }; 
	  const result = await usersCollection.insertOne(newUser);
  
	  res.status(201).json({ id: result.insertedId, username, email });
  
	} catch (error) {
	  console.error("Error creating user:", error);
	  res.status(500).json({ error: "Internal server error" });
	}
});
app.post('/decklists/newDecklist', async (req, res) => {
	try {
		const decklist = req.body.decklist;
		const username = req.body.username;
		const deckname = req.body.deckname;

	  if (!username || !decklist || !deckname) {
		return res.status(400).json({ error: "All fields are required" });
	  }
  
	  const existingDeck = await usersCollection.findOne({ deckname, username });
	  if (existingDeck) {
		return res.status(409).json({ error: "Already have a Deck under that name" });
	  }
  
	  const newDeck = { decklist, deckname, username }; 
	  const result = await decksCollection.insertOne(newDeck);
  
	  res.status(201).json({ id: result.insertedId, decklist, deckname, username });
  
	} catch (error) {
	  console.error("Error creating deck:", error);
	  res.status(500).json({ error: "Internal server error" });
	}
});
app.post('/login', async (req, res) => {
	const { username, password } = req.body;
  
	try {
	  const user = await usersCollection.findOne({ username });
  
	  if (!user) {
		return res.status(404).json({ error: 'User not found' });
	  }
  
	  if (user.password !== password) {
		return res.status(401).json({ error: 'Invalid password' });
	  }
  
	  const token = jwt.sign(
		{ username: user.username, email: user.email },
		SECRET_KEY,
		{ expiresIn: '14d' }
	  );
  
	  res.json({ message: 'Login successful', token });
	} catch (err) {
	  console.error('Login error:', err);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });


/* API GETS */
app.get('/users/:username', async (req, res) => {
	if (!usersCollection) {
	  return res.status(500).send('Database not initialized');
	}
  
	try {
	  const user = await usersCollection.findOne({ username: req.params.username });
  
	  if (user) {
		res.json(user);
	  } else {
		res.status(404).send('User not found');
	  }
	} catch (error) {
	  console.error('Error fetching user:', error);
	  res.status(500).send('Internal server error');
	}

});

app.get('/users/:username/decklists/:deckname', async (req, res) => {
	if (!decksCollection) {
		return res.status(500).send('Database not initialized');
	  }
	
	try {
		const deck = await decksCollection.findOne({ username: req.params.username, deckname: req.params.deckname });

		if (deck) {
			res.json(deck);
		} else {
			res.status(404).send('Deck not found');
		}
	} catch (error) {
		console.error('Error fetching user:', error);
		res.status(500).send('Internal server error');
	}

});
app.get('/users/:username/decklists', async (req, res) => {
	if (!decksCollection) {
		return res.status(500).send('Database not initialized');
	  }
	
	try {
		const deck = await decksCollection.find({ username: req.params.username }).toArray();

		if (deck) {
			res.json(deck);
		} else {
			res.status(404).send('Decklists not found');
		}
	} catch (error) {
		console.error('Error fetching user:', error);
		res.status(500).send('Internal server error');
	}

});
app.get('/cards', async (req, res) => {
	if(!cardsCollection) {
		return res.status(500).send('Database not initialized');
	}

	try {
		const cards = await cardsCollection.find().toArray();

		if(cards) {
			res.json(cards);
		} else {
			res.status(404).send('Cards not found');
		} 
	} catch (error) {
		console.error('Error fetching user:', error);
		res.status(500).send('Internal server error');
	}
})


/* API PUTS */
app.put('/users/:username', async (req, res) => {
	try {
	  const username = req.params.username;
	  const updateFields = req.body;
  
	  const result = await usersCollection.updateOne(
		{ username: username },          
		{ $set: updateFields }          
	  );
  
	  res.json({ message: "User updated", modifiedCount: result.modifiedCount });
	} catch (err) {
	  console.error("Error updating user:", err);
	  res.status(500).json({ error: "Internal server error" });
	}
});  
app.put('/users/:username/decklists/:deckname', async (req, res) => {
	try {
	  const username = req.params.username;
	  const deckname = req.params.deckname;
	  const updateFields = req.body;
  
	  const result = await decksCollection.updateOne(
		{ username: username, deckname: deckname },          
		{ $set: updateFields }          
	  );
  
	  res.json({ message: "Deck updated", modifiedCount: result.modifiedCount });
	} catch (err) {
	  console.error("Error updating user:", err);
	  res.status(500).json({ error: "Internal server error" });
	}
});  

/* API DELETE */
app.delete('/users/:username/decklists/:deckname', async (req, res)=> {
	try {
		const username = req.params.username;
		const deckname = req.params.deckname;
	
		const result = await decksCollection.deleteOne(
		  { username: username, deckname: deckname }        
		);
	
		res.json({ message: "Deck deleted", deletedCount: result.deletedCount });
	  } catch (err) {
		console.error("Error updating user:", err);
		res.status(500).json({ error: "Internal server error" });
	  }
})


/* Connect to Database */
client.connect()
  .then(() => {
    const db = client.db("deck-builder");
    usersCollection = db.collection("users");
	cardsCollection = db.collection("cards");
	decksCollection = db.collection("decks");
    console.log("Connected to MongoDB");
    
    app.listen(port, () => {
      console.log(`Server running at port ${port}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
  });