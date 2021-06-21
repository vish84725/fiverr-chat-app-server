"use strict"
const express = require('express');
const router = express.Router();
const passport = require('passport');
const conversation = require('../models/conversation')
const message = require('../models/message')

router.get('/' ,passport.authenticate('jwt', {session:false}), (req, res, next) => {  
    // Only return one message from each conversation to display as snippet
    conversation.find({ participants: req.user._id })
      .select('_id')
      .exec(function(err, conversations) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }
  
        // Set up empty array to hold conversations + most recent message
        let fullConversations = [];
        conversations.forEach(function(conversation) { //applies this function on every conversation item
          message.find({ 'conversationId': conversation._id })
            .sort('-createdAt')
            .limit(1)
            .populate({
              path: "author",
              select: "name"
            })
            .exec(function(err, message) {
              if (err) {
                res.send({ error: err });
                return next(err);
              }
              fullConversations.push(message);
              if(fullConversations.length === conversations.length) {
                return res.status(200).json({ conversations: fullConversations });
              }
            });
        });
    });
  });



//get list of messages in chat
router.get('/:conversationId', passport.authenticate('jwt', {session:false}),(req, res, next) => {
    message.find({ conversationId: req.params.conversationId })
        .select('createdAt body author')
        .sort('-createdAt')
        .populate({
            path: 'author',
            select: 'name username'
        })
        .exec(function (err, messages) {
            if (err) {
                res.send({ error: err });
                return next(err);
            }

            res.status(200).json({ conversation: messages });
        });
});


//Checks to see if conversation containing two users is in db
router.get('/find/:recipient',passport.authenticate('jwt', {session:false}), (req, res, next) => {
    
    conversation.findOne({ participants: { $all: [req.user._id,req.params.recipient]}})
    .populate({
        path: 'participants',
        select: 'name username email'
    })
    .exec(function (err, conversations) {
        if(conversations) {
        res.status(200).json({ 
            isPresent: true,
            message: "Found the conversation! ",
            conversationId : conversations._id, participants : conversations.participants 
            });
            return next();
        } else {
        res.status(200).json({ 
        isPresent: false,
        message: "CONVERSATION NOT FOUND ",
        });
        return next();
    }
    });
});


// start new Chat
router.get('/new/:recipient',passport.authenticate('jwt', {session:false}), (req, res, next) => {


    const Aconversation = new conversation({
        participants: [req.user._id, req.params.recipient]
    });

    Aconversation.save(function (err, newConversation) {
        if(err) {
            res.send({ error: err });
            return next(err);
        }
      res.status(200).json({ message: 'Conversation started!', conversationId: newConversation._id});
      return next();
        });
      });
    //});
  




    //send reply
    router.post('/:conversationId',passport.authenticate('jwt', {session:false}), (req, res, next) => {
        console.log(req.body);
        const reply = new message({
            conversationId: req.params.conversationId,
            body: req.body.text,
            author: req.user._id
        });

        reply.save(function(err, sentReply) {
            if(err) {
                res.send({ error: err});
                return next(err);
            }

            res.status(200).json({ message: 'Reply successfully sent! ', reply : req.body.text });
            return(next);
        });

    });




    router.post('/from/:recipient',passport.authenticate('jwt', {session:false}), (req, res, next) => {
        let isPresent;
        let foundChat;

        function isPresentFunction( conversation, callback) {
            conversation.findOne({ participants: [req.user._id,req.params.recipient]})
            .populate({
                path: 'participants',
                select: 'name username email'
            })
            .exec(function (err, conversations) {
            if(conversations === null) {
                isPresent = false;
            } else {
                isPresent = true;
                foundChat = conversations;    

            }
            console.log("isPresent value inside findOne " + isPresent);
            /*res.status(200).json({ message: "Found the conversation! ",
            conversationId : conversations._id, participants : conversations.participants });
            return(next);*/
            callback();
            });
        }
        
        
        isPresentFunction(conversation, () => {
            console.log("isPresent value outside findOne " + isPresent);

            if(isPresent === true) {
                console.log("Found the conversation ! ");
                console.log(foundChat);
                res.status(200).json({ message: "Found the conversation! ",
                conversationId : foundChat._id, participants : foundChat.participants });
                return(next);
            }
            else {
                console.log(" NO CONVERSATION FOUND ! ");
                res.status(404).json({ message: "NO CONVERSATION FOUND", });
                return(next);
            }
        })
     });


    module.exports = router;