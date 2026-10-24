export const API_MESSAGES = {
  GENERAL: {
    UNAUTHORIZED: "Please login to continue.",
    FORBIDDEN: "You don't have permission to perform this action.",
    BAD_REQUEST: "Invalid request. Please check your input and try again.",
    TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
    INPUT_VALIDATION_FAILED: "Please check your input and fix any errors.",
  },
  USER: {
    GET_ALL: "Users loaded successfully.",
    GET_STATS: "User statistics loaded successfully.",
    GET_DETAILS: "User details loaded successfully.",
    GET_ALL_FOR_SEARCH: "Users loaded successfully.",
    PROFILE_IMAGE_NOT_FOUND: "Profile image not found",
    NOT_UPDATE_PROFILE: "Failed to update prifle. Please try again.",
    PROFILE_UPDATE: "Profile updated successfully.",
    UPDATE: "User updated successfully.",
    NOT_FOUND: "User not found.",
    NOT_MATCHED: "User information doesn't match our records.",
    EXPORT: "Users data exported successfully.",
    PERMISSION: {
      GET_ALL: "Permissions loaded successfully.",
    },
    ROLE: {
      GET_ALL: "Roles loaded successfully.",
      CREATE: "Role created successfully.",
      EXIST: "Role already exists.",
      DELETE: "Role deleted successfully.",
      UPDATE: "Role updated successfully.",
      NOT_FOUND: "Role not found.",
    },
  },
};
