/**
 * Gets the current logged in user object if user is logged in, otherwise returns null
 * @returns the current logged in user object or null if no user is logged in
 */
export const getCurrentUser = () => {
    const currentUser = localStorage.getItem('currentUser'); // get field for logged in user
    
    if (!currentUser) return null; // if no user is logged in, return null
    return JSON.parse(currentUser); // parse and return the user object
}

// @Minji check again? // check with lib/utils.ts
// export const API_BASE = "http://app:8080"