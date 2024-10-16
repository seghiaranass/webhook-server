const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const PORT = 3055; // Choose an available port

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
    // Simple security check - only handle GitHub push events
    if (req.headers['x-github-event'] === 'push') {
        console.log('Received a push event from GitHub');

        // Execute the script to pull changes and restart containers
        exec('./update_script.sh', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing script: ${error}`);
                return res.status(500).send('Server error');
            }
            console.log(`Script output: ${stdout}`);
            res.status(200).send('Webhook received and processed');
        });
    } else {
        res.status(400).send('Unsupported event');
    }
});

app.listen(PORT, () => {
    console.log(`Webhook listener running on port ${PORT}`);
});
