import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Satisfaction } from "./components/Satisfaction";
import { Recipes } from "./components/Recipes";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="App">
      <NavBar />
      <Banner />
      <Satisfaction />
      <Recipes />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
