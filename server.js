// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid'); // Assuming this is a valid UUID generator
const database = require("./db/db.json"); // Make sure this import is used somewhere or remove it

// Set up the Express app
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define routes
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, './public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received to get notes`);

  // Read data from the JSON file and send it as a response
  fs.readFile("./db/db.json", 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.post('/api/notes', (req, res) => {
  console.log(`${req.method} request received to add note`);

  const { title, text } = req.body;

  // Check if both title and text are provided
  if (title && text) {
    // Create a new note object
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    // Read existing data, append the new note, and write it back to the file
    fs.readFile("./db/db.json", 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(newNote);

        fs.writeFile(`./db/db.json`, JSON.stringify(parsedData, null, 4), (writeErr) =>
          writeErr ? console.error(writeErr) : console.info("Successfully updated notes!")
        );
      }
    });

    // Send a success response with the new note
    const response = {
      status: 'success!',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    // Send an error response if title or text is missing
    res.status(500).json('Error in posting note');
  }
});

app.delete("/api/notes/:id", function(req, res) {
  const noteID = req.params.id;
  console.log(noteID);

  // Read data, filter out the note with the given ID, and write back to the file
  fs.readFile(path.join(__dirname, "./db/db.json"), (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    const notesArray = notes.filter(item => {
      return item.id !== noteID;
    });
    fs.writeFile('./db/db.json', JSON.stringify(notesArray, null, 4), (err, data) => {
      console.log("Delete");
      if (err) throw err; 
      res.json(notesArray);
    });
  });
});

// Catch-all route to serve the index.html for any other route
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, "./public/index.html"))
);

// Start the server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
