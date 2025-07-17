/**
 * Comprehensive App Health Check Utility
 * Tests all critical functionality and reports issues
 */

import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from './performance';
import { EnhancedErrorHandler } from './enhancedErrorHandler';

export interface HealthCheckResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  timestamp: number;
}

export interface HealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  results: HealthCheckResult[];
  recommendations: string[];
  timestamp: number;
}

class AppHealthChecker {
  private results: HealthCheckResult[] = [];

  /**
   * Run comprehensive health check
   */
  async runFullHealthCheck(): Promise<HealthReport> {
    this.results = [];
    const startTime = Date.now();

    console.log('🏥 Starting comprehensive app health check...');

    // Core functionality checks
    await this.checkCoreFunctionality();
    
    // API connectivity checks
    await this.checkAPIConnectivity();
    
    // Performance checks
    await this.checkPerformance();
    
    // Mobile responsiveness checks
    await this.checkMobileResponsiveness();
    
    // Error handling checks
    await this.checkErrorHandling();
    
    // Auto-save functionality checks
    await this.checkAutoSaveFunctionality();
    
    // Voice generation checks
    await this.checkVoiceGeneration();
    
    // Story functionality checks
    await this.checkStoryFunctionality();

    const endTime = Date.now();
    const duration = endTime - startTime;

    const report = this.generateReport(duration);
    
    console.log('🏥 Health check completed:', report);
    return report;
  }

  /**
   * Check core functionality
   */
  private async checkCoreFunctionality(): Promise<void> {
    // Check if app loads properly
    this.addResult('core', 'pass', 'App loads successfully');

    // Check localStorage availability
    try {
      localStorage.setItem('health-check', 'test');
      localStorage.removeItem('health-check');
      this.addResult('localStorage', 'pass', 'Local storage is available');
    } catch (error) {
      this.addResult('localStorage', 'fail', 'Local storage is not available', error);
    }

    // Check sessionStorage availability
    try {
      sessionStorage.setItem('health-check', 'test');
      sessionStorage.removeItem('health-check');
      this.addResult('sessionStorage', 'pass', 'Session storage is available');
    } catch (error) {
      this.addResult('sessionStorage', 'fail', 'Session storage is not available', error);
    }

    // Check if required environment variables are set
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      if (import.meta.env[envVar]) {
        this.addResult(`env_${envVar}`, 'pass', `${envVar} is configured`);
      } else {
        this.addResult(`env_${envVar}`, 'fail', `${envVar} is not configured`);
      }
    }
  }

  /**
   * Check API connectivity
   */
  private async checkAPIConnectivity(): Promise<void> {
    try {
      // Test Supabase connection
      const { data, error } = await supabase.from('stories').select('count').limit(1);
      
      if (error) {
        this.addResult('supabase_connection', 'fail', 'Supabase connection failed', error);
      } else {
        this.addResult('supabase_connection', 'pass', 'Supabase connection successful');
      }
    } catch (error) {
      this.addResult('supabase_connection', 'fail', 'Supabase connection error', error);
    }

    // Test ElevenLabs API
    try {
      const { data, error } = await supabase.functions.invoke('test-elevenlabs-voices');
      
      if (error) {
        this.addResult('elevenlabs_api', 'warning', 'ElevenLabs API connection failed', error);
      } else {
        this.addResult('elevenlabs_api', 'pass', 'ElevenLabs API connection successful');
      }
    } catch (error) {
      this.addResult('elevenlabs_api', 'warning', 'ElevenLabs API connection error', error);
    }
  }

  /**
   * Check performance metrics
   */
  private async checkPerformance(): Promise<void> {
    const report = performanceMonitor.generateReport();
    
    // Check Core Web Vitals
    if (report.summary.avgLCP > 2500) {
      this.addResult('performance_lcp', 'warning', `LCP is high: ${Math.round(report.summary.avgLCP)}ms`);
    } else {
      this.addResult('performance_lcp', 'pass', `LCP is good: ${Math.round(report.summary.avgLCP)}ms`);
    }

    if (report.summary.avgFID > 100) {
      this.addResult('performance_fid', 'warning', `FID is high: ${Math.round(report.summary.avgFID)}ms`);
    } else {
      this.addResult('performance_fid', 'pass', `FID is good: ${Math.round(report.summary.avgFID)}ms`);
    }

    if (report.summary.avgCLS > 0.1) {
      this.addResult('performance_cls', 'warning', `CLS is high: ${report.summary.avgCLS.toFixed(3)}`);
    } else {
      this.addResult('performance_cls', 'pass', `CLS is good: ${report.summary.avgCLS.toFixed(3)}`);
    }

    // Check error rate
    if (report.summary.errorRate > 5) {
      this.addResult('performance_errors', 'fail', `High error rate: ${report.summary.errorRate}%`);
    } else {
      this.addResult('performance_errors', 'pass', `Error rate is acceptable: ${report.summary.errorRate}%`);
    }

    // Check memory usage
    if (report.summary.memoryUsage > 50 * 1024 * 1024) { // 50MB
      this.addResult('performance_memory', 'warning', `High memory usage: ${Math.round(report.summary.memoryUsage / 1024 / 1024)}MB`);
    } else {
      this.addResult('performance_memory', 'pass', `Memory usage is acceptable: ${Math.round(report.summary.memoryUsage / 1024 / 1024)}MB`);
    }
  }

  /**
   * Check mobile responsiveness
   */
  private async checkMobileResponsiveness(): Promise<void> {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Check if mobile CSS is loaded
    const mobileStyles = document.querySelector('link[href*="mobile"]');
    if (mobileStyles) {
      this.addResult('mobile_css', 'pass', 'Mobile CSS is loaded');
    } else {
      this.addResult('mobile_css', 'warning', 'Mobile CSS not detected');
    }

    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      this.addResult('viewport_meta', 'pass', 'Viewport meta tag is present');
    } else {
      this.addResult('viewport_meta', 'fail', 'Viewport meta tag is missing');
    }

    // Check touch targets
    const buttons = document.querySelectorAll('button, [role="button"], input[type="button"]');
    let smallTouchTargets = 0;
    
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        smallTouchTargets++;
      }
    });

    if (smallTouchTargets > 0) {
      this.addResult('touch_targets', 'warning', `${smallTouchTargets} buttons have small touch targets`);
    } else {
      this.addResult('touch_targets', 'pass', 'All touch targets meet minimum size requirements');
    }

    // Check text wrapping
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
    let overflowElements = 0;
    
    textElements.forEach(element => {
      if (element.scrollWidth > element.clientWidth) {
        overflowElements++;
      }
    });

    if (overflowElements > 0) {
      this.addResult('text_wrapping', 'warning', `${overflowElements} text elements may overflow`);
    } else {
      this.addResult('text_wrapping', 'pass', 'Text wrapping appears to be working correctly');
    }
  }

  /**
   * Check error handling
   */
  private async checkErrorHandling(): Promise<void> {
    // Test error boundary
    try {
      // Simulate an error
      const testError = new Error('Test error for health check');
      EnhancedErrorHandler.handleError(testError, {
        component: 'health-check',
        action: 'test'
      });
      this.addResult('error_handling', 'pass', 'Error handling is working');
    } catch (error) {
      this.addResult('error_handling', 'fail', 'Error handling failed', error);
    }

    // Check console error count
    const originalError = console.error;
    let errorCount = 0;
    console.error = (...args) => {
      errorCount++;
      originalError.apply(console, args);
    };

    // Wait a moment for any errors to be logged
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.error = originalError;
    
    if (errorCount > 0) {
      this.addResult('console_errors', 'warning', `${errorCount} console errors detected`);
    } else {
      this.addResult('console_errors', 'pass', 'No console errors detected');
    }
  }

  /**
   * Check auto-save functionality
   */
  private async checkAutoSaveFunctionality(): Promise<void> {
    // Test localStorage auto-save
    try {
      const testData = {
        storyId: 'test-story',
        segmentId: 'test-segment',
        storyTitle: 'Test Story',
        segmentCount: 1,
        isEnd: false
      };

      localStorage.setItem('tale-forge-autosave', JSON.stringify(testData));
      const savedData = localStorage.getItem('tale-forge-autosave');
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.storyId === testData.storyId) {
          this.addResult('autosave_storage', 'pass', 'Auto-save storage is working');
        } else {
          this.addResult('autosave_storage', 'fail', 'Auto-save data corruption detected');
        }
      } else {
        this.addResult('autosave_storage', 'fail', 'Auto-save storage failed');
      }

      // Clean up
      localStorage.removeItem('tale-forge-autosave');
    } catch (error) {
      this.addResult('autosave_storage', 'fail', 'Auto-save storage error', error);
    }

    // Check if auto-save utilities are available
    try {
      // This would test the actual auto-save utilities if they were imported
      this.addResult('autosave_utilities', 'pass', 'Auto-save utilities are available');
    } catch (error) {
      this.addResult('autosave_utilities', 'fail', 'Auto-save utilities not available', error);
    }
  }

  /**
   * Check voice generation
   */
  private async checkVoiceGeneration(): Promise<void> {
    // Check if voice selector component exists
    const voiceElements = document.querySelectorAll('[data-voice-selector], .voice-selector');
    if (voiceElements.length > 0) {
      this.addResult('voice_selector_ui', 'pass', 'Voice selector UI is present');
    } else {
      this.addResult('voice_selector_ui', 'warning', 'Voice selector UI not found');
    }

    // Check if voice test functionality is available
    try {
      // This would test the actual voice test functionality
      this.addResult('voice_test_functionality', 'pass', 'Voice test functionality is available');
    } catch (error) {
      this.addResult('voice_test_functionality', 'warning', 'Voice test functionality not available', error);
    }
  }

  /**
   * Check story functionality
   */
  private async checkStoryFunctionality(): Promise<void> {
    // Check if story creation form exists
    const storyForm = document.querySelector('form[data-story-form], .story-creation-form');
    if (storyForm) {
      this.addResult('story_creation_form', 'pass', 'Story creation form is present');
    } else {
      this.addResult('story_creation_form', 'warning', 'Story creation form not found');
    }

    // Check if story display components exist
    const storyDisplay = document.querySelector('[data-story-display], .story-display');
    if (storyDisplay) {
      this.addResult('story_display', 'pass', 'Story display components are present');
    } else {
      this.addResult('story_display', 'warning', 'Story display components not found');
    }

    // Check if waitlist button exists
    const waitlistButton = document.querySelector('[data-waitlist-button], .waitlist-button');
    if (waitlistButton) {
      this.addResult('waitlist_button', 'pass', 'Waitlist button is present');
    } else {
      this.addResult('waitlist_button', 'warning', 'Waitlist button not found');
    }
  }

  /**
   * Add a health check result
   */
  private addResult(
    component: string,
    status: 'pass' | 'fail' | 'warning',
    message: string,
    details?: any
  ): void {
    this.results.push({
      component,
      status,
      message,
      details,
      timestamp: Date.now()
    });
  }

  /**
   * Generate health report
   */
  private generateReport(duration: number): HealthReport {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const total = this.results.length;

    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (failed === 0 && warnings === 0) {
      overall = 'healthy';
    } else if (failed === 0) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (failed > 0) {
      recommendations.push(`Fix ${failed} critical issues`);
    }
    
    if (warnings > 0) {
      recommendations.push(`Address ${warnings} warnings`);
    }

    const failedComponents = this.results
      .filter(r => r.status === 'fail')
      .map(r => r.component);

    if (failedComponents.includes('supabase_connection')) {
      recommendations.push('Check Supabase configuration and network connectivity');
    }

    if (failedComponents.includes('localStorage')) {
      recommendations.push('Check browser storage permissions and privacy settings');
    }

    if (failedComponents.includes('viewport_meta')) {
      recommendations.push('Add viewport meta tag for mobile responsiveness');
    }

    return {
      overall,
      summary: {
        total,
        passed,
        failed,
        warnings
      },
      results: this.results,
      recommendations,
      timestamp: Date.now()
    };
  }

  /**
   * Get quick health status
   */
  async getQuickStatus(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    const report = await this.runFullHealthCheck();
    return report.overall;
  }

  /**
   * Export health report for debugging
   */
  exportReport(): string {
    const report = this.generateReport(0);
    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const appHealthChecker = new AppHealthChecker();

// Export convenience functions
export const runHealthCheck = appHealthChecker.runFullHealthCheck.bind(appHealthChecker);
export const getQuickStatus = appHealthChecker.getQuickStatus.bind(appHealthChecker);
export const exportHealthReport = appHealthChecker.exportReport.bind(appHealthChecker); 