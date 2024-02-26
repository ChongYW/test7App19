const LogEntries = require('../models/logEntriesModel');

const logEntries = async (req, res, next) => {
    if (req.isAuthenticated()) {
        const userId = req.user._id || null;

        let action;
        if (req.method === 'POST') {
            // Check for form submission success (adjust based on your application's form validation logic)
            const isFormSubmissionSuccessful = res.statusCode = 200 || res.statusCode < 201;/* Add your logic to check form submission success */

            if (isFormSubmissionSuccessful) {
                // Dynamically determine action from the URL for POST requests
                const match = req.url.match(/\/([^\/]+)\/?$/);
                if (match) {
                    const lastSegment = match[1].toLowerCase();
                    if (lastSegment.includes('create')) {
                        action = 'create';
                    }
                }
                // Default to "update" for POST requests without "create" in the URL
                action = action || 'update';
            } else {
                // Skip logging if form submission is not successful
                action = null;
            }
        }

        if (action) {
            let logEntry = {
                user: userId,
                method: req.method,
                url: req.url,
                action: action || 'unknown',
            };

            if (req.method === 'POST') {
                if (req.body) {
                    // Conditionally mask the "password" field
                    const sanitizedBody = { ...req.body };
                    if (sanitizedBody.password !== undefined) {
                        sanitizedBody.password = '*** MASKED ***';
                    }

                    logEntry = {
                        ...logEntry,
                        updatedFields: Object.keys(sanitizedBody),
                        updatedData: sanitizedBody,
                    };
                }
            }

            // Save log entry to MongoDB
            await LogEntries.create(logEntry);
        }
    }

    next();
};

module.exports = {
    logEntries
};
