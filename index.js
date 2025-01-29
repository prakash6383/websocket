const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const wss = new WebSocket.Server({ port: 3002 });

wss.on("connection", (socket) => {
    socket.send("Welcome to the WebSocket server! You will receive real-time updates and a streaming paragraph.");

    socket.on("open", () => console.log("Connection Open"));

    const filePath = path.join(__dirname, "document.txt");
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            socket.send("Failed to load document");
            return;
        }
        const words = data.split(" ");
        let index = 0;
        let isStreaming = true;

        const streamParagraph = () => {
            if (index < words.length) {
                const word = words[index];
                socket.send(JSON.stringify({ type: "document", word }));
                index++;
                setTimeout(streamParagraph, 100);
            }
        };

        socket.on("message", (message) => {
            console.log(`Received from client: ${message}`);
            // if (!isStreaming) {
            //     isStreaming = true;
            // }
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.text.split(" ").map(value => value.toLowerCase()).includes('deepseek')) {
                streamParagraph();
            }
        });

        socket.on("close", () => {
            console.log(`Connection Closed`);
            isStreaming = false;
        });
    });
});

// const http = require('http');

// http.createServer((req, res) => {
//     if (req.url === '/events') {
//         res.writeHead(200, {
//             'content-type': 'text/event-stream',
//             'cache-control': 'no-cache',
//             'connection': 'keep-alive'
//         });

//         setInterval(() => {
//             res.write(`data: ${JSON.stringify({ message: 'Hello CLient' })}\n\n`)
//         }, 1000);
//     } else if (req.url === '/') {
//         const filePath = path.join(__dirname, 'index.html');
//         fs.readFile(filePath, (err, data) => {
//             if (err) {
//                 res.writeHead(500);
//                 res.end('Error loading index.html');
//             } else {
//                 res.writeHead(200, { 'Content-Type': 'text/html' });
//                 res.end(data);
//             }
//         });
//     } else {
//         res.writeHead(404);
//         res.end();
//     }
// }).listen(3001, () => console.log('Server running on http://localhost:3001'))