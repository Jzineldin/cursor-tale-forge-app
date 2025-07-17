// Analytics utility for tracking user interactions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackWaitlistSignup = (email: string) => {
  trackEvent('waitlist_signup', {
    'event_category': 'engagement',
    'event_label': 'email_waitlist',
    'value': 1,
    'email_domain': email.split('@')[1] // Track email domain for insights
  });
};

export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', {
    'event_category': 'engagement',
    'event_label': buttonName,
    'location': location,
    'value': 1
  });
};

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    'event_category': 'navigation',
    'event_label': pageName,
    'value': 1
  });
};

export const trackStoryCreation = (genre: string) => {
  trackEvent('story_creation_started', {
    'event_category': 'story_creation',
    'event_label': genre,
    'value': 1
  });
};

export const trackStoryCompleted = (genre: string, segmentCount: number) => {
  trackEvent('story_completed', {
    'event_category': 'story_creation',
    'event_label': genre,
    'value': segmentCount
  });
};

export const trackError = (errorMessage: string, location?: string) => {
  trackEvent('exception', {
    'description': errorMessage,
    'fatal': false,
    'location': location
  });
};

// Scroll tracking
export const initScrollTracking = () => {
  if (typeof window === 'undefined') return;

  let scrollPercentagesTracked = new Set<number>();

  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    // Track at 25%, 50%, 75%, and 100%
    const trackPoints = [25, 50, 75, 100];
    
    trackPoints.forEach(point => {
      if (scrollPercent >= point && !scrollPercentagesTracked.has(point)) {
        scrollPercentagesTracked.add(point);
        trackEvent('scroll', {
          'event_category': 'engagement',
          'event_label': `${point}%`,
          'value': point
        });
      }
    });
  });
};

// Button click tracking
export const initButtonTracking = () => {
  if (typeof window === 'undefined') return;

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button, a[role="button"], .btn');
    
    if (button) {
      const buttonText = button.textContent?.trim() || 'button';
      const buttonClass = button.className;
      
      trackButtonClick(buttonText, window.location.pathname);
    }
  });
};

// Initialize all tracking
export const initAnalytics = () => {
  initScrollTracking();
  initButtonTracking();
}; 