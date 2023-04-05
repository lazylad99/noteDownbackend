const express = require("express");
const router = express.Router();
const Notes = require("../models/notes");
const fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Getting all the notes using: POST "/api/notes/fetchNotes". Login required
router.get("/fetchNotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ userId: req.user.id });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});


// ROUTE 2: Adding new note using: POST "/api/notes/addNote". Login required
router.post(
  "/addNote",
  fetchuser,
  [
    body("title", "Enter a valid title!").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters!").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      // In case of errors, return Bad request along with errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        userId: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Updating an existing note using: PUT "/api/notes/updateNote". Login required
router.put("/updateNote/:id", fetchuser, async (req, res) => {
    try {
      const {title, description, tag} = req.body;

      // Create a newNote object
      const newNote = {};
      if(title){newNote.title = title};
      if(description){newNote.description = description};
      if(tag){newNote.tag = tag};

      //Find the note to be updated and update it 
      let note = await Notes.findById(req.params.id);
      if(!note){return res.status(404).send("Not Found")}

      if(note.userId.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
      }

      note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})

      res.json(note);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  });


// ROUTE 4: Deleting an existing note using: DELETE "/api/notes/deleteNote". Login required
router.delete("/deleteNote/:id", fetchuser, async (req, res) => {
    try {

      //Find the note to be deleted and delete it 
      let note = await Notes.findById(req.params.id);
      if(!note){return res.status(404).send("Not Found")}

      //Allow deletion if user is authorized
      if(note.userId.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
      }

      note = await Notes.findByIdAndDelete(req.params.id)
      res.json({"Success": "Note has been deleted"});

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  });

module.exports = router;
