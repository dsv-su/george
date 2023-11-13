import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index from './Index.tsx';
import Proctor from './Proctor.tsx';
import Exam from './candidate/Exam.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index={true} element={<Index />} />
        <Route path={'/proctor/:examId'} element={<Proctor />} />
        <Route path={'/candidate/:examId'} element={<Exam />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
