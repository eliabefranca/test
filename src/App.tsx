import "./App.css";
import { Button } from "./components/Button";
import { MoviesList } from "./components/MoviesList";

function App() {
  return (
    <div className="app">
      <h1>UI Library Playground</h1>
      <p>Start building components in src/components.</p>
      <div className="button-row">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
      </div>
      <MoviesList />
    </div>
  );
}

export default App;
