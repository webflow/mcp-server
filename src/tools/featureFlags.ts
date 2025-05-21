export interface FeatureFlags {
    enableWebflowAiChat: boolean;
    // Add more feature flags here as needed
  }
  
  export function getFeatureFlags(env: NodeJS.ProcessEnv): FeatureFlags {
    return {
      enableWebflowAiChat: env.ENABLE_WEBFLOW_AI_CHAT === "true",
      // Add more feature flag parsing here as needed
    };
  }