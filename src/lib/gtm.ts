// Google Tag Manager utility functions

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// GTM event tracking function
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters,
    });
  }
}

// Specific tracking functions for common actions
export const gtmEvents = {
  // Project-related events
  projectRegistered: (cid: string, domainName: string) => {
    trackEvent('project_registered', {
      project_cid: cid,
      domain_name: domainName,
    });
  },

  projectSelected: (cid: string, domainName: string) => {
    trackEvent('project_selected', {
      project_cid: cid,
      domain_name: domainName,
    });
  },

  projectDeleted: (cid: string, domainName: string) => {
    trackEvent('project_deleted', {
      project_cid: cid,
      domain_name: domainName,
    });
  },

  // Chat-related events
  messagesSent: (projectCid: string, messageLength: number) => {
    trackEvent('chat_message_sent', {
      project_cid: projectCid,
      message_length: messageLength,
    });
  },

  chatCleared: (projectCid: string, messageCount: number) => {
    trackEvent('chat_cleared', {
      project_cid: projectCid,
      message_count: messageCount,
    });
  },

  suggestedQuestionClicked: (projectCid: string, question: string) => {
    trackEvent('suggested_question_clicked', {
      project_cid: projectCid,
      question: question,
    });
  },

  // Configuration events
  configUpdated: (projectCid: string, changes: string[]) => {
    trackEvent('project_config_updated', {
      project_cid: projectCid,
      config_changes: changes,
    });
  },

  // UI events
  bestPracticesViewed: () => {
    trackEvent('best_practices_viewed');
  },

  dataLimitChanged: (newLimit: number) => {
    trackEvent('data_limit_changed', {
      new_limit: newLimit,
    });
  },

  interestRegistrationClicked: () => {
    trackEvent('interest_registration_clicked');
  },

  // Error events
  error: (errorType: string, errorMessage: string, context?: string) => {
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      context: context,
    });
  },
};
