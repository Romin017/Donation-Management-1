Folder	Purpose
routes/	Defines URL endpoints — "what URL maps to what function"
controllers/	The actual logic that runs when a route is hit
models/	Database schemas/structure
middlewares/	Functions that run before your route (auth, logging, validation)
config/	DB connection, env setup, constants
app.js	Sets up Express app, middleware, routes
server.js	Actually starts the server (separate from app.js so you can test app.js without starting a real server)