# your hïghñëss - Community Chat Platform v1.0.7

A full-stack community platform featuring real-time chat, user authentication, and modern hacker-themed UI with WhatsApp Bot integration.

## Features

- 🔐 **User Authentication** - JWT-based login/registration system
- 💬 **Real-time Chat** - WebSocket-powered instant messaging
- 👤 **User Profiles** - Customizable avatars (32 emoji options), bio, and WhatsApp integration
- ⚡ **Message Reactions** - Like (👍), Heart (❤️), Fire (🔥) reactions
- 🎨 **Modern UI** - Black/White theme toggle with sleek design
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔗 **External Links** - Quick access to WhatsApp groups, GitHub, games, and tools
- 🤖 **Bot Integration** - Connected to yourhïghñëss WhatsApp Bot ecosystem

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **TanStack Query** for server state management
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **WebSocket** for real-time communication
- **JWT** authentication with bcrypt
- **JSON file storage** (no database required)

## Deployment on Render

### Quick Deploy

1. **Fork this repository**
2. **Create a new Web Service on [Render](https://render.com)**
3. **Connect your GitHub repository**
4. **Configure build settings:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** `Node`

### Environment Variables

Set these in Render's environment variables section:

```bash
NODE_ENV=production
PORT=10000  # Render automatically assigns this
```

### Build Configuration

The app is pre-configured for Render deployment:

- **Port Configuration:** Uses `process.env.PORT` or defaults to 5000
- **Static File Serving:** Express serves the built React app
- **Production Build:** Vite optimizes the frontend bundle

### Render Configuration Files

The repository includes:

- `package.json` with proper scripts for deployment
- Production-ready Express server setup
- Environment-based configuration switching
- Static file serving for the built React application

### Manual Deployment Steps

1. **Create Render Account:** Visit [render.com](https://render.com) and sign up
2. **New Web Service:** Click "New +" and select "Web Service"
3. **Connect Repository:** Link your GitHub account and select this repository
4. **Configure Settings:**
   - Name: `your-highness-chat`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: `Free` (or paid for better performance)

5. **Deploy:** Click "Create Web Service"

### Post-Deployment

- Your app will be available at `https://your-service-name.onrender.com`
- Free tier apps sleep after 15 minutes of inactivity
- First request after sleep may take 10-20 seconds to wake up
- For production use, consider upgrading to a paid plan

## Local Development

### Prerequisites
- Node.js v18+
- npm or yarn

### Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd your-highness-chat
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open browser:** Navigate to `http://localhost:5000`

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run preview` - Preview production build locally

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Route components
│   │   └── lib/           # Utilities and configurations
├── server/                # Express.js backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # JSON file storage
│   └── vite.ts           # Vite integration
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Data models and validation
└── README.md            # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send new message
- `POST /api/messages/:id/react` - React to message

### Users
- `GET /api/users/online` - Get online users
- `PUT /api/users/profile` - Update user profile
- `GET /api/avatars` - Get available avatars

### Statistics
- `GET /api/stats` - Get platform statistics

## WebSocket Events

- `new_message` - New chat message received
- `online_users_update` - User online status changed
- `reaction_update` - Message reaction updated
- `profile_update` - User profile updated

## Related Projects

- **WhatsApp Bot:** [yourhïghñëss Bot](https://github.com/horlapookie/WhisperRoyalty)
- **2048 Game:** [2048 Game](https://2048-git-master-horlapookie.vercel.app/)
- **Pairing Tool:** [WhatsApp Pairing](https://horlapair-olamilekans-projects-1c056653.vercel.app/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

- **GitHub Issues:** Report bugs and request features
- **WhatsApp Channel:** [Join our channel](https://whatsapp.com/channel/0029Vb6AZrY2f3EMgD8kRQ01)
- **WhatsApp Group:** [Chat with community](https://chat.whatsapp.com/GceMJ4DG4aW2n12dGrH20A)

---

Built with ❤️ by [@horlapookie](https://github.com/horlapookie)