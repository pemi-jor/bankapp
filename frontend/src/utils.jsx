
export const saveAccessTokenToLocalStorage = (token) => {
    localStorage.setItem("accessToken", token)
};
export const saveUserIdToLocalStorage = (id) => {
    localStorage.setItem("userID", id)
};

export const loadAccessTokenFromLocalStorage = () => localStorage.getItem("accessToken");
export const loadUserIdFromLocalStorage = () => localStorage.getItem("userID");

export const removeAccessTokenFromLocalStorage = () => localStorage.removeItem("accessToken");
export const removeUserIdFromLocalStorage = () => localStorage.removeItem("userID");
