import { API_BASE } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const api = axios.create({ baseURL: `${API_BASE}/auth` });

const loginTo42 = async ({ signal }: { signal?: AbortSignal }) => {
  const { data } = await api.get("/login", { signal });
  console.log(data);
  return data;
};

export const LoginButton = () => {
  const { data, refetch, error, isFetching } = useQuery({
    queryKey: ["login"],
    queryFn: loginTo42,
    enabled: false,
    retry: false
  });

  return (
    <>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? "Logging in..." : "Login"}
      </button>
      {data && <p>{data}</p>}
      {error && <p>{error.message}</p>}
    </>
  );
};
