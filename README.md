# Momentum Lite

A minimal, high-performance habit tracker with a GitHub-inspired aesthetic. Built with Next.js 16 and Supabase.

## Features

- **GitHub-Style Heatmap**: Visualize a full year of habit completions at a glance.
- **Weekly Progress Charts**: Track your consistency over the last 7 days with interactive charts.
- **Minimalist Management**: Create, edit, and toggle habits with a clean, ultra-responsive interface.
- **Secure Authentication**: Robust auth system powered by Supabase with email verification and reCAPTCHA protection.
- **Premium UI**: Modern glassmorphic design system using Tailwind CSS 4 and Radix UI primitives.
- **Dynamic Layout**: Sticky sidebar with intelligent scrolling and mobile-optimized navigation.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS)
- `pnpm` (recommended) or `npm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ArtishGH/momentum-lite.git
   cd momentum-lite
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase and reCAPTCHA credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   pnpm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
