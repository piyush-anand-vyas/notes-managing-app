const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

//Route 1: Get all notes for a particular user. Login required
router.get("/getallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    res.json({ error: "Internal server error" });
  }
});

//Router 2: Create a new note. Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, description, tags } = req.body;
      const note = new Note({
        user: req.user.id,
        title,
        description,
        tags,
      });
      const notes = await note.save();
      res.json(notes);
    } catch (error) {
      res.json({ error: "Internal server error" });
    }
  }
);

//Router 3: Update an existing note. Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  let newNote = {};
  try {
  const { title, description, tags } = req.body;
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tags) {
    newNote.tags = tags;
  }

  let note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).send("Not found");
  }
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not authorized");
  }
  note = await Note.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json(note);
     
} catch (error) {
  res.json({ error: "Internal server error" });
}
});

//Router 4: Delete an existing note. Login required
router.delete('/deletenote/:id', fetchuser,async (req,res)=>{
  try {
  let note = await Note.findById(req.params.id);
  if(!note){
    res.send("Not found");
  }
  if(note.user.toString() !== req.user.id){
    res.send("Not authorized");
  }
  note = await Note.findByIdAndDelete(req.params.id);
  res.json({"Success":"Note deleted successfully", note: note});
   
} catch (error) {
  res.json({ error: "Internal server error" });
}

})


module.exports = router;
