import './App.css';
import Header from './components/Header';
import UploadInterface from './UplaodInterface';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
function App() {
  return (
    <div className="App">
      <Header/>
      <UploadInterface/>
      <Chatbot/>
      <Footer/>
    </div>
  );
}

export default App;
