import { Grid } from "@chakra-ui/react";
import { Agent } from "../src/Agent";
import Head from "next/head";

const App = () => {
  return (
    <Grid minH="100vh" templateColumns={["0 1fr", null, null, "250px 1fr"]}>
      <Head>
        <title>Godmode Enhanced - Free AI Agents with OpenRouter</title>
      </Head>
      <Agent />
    </Grid>
  );
};

export default App;
