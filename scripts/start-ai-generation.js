/**
 * Script to start AI background generation
 * Run this script when the server starts to enable automatic generation
 * 
 * Usage:
 *   node scripts/start-ai-generation.js
 * 
 * Or add to package.json:
 *   "start:with-ai": "node scripts/start-ai-generation.js && next start"
 */

const http = require('http');

const PORT = process.env.PORT || 9002;
const API_KEY = process.env.AI_GENERATION_API_KEY || '';

function startAIGeneration() {
  const url = `http://localhost:${PORT}/api/ai/init-background`;
  
  const options = {
    method: 'GET',
    headers: API_KEY ? {
      'Authorization': `Bearer ${API_KEY}`
    } : {}
  };

  const req = http.request(url, options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log('✓ AI Background Generation Started:', result.message);
        } else {
          console.error('✗ Failed to start AI generation:', result.error || data);
        }
      } catch (error) {
        console.error('✗ Error parsing response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('✗ Error starting AI generation:', error.message);
    console.log('Note: Make sure the server is running on port', PORT);
  });

  req.end();
}

// Wait a bit for server to be ready, then start generation
setTimeout(() => {
  console.log('Initializing AI background generation...');
  startAIGeneration();
}, 5000); // Wait 5 seconds for server to start

console.log('AI generation startup script loaded. Will initialize in 5 seconds...');


