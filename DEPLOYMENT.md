# GODMODE ENHANCED - Deployment Guide

## 🚀 Vercel Deployment

### Prerequisites
1. GitHub account
2. Vercel account (free tier available)
3. Firebase project (for authentication)

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/d64483912-cmd/cuddly-system)

### Manual Deployment Steps

1. **Fork/Clone this repository**
   ```bash
   git clone https://github.com/d64483912-cmd/cuddly-system.git
   cd cuddly-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration
   - Optionally add OpenRouter API key for enhanced models

4. **Test locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

### Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | OpenRouter API Key | No |
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI API Key (legacy) | No |

### Features Included

✅ **OpenRouter Integration** - Access to 5+ free AI models  
✅ **Enhanced UI** - Modern, responsive design with dark theme  
✅ **Conversation History** - Save, export, and manage conversations  
✅ **Multiple AI Models** - Choose from various free and premium models  
✅ **Authentication** - Google/GitHub sign-in with Firebase  
✅ **Export/Import** - JSON export of conversation history  
✅ **Mobile Responsive** - Works perfectly on all devices  

### Free AI Models Available

- **Qwen 2.5 Coder 32B** - Advanced coding assistant
- **Llama 3.1 8B** - General purpose AI
- **Gemma 2 9B** - Google's efficient model
- **Mistral 7B** - Fast and capable
- **Phi-3 Mini** - Microsoft's compact model

### Support

For deployment issues or questions, please open an issue in the repository.