## Social Media AI Response System MVP

### Features
- 🤖 Local LLM processing with Ollama
- 📱 Facebook Page & WhatsApp Business webhooks
- ⚡ Redis-based message queuing with BullMQ
- 🎯 Automatic response generation with confidence scoring
- 👨‍💼 Human approval workflow for low-confidence responses
- 📊 Dashboard for message management

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment variables:**
Copy `.env.example` to `.env` and fill in your credentials

3. **Start Redis:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

4. **Start Ollama:**
```bash
ollama serve
ollama pull llama2  # or your preferred model
```

5. **Start the application:**
```bash
# Terminal 1: Main server
npm run dev

# Terminal 2: Worker process
npm run worker
```

### API Endpoints

- `POST /webhooks/facebook` - Facebook webhook
- `POST /webhooks/whatsapp` - WhatsApp webhook
- `GET /dashboard/messages` - Get messages for review
- `POST /dashboard/messages/:id/approve` - Approve and send message
- `POST /dashboard/messages/:id/reject` - Reject message
- `POST /dashboard/messages/:id/edit` - Edit and send message

### Architecture

```
Webhook → Queue → AI Analysis → Auto-send (high confidence) | Human Review (low confidence)
```

### Next Steps
- Add proper database (PostgreSQL/MongoDB)
- Build React dashboard UI
- Add conversation context/memory
- Implement message templates
- Add analytics and reporting
- Scale with Docker containers