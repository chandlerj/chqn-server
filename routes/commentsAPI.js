var express = require("express");
var router = express.Router();
var db = require('../services/comments');


// GET route for retrieving all comments and their children
router.get('/', (req, res) => {
    try {
      // Query the database to retrieve all comments and their children
      const stmt = db.prepare(`
        SELECT 
          pc.id AS parent_comment_id,
          pc.ip_address AS parent_comment_ip_address,
          pc.title AS parent_comment_title,
          pc.date AS parent_comment_date,
          pc.body AS parent_comment_body,
          cc.id AS child_comment_id,
          cc.ip_address AS child_comment_ip_address,
          cc.date AS child_comment_date,
          cc.body AS child_comment_body
        FROM 
          parent_comments pc
        LEFT JOIN 
          child_comments cc ON pc.id = cc.parent_comment_id;
      `);
      const rows = stmt.all();

      // Group comments and their children
      const commentsMap = new Map();
      rows.forEach(row => {
        const parentId = row.parent_comment_id;
        if (!commentsMap.has(parentId)) {
          commentsMap.set(parentId, {
            id: parentId,
            ip_address: row.parent_comment_ip_address,
            title: row.parent_comment_title,
            date: row.parent_comment_date,
            body: row.parent_comment_body,
            children: []
          });
        }
        if (row.child_comment_id) {
          commentsMap.get(parentId).children.push({
            id: row.child_comment_id,
            ip_address: row.child_comment_ip_address,
            date: row.child_comment_date,
            body: row.child_comment_body
          });
        }
      });

      // Convert Map values to an array of comments
      const comments = Array.from(commentsMap.values());

      // Send the comments as JSON response
      res.json(comments);
    } catch (err) {
      console.error('Error retrieving comments:', err.message);
      res.status(500).send('Internal Server Error');
    }
    });

// POST route for creating a new parent comment
router.post('/makeparentcomment', (req, res) => {
    // Extract data from the request body
    const { title, body } = req.body;
    const ip_address = req.ip;
    const now = new Date();
    const date = now.toUTCString();

    if (body == ""){
        return res.status(400).send('No body included with comment')
    }
    if (title == ""){
        return res.status(400).send('No title included with comment')
    }

    // Insert the new parent comment into the database
    try {
        // Prepare the SQL statement
        const stmt = db.prepare('INSERT INTO parent_comments (ip_address, title, date, body) VALUES (?, ?, ?, ?)');
        
        // Execute the statement with the provided parameters
        stmt.run(ip_address, title, date, body);
        
        // Send a success response
        res.status(201).send('Parent comment created successfully');
    } catch (err) {
        console.error('Error inserting parent comment:', err.message);
        return res.status(500).send('Internal Server Error');
    }
    });

// POST route for creating a new child comment
router.post('/:parentId/children', (req, res) => {
    const { parentId } = req.params;
    const { body } = req.body;
    const ip_address = req.ip;
    const now = new Date();
    const date = now.toUTCString();

    try {
        // Prepare the SQL statement
        const stmt = db.prepare('INSERT INTO child_comments (parent_comment_id, ip_address, date, body) VALUES (?, ?, ?, ?)');
        
        // Execute the statement with the provided parameters
        stmt.run(parentId, ip_address, date, body);
        
        // Send a success response
        res.status(201).send('Child comment created successfully');
    } catch (err) {
        console.error('Error creating child comment:', err.message);
        return res.status(500).send('Internal Server Error');
    }
});
module.exports = router;
