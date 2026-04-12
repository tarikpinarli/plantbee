//  login, logout, register
export const loginTo42 =  () => {
  try {
    const PATH = "/auth/login";
    window.location.href = PATH;
  } catch (error) {
    console.error(error);
  }
};