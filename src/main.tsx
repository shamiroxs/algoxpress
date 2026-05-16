import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import { initializeAnalytics } from './analytics/posthog';
import { trackEvent } from './analytics/track';
import { AnalyticsEvents } from './analytics/events';

import { setupIdleTracking } from './analytics/idle';

// Initialize analytics BEFORE app render
initializeAnalytics();
setupIdleTracking();

// Emit gameplay session start
trackEvent(AnalyticsEvents.SESSION_STARTED, {
  category: 'exploration',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
