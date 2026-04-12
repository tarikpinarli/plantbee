export const updateUser = async (
  url: string,
  method: string,
  body: unknown,
) => {
  try {
    const res = await fetch(`/api/user/${url}`, {
      method: method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
