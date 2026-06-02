import { AppRouter } from "./router";
import { AuthBootstrap } from "./router/AuthBootstrap";

function App() {
  return (
    <AuthBootstrap>
      <AppRouter />
    </AuthBootstrap>
  );
}

export default App;
