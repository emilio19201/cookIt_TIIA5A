import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Comments, } from "./components/Comments";
import { Recipes } from "./components/Recipes";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="App">
      <NavBar />
      <Banner />
      <Comments />
      <Recipes />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
