import React, { useState } from "react";
import { Container } from "react-bootstrap";

import useFetchJobs from "./useFetchJob";

import JobsPagination from "./JobsPagination";
import Job from "./Job";
import SearchForm from "./SearchForm";

const App: React.FC = () => {
  const [params, setParams] = useState({});
  const [page, setPage] = useState(1);

  const { jobs, loading, error, hasNextPage } = useFetchJobs(params, page);

  function handleParamChange(e: any) {
    const param = e.target.name;
    const value = e.target.value;

    setPage(1);
    setParams((prevParams) => {
      return { ...prevParams, [param]: value };
    });
  }

  return (
    <Container className="my-4">
      <h1>Github Jobs</h1>

      <SearchForm params={params} onParamChange={handleParamChange} />
      <JobsPagination page={page} setPage={setPage} />
      {loading && <h1>Loading...</h1>}
      {error && <h1>Error. Try refreshing</h1>}
      {jobs.map((job) => {
        return <Job key={job.id} job={job} />;
      })}
      <JobsPagination page={page} setPage={setPage} />
    </Container>
  );
};

export default App;
