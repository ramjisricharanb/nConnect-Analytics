#!/bin/bash
cd "$(dirname "$0")"

# Find an available port starting from 8000
PORT=8000
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; do
    let PORT=PORT+1
done

# Start Python HTTP server in the background
python3 -m http.server $PORT &
SERVER_PID=$!

echo "Starting local server on port $PORT..."
sleep 1

# Open the dashboard in the default browser (likely Chrome/Safari)
open "http://localhost:$PORT/index.html"

echo "Dashboard is running. You can now edit Excel files and simply hit Refresh in your browser!"
echo "Keep this window open. When you are done, close this terminal window to stop the server."

# Wait for process so the script doesn't exit immediately, keeping the server alive
wait $SERVER_PID
