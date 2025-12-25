# MANDASTRONG STUDIO

The All-In-One Make-A-Movie Application

## Overview

MandaStrong Studio is a comprehensive movie creation platform featuring 720+ AI tools, professional editing capabilities, and an intuitive 21-page workflow. Built with React, TypeScript, Supabase, and Stripe integration.

## Features

### Core Functionality
- 21-page cinematic workflow
- 720 AI tools across 6 dedicated pages (120 tools per page)
- Complete video editing suite
- User authentication and subscription management
- Real-time AI assistant (Agent Grok)
- Media library and asset management
- Professional rendering and export
- Social media sharing integration

### Page Structure

**Page 0**: Intro screen with fade animation
**Page 1**: Home with video background and avatar
**Page 2**: Welcome message
**Page 3**: Login/Register with Stripe subscription plans
**Pages 4-9**: AI Tools Hub (720 tools total)
**Page 10**: Movie Library (admin uploads movies, users watch them)
**Page 11**: Editor Suite (professional video editing tools)
**Page 12**: Timeline Editor & Export
**Page 13**: Analytics Dashboard
**Page 14**: Settings & Preferences
**Page 15**: Tutorials & How-To Guides
**Page 16**: Community Showcase
**Page 17**: Marketplace & Templates
**Page 18**: Collaboration & Team
**Page 19**: Template Library
**Page 20**: Support & Help Center
**Page 21**: Profile & Pricing

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Payments**: Stripe (3 subscription tiers)
- **State Management**: React Context API

## Database Schema

### Tables
1. **subscriptions**: User subscription plans and payment status
2. **user_assets**: AI-generated and uploaded media files
3. **projects**: Video projects and render status
4. **tool_usage**: Tool interaction tracking

All tables have Row Level Security enabled with proper policies.

## Subscription Plans

- **Basic ($10/mo)**: 720p export, 5GB storage, AI tools access
- **Pro ($20/mo)**: 1080p export, 50GB storage, advanced AI tools
- **Studio ($30/mo)**: 4K export, unlimited storage, exclusive features

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Place video files in `public/static/video/`:
   - background.mp4
   - avatar.mp4
   - packageDTSBexpscript.mp4
   - thatsallfolks.mp4

5. Run development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── AIToolsPage.tsx       # Reusable AI tools page component
│   └── GrokChat.tsx           # Global AI assistant chat
├── contexts/
│   └── AuthContext.tsx        # Authentication state management
├── data/
│   └── aiTools.ts             # AI tools data generator
├── lib/
│   └── supabase.ts            # Supabase client configuration
├── pages/
│   ├── Page0.tsx - Page21.tsx # All 21 application pages
│   └── ...
├── App.tsx                    # Main app with routing
├── main.tsx                   # Application entry point
└── index.css                  # Global styles and animations
```

## Features by Page

### Authentication (Page 3)
- Email/password registration
- Secure login
- Automatic redirect to Stripe plans
- Session management

### AI Tools (Pages 4-9)
- 720 total tools across 6 pages
- Tool categories: Image, Video, Audio, Text generation
- Click to launch tool interface
- Auto-save to media library

### Movie Library (Page 10)
- Admin: Upload movies for all users to watch
- Users: Browse and watch uploaded movies
- Filter by genre, rating, and featured status
- Publish/unpublish control for admins
- Thumbnail and metadata management

### Editor Suite (Page 11)
- Professional-grade video editing platform
- Multi-track timeline with precision tools
- Audio mixer and color grading workspace
- Effects library with transitions and filters
- AI-powered enhancement tools
- Set custom movie duration (1-240 minutes)
- Media library integration

### Additional Features (Pages 12-21)
- Timeline editor with export capabilities
- Analytics and performance tracking
- Settings and user preferences
- Tutorials and documentation
- Community showcase and collaboration
- Template marketplace
- Support center and help resources

### Community (Page 19)
- Agent Grok AI assistant
- Community showcase
- Help center and FAQs
- Direct support access

## Agent Grok

Global AI assistant available after login on all pages:
- Click floating chat button (bottom-right)
- Ask questions about tools and features
- Get real-time guidance
- Minimize or close as needed

## Video Assets

Place these files in `public/static/video/`:

1. **background.mp4**: Looping background for pages 1-2
2. **avatar.mp4**: Avatar video with play button on page 1
3. **packageDTSBexpscript.mp4**: Main film "Doxy: The School Bully"
4. **thatsallfolks.mp4**: Closing credits video

## Stripe Integration

Configure Stripe checkout URLs in Page 3:
- Basic plan: ends with `00`
- Pro plan: ends with `01`
- Studio plan: ends with `02`

## Deployment

The application is production-ready. To deploy:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set environment variables on your host
4. Ensure Supabase and Stripe are configured

## Security

- Row Level Security (RLS) enabled on all database tables
- Authentication required for protected routes
- Secure API key handling
- HTTPS recommended for production

## Support

For issues or questions:
- Visit the Community page (Page 19)
- Use Agent Grok AI assistant
- Contact: MandaStrong1.Etsy.com

## Credits

Built by MandaStrong and the development team with passion for empowering creators worldwide.

## License

All rights reserved.
