import axios from "axios";
import { useReducer, useEffect } from "react";

interface Params {
  markdown?: boolean;
  page?: number;
}

interface Job {
  id: string;
  title: string;
  company: string;
  created_at: string;
  type: string;
  location: string;
  how_to_apply: string;
  company_logo: string;
  description: string;
}

interface State {
  loading?: boolean;
  jobs?: Job[];
  error?: Error;
  hasNextPage?: boolean;
}

type Action =
  | { type: "make-request" }
  | { type: "get-data"; payload: { jobs: [Job] } }
  | { type: "error"; payload: { error: Error } }
  | { type: "update-has-next-page"; payload: { hasNextPage: boolean } };

const BASE_URL =
  "https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json";

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "make-request":
      return { loading: true, jobs: [] };
    case "get-data":
      return { ...state, loading: false, jobs: action.payload.jobs };
    case "error":
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        jobs: [],
      };
    case "update-has-next-page":
      return { ...state, hasNextPage: action.payload.hasNextPage };
    default:
      return state;
  }
};

export const useFetchJobs = (params: Params, page: number): State => {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true });

  useEffect(() => {
    const cancelToken1 = axios.CancelToken.source();

    dispatch({ type: "make-request" });

    axios
      .get(BASE_URL, {
        cancelToken: cancelToken1.token,
        params: { markdown: true, page: page, ...params },
      })
      .then((res) => {
        dispatch({ type: "get-data", payload: { jobs: res.data } });
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        dispatch({ type: "error", payload: { error: e } });
      });

    const cancelToken2 = axios.CancelToken.source();

    axios
      .get(BASE_URL, {
        cancelToken: cancelToken2.token,
        params: { markdown: true, page: page + 1, ...params },
      })
      .then((res) => {
        dispatch({
          type: "update-has-next-page",
          payload: { hasNextPage: res.data.length !== 0 },
        });
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        dispatch({ type: "error", payload: { error: e } });
      });

    return () => {
      cancelToken1.cancel();
      cancelToken2.cancel();
    };
  }, [params, page]);

  return state;
};

export default useFetchJobs;
