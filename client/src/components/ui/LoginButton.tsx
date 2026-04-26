import { useTranslation } from "react-i18next";

const loginTo42 =  () => {
  try {
    const PATH = "/auth/login";
    window.location.href = PATH;
  } catch (error) {
    console.error(error);
  }
};

export const LoginButton = () => {
  const { t } = useTranslation();
  return (
      <button onClick={loginTo42}>{t("login.loginSimple")}</button>
  );
};
