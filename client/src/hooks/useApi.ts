// import axios from "axios";
// import { useEffect, useState, useCallback } from "react";

// /**
//  * Custom React hook for performing a GET request using Axios.
//  *
//  * @template T - Expected shape of the response data.
//  * @param {string | null} url - The endpoint to fetch data from. If null, no request is made.
//  *
//  * @returns {{
//  *   loading: boolean;
//  *   error: string | null;
//  *   data: T | null;
//  *   refetch: () => void;
//  * }} Object containing request state and a refetch function.
//  *
//  * @remarks
//  * - Automatically triggers a fetch when `url` changes.
//  * - Provides a `refetch` method for manual re-fetching.
//  * - Manages `loading`, `error`, and `data` state internally.
//  */
// export const useApi = <T>(url: string | null): {
//   loading: boolean;
//   error: string | null;
//   data: T | null;
//   refetch: () => void;
// } => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [data, setData] = useState<T | null>(null);

//   const fetchData = async (url: string) => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get<T>(url);
//       setData(data);
//     } catch (error) {
//       setError(error instanceof Error ? error.message : "Unknown error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refetch = useCallback(() => {
//     if (url) fetchData(url);
//   }, [url]);

//   useEffect(() => {
//     if (url) fetchData(url);
//   }, [url]);

//   return { loading, error, data, refetch };
// };
