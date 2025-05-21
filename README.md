# Foot Pressure Medical Advisor

A modern web application built with Next.js that provides medical advice based on foot pressure analysis. This application uses advanced AI technology to analyze foot pressure data and provide personalized medical recommendations.

## Features

- Modern UI built with Next.js and Tailwind CSS
- Material UI components for enhanced user experience
- AI-powered medical analysis using Google's Generative AI
- Responsive design for all devices
- Dark/Light theme support
- Interactive data visualization with Recharts
- Form handling with React Hook Form and Zod validation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm (Package Manager)

## Getting Started

1. Clone the repository:
```bash
git clone [your-repository-url]
cd foot-pressure-medical-advisor
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
GOOGLE_AI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check code quality

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Material UI
  - Radix UI
  - Custom components
- **State Management**: React Hooks
- **Form Handling**: React Hook Form with Zod validation
- **Data Visualization**: Recharts
- **AI Integration**: Google Generative AI
- **Package Manager**: pnpm

## Project Structure

```
├── app/              # Next.js app directory
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── public/          # Static assets
├── styles/          # Global styles
└── utils/           # Helper functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 