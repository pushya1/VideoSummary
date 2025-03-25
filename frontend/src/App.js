import Main from './pages/Main';
import Content from './pages/Content';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Main/>}/>
          <Route path="/content" element={<Content/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
