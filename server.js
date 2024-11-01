const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const winston = require('winston');

const app = express();
const PORT = 3055;

// Configure the Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'webhook.log' }) // Log file named 'webhook.log'
    ]
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Webhook endpoint
app.post('/pull_request', (req, res) => {
    const eventType = req.headers['x-github-event'];

    if (eventType === 'pull_request') {
        const action = req.body.action;
        const isMerged = req.body.pull_request.merged;

        // Check if the pull request has been merged
        if (action === 'closed' && isMerged) {
            logger.info('Received a pull request merged event from GitHub');

            // Respond to GitHub immediately
            res.status(200).send('Pull request merge event received.');

            // Execute the script asynchronously
            exec('./update_script.sh', (error, stdout, stderr) => {
                if (error) {
                    logger.error(`Error executing merged script: ${error.message}`);
                    logger.error(`stderr: ${stderr}`);
                } else {
                    logger.info(`Merged script output: ${stdout}`);
                }
            });
        } else {
            logger.info('Pull request event ignored (not a merge).');
            res.status(200).send('Pull request event ignored (not a merge).');
        }
    } else {
        logger.warn(`Unsupported event: ${eventType}`);
        res.status(400).send('Unsupported event');
    }
});

app.listen(PORT, () => {
    logger.info(`Webhook listener running on port ${PORT}`);
});
