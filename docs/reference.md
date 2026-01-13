# Customer Feedback Forms

A powerful, full-stack web application for creating, managing, and analyzing customer feedback forms. Built with Next.js 16, Supabase, and modern React patterns.

## Overview

Customer Feedback Forms is a SaaS-ready platform that allows businesses to create custom feedback forms, share them via public URLs or QR codes, and analyze responses with detailed analytics and charts. Perfect for coffee shops, restaurants, retail stores, or any business needing customer feedback.

## Key Features

### 🎯 Form Management
- **Create & Edit Forms**: Intuitive form builder with drag-and-drop support (prepared for future implementation)
- **Multiple Question Types**: 
  - Single Choice (radio buttons)
  - Multiple Choice (checkboxes)
  - Short Text (single-line responses)
  - Long Text (multi-line responses)
- **Draft & Publish**: Save forms as drafts and publish when ready
- **Form Templates**: Duplicate existing forms to create variations quickly
- **Form Settings**: Customize form colors, descriptions, and availability

### 📱 Public Form Sharing
- **Public URLs**: Shareable links for respondents (e.g., `your-domain.com/f/coffee-feedback`)
- **QR Code Generation**: Auto-generate QR codes linking to your form
- **Mobile Optimized**: Beautiful, responsive design for all devices
- **Emoji Badges**: Visual question types with emoji indicators
- **Response Tracking**: Track whether submissions came from QR codes or direct links

### 📊 Analytics Dashboard
- **Real-time Statistics**: 
  - Total responses count
  - QR vs web submission breakdown
  - Response rate tracking
- **Per-Question Analytics**:
  - Bar charts for choice-based questions
  - Response distribution visualization
  - Text response listings with pagination
- **Date Range Filtering**: Analyze responses within specific time periods
- **Source Filtering**: Filter by QR code or web submissions
- **Export Ready**: Data structured for easy export

### 🔐 Security & Authentication
- **Email/Password Auth**: Secure authentication with Supabase Auth
- **Email Verification**: Confirmation flow for account security
- **Row Level Security**: Database-level protection ensuring users only access their own data
- **Protected Routes**: Dashboard and form management pages require authentication

### 👥 User Management
- **User Profiles**: Store user information in the database
- **Form Ownership**: Clear ownership model for forms and responses
- **Multi-user Ready**: Architecture supports multiple users per organization (future feature)

## Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19.2**: Latest React with hooks and concurrent features
- **TailwindCSS 4**: Utility-first CSS framework
- **shadcn/ui**: Accessible, customizable UI components
- **Recharts**: React charting library for analytics
- **react-hook-form**: Efficient form handling
- **Zod**: TypeScript-first schema validation

### Backend & Database
- **Supabase**: PostgreSQL database with built-in auth
- **@supabase/ssr**: Server-side rendering utilities for Supabase
- **Row Level Security (RLS)**: Database-level access control

### Additional Libraries
- **qrcode**: QR code generation
- **sonner**: Toast notifications
- **date-fns**: Date manipulation and formatting
- **lucide-react**: Icon library

## Project Structure

```
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Authentication routes
│   │   ├── login/page.tsx           # Login page
│   │   ├── sign-up/page.tsx         # Sign up page
│   │   └── sign-up-success/page.tsx # Confirmation page
│   ├── dashboard/                    # Protected dashboard
│   │   ├── forms/                   # Form management
│   │   │   ├── page.tsx             # Form list
│   │   │   ├── new/page.tsx         # Create new form
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx    # Edit form
│   │   │       ├── analytics/page.tsx # View analytics
│   │   │       └── settings/page.tsx  # Form settings
│   │   └── layout.tsx               # Dashboard layout with nav
│   ├── f/[slug]/page.tsx            # Public form renderer
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
│
├── components/
│   ├── forms/                        # Form-related components
│   │   ├── form-builder.tsx         # Form editor component
│   │   ├── question-editor.tsx      # Question editing interface
│   │   ├── form-preview.tsx         # Live preview
│   │   ├── public-form-renderer.tsx # Public form display
│   │   ├── form-list-client.tsx     # Form management list
│   │   └── form-settings.tsx        # Settings interface
│   ├── analytics/
│   │   └── analytics-dashboard.tsx  # Analytics view
│   ├── dashboard-nav.tsx            # Navigation component
│   ├── theme-provider.tsx           # Theme configuration
│   └── ui/                          # shadcn/ui components
│
├── lib/
│   └── supabase/
│       ├── client.ts                # Browser-side Supabase client
│       └── server.ts                # Server-side Supabase client
│
├── scripts/
│   ├── 01_schema_and_rls.sql       # Database schema & RLS policies
│   └── 02_seed_data.sql            # Sample data (optional)
│
├── public/                           # Static assets
├── .env.local                        # Environment variables
└── package.json                      # Dependencies
```

## Database Schema

### Tables

**profiles**
- `id` (UUID): User ID from Supabase Auth
- `email` (text): User email
- `created_at` (timestamp): Account creation date
- `updated_at` (timestamp): Last update

**forms**
- `id` (UUID): Unique form identifier
- `user_id` (UUID): Form owner
- `title` (text): Form name
- `description` (text): Form description
- `slug` (text): URL-friendly form identifier
- `status` (enum): 'draft' or 'published'
- `color` (text): Theme color (hex)
- `created_at` (timestamp): Creation date
- `updated_at` (timestamp): Last modification

**form_questions**
- `id` (UUID): Unique question ID
- `form_id` (UUID): Associated form
- `order` (integer): Question display order
- `type` (enum): 'single_choice' | 'multiple_choice' | 'short_text' | 'long_text'
- `text` (text): Question content
- `required` (boolean): Is answer required?
- `options` (jsonb): Stored answer choices for choice questions
- `created_at` (timestamp)

**form_responses**
- `id` (UUID): Unique response ID
- `form_id` (UUID): Associated form
- `source` (enum): 'qr' or 'web' - tracking submission source
- `created_at` (timestamp): Submission time

**form_answers**
- `id` (UUID): Unique answer ID
- `response_id` (UUID): Associated response
- `question_id` (UUID): Associated question
- `answer` (text): User's answer
- `created_at` (timestamp)

### Row Level Security (RLS) Policies

All tables have RLS policies enforcing:
- Users can only view their own forms and responses
- Users cannot modify other users' data
- Public form endpoint has specific access for rendering

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone & Install**
   ```bash
   git clone <repository>
   cd customer-feedback-forms
   npm install
   ```

2. **Setup Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

3. **Initialize Database**
   - Run the SQL migration in Supabase dashboard:
   - Copy contents of `scripts/01_schema_and_rls.sql`
   - Paste into Supabase SQL Editor and execute
   - Optionally seed with `scripts/02_seed_data.sql`

4. **Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Change for production
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Usage Guide

### Creating Your First Form

1. **Sign Up**: Create an account with email and password
2. **Create Form**: Click "New Form" in dashboard
3. **Add Title**: Give your form a memorable name
4. **Add Questions**: 
   - Click "Add Question"
   - Select question type
   - Enter question text
   - Add answer options (for choice questions)
   - Mark as required if needed
5. **Preview**: See how it looks to respondents
6. **Publish**: Make the form live

### Sharing Your Form

1. **Copy Link**: Share the public URL directly
2. **Generate QR Code**: Click "QR Code" in form settings
3. **Download QR**: Save as PDF or image
4. **Track Sources**: Analytics show submissions from each source

### Analyzing Responses

1. **View Analytics**: Click "Analytics" on any published form
2. **Filter Data**: Select date range and submission source
3. **Review Responses**: Scroll through text answers
4. **Export**: Copy data for external analysis

## API Endpoints

### Generate QR Code PDF
```
POST /api/generate-qr-pdf
Body: { formId: string, formTitle: string, slug: string }
Returns: PDF with QR code and form URL
```

### Form Submission
```
POST /api/submit-form
Body: { formId: string, answers: [...], source: 'qr' | 'web' }
Returns: { success: boolean }
```

## Component Documentation

### FormBuilder
Main form editing interface with live preview. Handles creating/editing forms and managing questions.

### PublicFormRenderer
Renders published forms for respondents. Mobile-optimized with validation and submission handling.

### AnalyticsDashboard
Displays form statistics, per-question analytics, and response listings with filtering capabilities.

### QuestionEditor
Interface for adding/editing individual questions with type selection and validation setup.

## Deployment

### Deploy to Vercel

1. **Push to GitHub**: Connect your repository
2. **Import Project**: Select repository in Vercel dashboard
3. **Add Environment Variables**: Configure Supabase keys in Vercel project settings
4. **Deploy**: Vercel automatically builds and deploys on git push

```bash
# Preview deployment
npm run build && npm run start

# Set production URL in environment
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Security Considerations

- **Database Security**: RLS policies prevent unauthorized data access
- **Authentication**: Supabase Auth handles password hashing and session management
- **CORS**: Configured for Supabase origin
- **Environment Variables**: Never commit `.env.local` - use Vercel project settings
- **Rate Limiting**: Implement on form submission endpoint in production
- **Input Validation**: Zod schemas validate all user inputs

## Future Enhancements

- Drag-and-drop question reordering
- Custom email notifications for responses
- Team collaboration and sharing
- Advanced analytics (skip logic, conditional fields)
- Response webhooks
- Export to CSV/Excel
- Form branching/conditional logic
- Response notifications
- Password-protected forms
- CAPTCHA for spam prevention

## Troubleshooting

### "User not found" errors
- Ensure email is verified after signup
- Check that user exists in `profiles` table

### QR Code not generating
- Verify `NEXT_PUBLIC_BASE_URL` is set correctly
- Check that form slug is unique and URL-safe

### Analytics showing no data
- Ensure form is published
- Check response source is 'qr' or 'web'
- Verify date range selection

### Form submission fails
- Check RLS policies allow form_responses insert
- Verify form_id and question_ids are correct
- Ensure form is published

## Support & Contributing

For issues, questions, or feature requests:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Open an issue on GitHub

## License

MIT License - feel free to use for personal or commercial projects

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [React Hook Form Documentation](https://react-hook-form.com)

---

Built with ❤️ for businesses collecting customer feedback
