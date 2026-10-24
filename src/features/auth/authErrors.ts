export const authErrors: Record<string, { title: string; message: string }> = {
  invalid_callback_request: {
    title: "Invalid Request",
    message: "The authentication callback was invalid. Please try again.",
  },
  state_not_found: {
    title: "Session Expired",
    message:
      "Your authentication session has expired. Please try signing in again.",
  },
  state_mismatch: {
    title: "Security Error",
    message:
      "There was a security mismatch in your authentication request. Please try again.",
  },
  no_code: {
    title: "Authentication Failed",
    message: "No authorization code was received from the provider.",
  },
  no_callback_url: {
    title: "Configuration Error",
    message: "Missing callback URL configuration. Please contact support.",
  },
  oauth_provider_not_found: {
    title: "Provider Not Found",
    message: "The requested OAuth provider is not available or not configured.",
  },
  email_not_found: {
    title: "Email Required",
    message:
      "We couldn't retrieve your email from the provider. Please ensure you've granted email permissions.",
  },
  "email_doesn't_match": {
    title: "Email Mismatch",
    message: "The email from your provider doesn't match the expected email.",
  },
  unable_to_get_user_info: {
    title: "User Info Error",
    message: "Unable to retrieve your user information from the provider.",
  },
  unable_to_link_account: {
    title: "Account Linking Failed",
    message:
      "Could not link your account. Please try again or contact support.",
  },
  account_already_linked_to_different_user: {
    title: "Account Already Linked",
    message:
      "This account is already linked to another user. Please use a different account.",
  },
  signup_disabled: {
    title: "Sign Up Disabled",
    message:
      "New account registration is currently disabled. Please contact the administrator.",
  },
};
