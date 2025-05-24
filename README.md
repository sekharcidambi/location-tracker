# 📍 Location Tracker App

A real-time location tracking application with sharing capabilities built with Next.js and Leaflet.

## ✨ Features

- 🎯 **Real-time GPS tracking** using browser Geolocation API
- 🗺️ **Interactive maps** with Leaflet (no API keys required)
- 🔗 **URL shortener** for easy link sharing
- 📱 **Responsive design** works on all devices
- 🔄 **Live updates** every 5 seconds for viewers
- 📊 **Analytics** with click tracking and distance calculation
- 🎨 **Modern UI** with shadcn/ui components

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/location-tracker-app.git
   cd location-tracker-app

   2. **Install dependencies**

```shellscript
npm install
```


3. **Run the development server**

```shellscript
npm run dev
```


4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)


## 🎮 How to Use

### For Trackers:

1. Open the app and configure your session name
2. Click "Start Tracking" and allow location permissions
3. Copy the generated short link
4. Share the link with others


### For Viewers:

1. Open the shared link
2. View real-time location on an interactive map
3. See tracking statistics and history


## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Maps**: Leaflet (OpenStreetMap)
- **Icons**: Lucide React
- **Storage**: localStorage (demo) - easily replaceable with database
- **Deployment**: Vercel-ready


## 📁 Project Structure

```plaintext
├── app/
│   ├── page.tsx              # Main tracker page
│   ├── map/[sessionId]/      # Map viewer page
│   ├── s/[shortCode]/        # Short URL redirect
│   └── admin/                # URL management
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── location-map.tsx      # Interactive map component
├── lib/
│   └── url-shortener.ts      # URL shortening logic
└── location-tracker.tsx     # Main tracker component
```

## 🔧 Configuration

### Environment Variables (Optional)

For production deployment, you might want to add:

```plaintext
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Database Integration

Currently uses localStorage for demo purposes. For production:

- Replace localStorage with Supabase/Firebase
- Add real-time subscriptions
- Implement user authentication


## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click


### Other Platforms

The app works on any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Maps powered by [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)


## 🔮 Future Enhancements

- Real-time database integration
- User authentication
- Geofencing alerts
- Route optimization
- Offline map support
- Mobile app version
