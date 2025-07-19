// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:8082/',
        'http://localhost:8082/create',
        'http://localhost:8082/my-stories',
        'http://localhost:8082/story/63'
      ],
      startServerCommand: 'npm run dev',
      numberOfRuns: 2,           // quick stats
      chromeFlags: ['--headless=new', '--disable-gpu']
    },
    upload: {
      target: 'temporary-public-storage'
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }]
      }
    }
  }
}; 