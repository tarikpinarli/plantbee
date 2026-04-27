//  login, logout, register
const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export const loginTo42 = () => {
  try {
    window.location.href = `${apiBase}/auth/login`;
  } catch (error) {
    console.error(error);
  }
};
