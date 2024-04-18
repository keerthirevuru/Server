const express=require('express')
const router = express.Router()
const Fetchuser = require('../middleware/Fetchuser')
const Note = require('../models/Notes')
const { body, validationResult } = require('express-validator');

//Route 1:get all the notes using  get :"api/notes/fetchallnotes" log in required
router.get('/fetchallnotes',Fetchuser,async (req,res)=>{
    try
    {
        const notes = await Note.find({user:req.user.id})
        res.json(notes)
    }catch(error)
    {
        console.error(error.massage)
        res.status(500).send('Some error is there')
    }
   
})

//Route 2: add a new note using  post :"api/notes/addnote" log in required
router.post('/addnote',Fetchuser,[
     body('title','Enter a valid title').isLength({min:3}),
    body('dis').isLength({min:5})
],async (req,res)=>{
    try {
        
   
    const {title,dis,tag}=req.body
   //If there are errors, return bad request
  const error = validationResult(req);
  if(!error.isEmpty())
  {
      return res.status(400).json({error:error.array()});
  }
  const note = new Note({
      title,dis,tag,user:req.user.id

  })
  const savedNote=await note.save()
    res.json(savedNote)
}catch(error){
    console.error(error.massage)
    res.status(500).send('Some error is there')
}
})


//Route 3: update note  put :"api/notes/updatenote" log in required
router.put('/updatenote/:id',Fetchuser,async (req,res)=>{
    const {title,dis,tag}=req.body
    try {
        
    
    //create a new note obj
    const newNote={};
    if(title){newNote.title=title}
    if(dis){newNote.dis=dis}
    if(tag){newNote.tag=tag}

    // find the node to be updated and update it
    let note =await  Note.findById(req.params.id);
    if(!note)
    {
        res.status(404).send("not found")
    }
    if(note.user.toString()!==req.user.id)
    {
        return res.status(401).send("not allowed")
    }
    note = await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note})
} catch (error) {
    console.error(error.massage)
    res.status(500).send('Some error is there')
}
})

//Route 4: delete note  delete :"api/notes/deletenote" log in required
router.delete('/deletenote/:id',Fetchuser,async (req,res)=>{
    const {title,dis,tag}=req.body
    try {
        
   
    // find the node to be deleted and delete it
    let note =await  Note.findById(req.params.id);
    if(!note)
    {
        res.status(404).send("not found")
    }
    //allow deletion only if user owns this note
    if(note.user.toString()!==req.user.id)
    {
        return res.status(401).send("not allowed")
    }
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Success":"Note has been deleted",note:note})
} catch (error) {
        
}
})

module.exports=router