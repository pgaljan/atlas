
import Cookies from "js-cookie";
import store from "../redux/store"; 
import { fetchPlans } from "../redux/slices/plans";

/**
 * Utility function to manage feature visibility.
 * - Automatically fetches plans if not available in the Redux store.
 * - Determines feature visibility based on the user's plan.
 * @returns {Promise<object>} A promise resolving to feature visibility flags.
 */
export const managePlansAndFeatures = async () => {
  const state = store.getState(); // Access the Redux store
  const dispatch = store.dispatch;

  // Get user ID from cookies
  const userId = Cookies.get("atlas_userId");
  if (!userId) {
    console.warn("User ID not found in cookies.");
    return {};
  }

  // Fetch plans if not already loaded
  if (!state.plans.plans || state.plans.plans.length === 0) {
    console.warn("Plans not found in the Redux store. Dispatching fetchPlans...");
    await dispatch(fetchPlans());
  }

  const updatedState = store.getState(); // Fetch updated state after dispatch
  const plans = updatedState.plans.plans;

  if (!plans || plans.length === 0) {
    console.warn("Plans are still unavailable after fetch.");
    return {};
  }

  // Find the user's plan based on the user ID
  const userPlan = plans.find((plan) => plan.userId === userId);
  if (!userPlan) {
    console.warn("User plan not found for the given user ID.");
    return {};
  }

  // Determine the plan type (fallback to 'Personal' if missing)

  // Define the feature set for different plans
  const featureSet = {
    Personal: {
      "Rich Text Annotation": true,
      "Import From Excel": true,
      "Structure Backup & Restore": false,
      "Export to HTML/Markdown": true,
      "Math Typesetting": false,
      "Email Support": true,
      "Passwordless Login": true,
    },
    Educator: {
      "Rich Text Annotation": true,
      "Import From Excel": true,
      "Structure Backup & Restore": true,
      "Export to HTML/Markdown": true,
      "Math Typesetting": true,
      "Object Tagging": true,
      "Export to DOCX, PDF, PPTX": true,
    },
    Analyst: {
      "Rich Text Annotation": true,
      "Import From Excel": true,
      "Structure Backup & Restore": true,
      "Export to HTML/Markdown": true,
      "Object Tagging": true,
      "Export to DOCX, PDF, PPTX": true,
      "File Hosting": true,
    },
    Business: {
      "Full Document Formatting": true,
      "AI Assistant": true,
      "Custom Templates": true,
      "Dynamic Work Breakdown Structures": true,
      "API Access": true,
      "Export to HTML/Markdown": true,
      "Object Tagging": true,
      "Element Export": true,
      "Export to DOCX, PDF, PPTX": true,
      "Structure Linking": true,
      "Math Typesetting": true,
      "File Hosting": true,
    },
  };

  return featureSet[planType] || {};
};
