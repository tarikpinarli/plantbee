const loginTo42 =  () => {
  try {
    const PATH = "/auth/login";
    window.location.href = PATH;
  } catch (error) {
    console.error(error);
  }
};

export const LoginButton = () => {
  return (
      <button onClick={loginTo42}>Log in to 42</button>
  );
};