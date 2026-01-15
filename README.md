# EasyFX - International Money Transfer Application

A simplified frontend application for international money transfers, built as an assignment to demonstrate React fundamentals, state management, and handling of asynchronous flows.

## Assignment Overview

This application implements a complete money transfer flow that includes:

1. **Getting an FX quote** with expiry
2. **Confirming the transaction**
3. **Processing payment**
4. **Tracking transaction status** until settlement

## Features

### 1. Quote Screen

- User selects source currency, destination currency, and amount
- Click "Get Quote" to retrieve FX rate, fees, and total payable
- **30-second quote expiry timer** with visible countdown
- "Continue" button is **disabled when quote expires**
- "Refetch Quote" button to get a fresh quote
- Form validation (currencies must differ, amount > 0)

### 2. Confirm and Pay

- Displays all quote details for user confirmation
- Click "Pay" to submit payment request
- **Double submission prevention** (button disabled during processing)
- Clear loading states ("Processing Payment...")
- **Graceful network failure handling** with retry capability
- Success navigation to transaction status page

### 3. Transaction Status

- Displays transaction status: **Processing → Sent → Settled/Failed**
- **Asynchronous status updates** via polling (every 2.5 seconds)
- Status indicators with icons and color coding
- **Never shows misleading states** - UI always reflects backend truth
- **Retry action** for failed transactions (automatically refetches quote)
- **Contact Support** option for failures
- Polling automatically stops at final states (SETTLED/FAILED)

## Tech Stack

- **React 19** with TypeScript
- **React Router v7** for navigation
- **useReducer + Context API** for state management
- **Shadcn/ui** components (Card, Button, Input, Select, Skeleton)
- **Sonner** for toast notifications
- **Lucide React** for icons
- **Tailwind CSS** for styling
- **Vite** as build tool

## Project Structure

```
src/
├── api.ts                    # Mock API functions (getQuote, pay, getTransactionStatus)
├── App.tsx                   # Root component with layout
├── main.tsx                  # Entry point with router configuration
├── utils.ts                  # Utility functions and constants
├── components/
│   ├── quote.tsx            # Quote form component
│   ├── quoteResponse.tsx    # Quote details display with countdown
│   ├── pay.tsx              # Payment confirmation component
│   ├── transactionStatus.tsx  # Transaction status with polling
│   ├── Navigation.tsx        # Global navigation bar
│   └── ui/                  # Shadcn/ui components
├── context/
│   └── AppContext.tsx       # Global state management (useReducer + Context)
├── pages/
│   ├── QuotePage.tsx        # Route wrapper for quote
│   ├── QuoteResponsePage.tsx  # Route wrapper for quote response
│   ├── PaymentPage.tsx     # Route wrapper for payment
│   └── TransactionPage.tsx # Route wrapper for transaction status
├── types/
│   ├── quotes.ts           # Quote and QuoteResponse types
│   ├── paymentRequest.ts   # PaymentRequest type
│   └── transaction.ts      # Transaction type
└── data/
    └── currencyMaster.ts   # Currency data with FX rate ranges
```

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **pnpm** (or npm/yarn)

### Installation

1. **Clone or download the repository**

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

   or

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   pnpm dev
   ```

   or

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

## Key Design Decisions

### 1. State Management: useReducer + Context API

**Decision:** Used `useReducer` with React Context instead of multiple `useState` hooks or external libraries.

**Rationale:**

- Centralized state management reduces prop drilling
- Predictable state updates through reducer pattern
- Easy to debug with action-based state changes
- No external dependencies needed
- Scales well for this application size

**Trade-off:** For larger applications, Redux or Zustand might be more appropriate, but for this scope, Context + useReducer is optimal.

### 2. Routing: React Router v7

**Decision:** Implemented route-based navigation instead of conditional rendering.

**Rationale:**

- Better URL structure (`/quote`, `/pay`, `/transaction/:id`)
- Users can bookmark/share specific pages
- Browser back/forward buttons work correctly
- Clear separation of concerns (pages vs components)
- Route guards prevent invalid state access

**Trade-off:** Slightly more setup, but provides better UX and maintainability.

### 3. Polling for Transaction Status

**Decision:** Used polling (2.5s interval) instead of WebSockets or Server-Sent Events.

**Rationale:**

- Simpler implementation (no WebSocket server needed)
- Works with mock APIs
- Easy to control polling lifecycle (start/stop)
- Automatically stops at final states to reduce unnecessary calls
- Assignment explicitly mentioned "polling is fine"

**Trade-off:** WebSockets would be more efficient in production, but polling is sufficient for this use case.

### 4. Quote Expiry: Client-Side Validation

**Decision:** Disabled "Continue" button when countdown reaches 0, but no server-side validation.

**Rationale:**

- UI prevents user from proceeding with expired quote
- Simpler mock API implementation
- Assignment requirement was to "disable Continue when quote expires" (UI-level)

**Trade-off:** Production would need server-side validation, but for this assignment, UI prevention is sufficient.

### 5. Error Handling Strategy

**Decision:** Comprehensive error handling at each async operation with user-friendly messages.

**Rationale:**

- Network errors detected and displayed clearly
- Timeout errors handled separately
- Error states allow retry (reset submission flags)
- Toast notifications for immediate feedback
- Console logging for debugging

**Trade-off:** Could add retry with exponential backoff, but current implementation handles failures gracefully.

### 6. Double Submission Prevention

**Decision:** Used `isSubmitted` flag combined with `isLoading` state.

**Rationale:**

- Prevents accidental double-clicks
- Button disabled during processing
- Early return in handler prevents duplicate API calls
- State reset on error allows retry

**Trade-off:** Could use debouncing, but flag-based approach is clearer and more explicit.

### 7. Component Structure

**Decision:** Separated page components (route wrappers) from feature components.

**Rationale:**

- Pages handle routing logic and guards
- Components are reusable and testable
- Clear separation of concerns
- Easy to add new routes or modify existing ones

**Trade-off:** Slightly more files, but better organization and maintainability.

## Mock API Implementation

The application uses in-memory mock APIs that simulate:

- **API delays** (1 second) for realistic UX
- **Quote expiry** (30 seconds from creation)
- **Transaction status progression** based on elapsed time:
  - 0-10 seconds: PROCESSING
  - 10-25 seconds: SENT
  - 25+ seconds: SETTLED (90% chance) or FAILED (10% chance)
- **In-memory transaction store** (Map) to persist transactions

All APIs are in `src/api.ts` and can be easily replaced with real API calls.

## Running the Application

1. Start the dev server: `pnpm dev`
2. Navigate to `http://localhost:5173`
3. Select currencies and amount, click "Get Quote"
4. Review quote details (watch the countdown timer)
5. Click "Continue" (disabled if quote expired)
6. Confirm payment details and click "Pay"
7. View transaction status with automatic updates
8. For failed transactions, use "Try Again" or "Contact Support"

## Notes

- The application uses mock APIs - no backend server required
- All transactions are stored in memory (lost on page refresh)
- FX rates are randomly generated within defined ranges for each currency
- Quote expiry is 30 seconds from creation
- Transaction status progression is time-based (simulated)

## License

This project was created as an assignment submission.
