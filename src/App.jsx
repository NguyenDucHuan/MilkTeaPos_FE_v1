import useRouterElements from "./routes/useRouterElements";

function App() {

  const routerElement = useRouterElements();

  return <>{routerElement}</>;
}

export default App;