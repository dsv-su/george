import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index from './Index.tsx';
import Proctor from './Proctor.tsx';
import Exam from './candidate/Exam.tsx';
import Test from './Test.tsx';
import Test2 from './Test2.tsx';
import Administration from './administration/administration.tsx';
import ExaminationPage from './administration/examinationPage.tsx';
import ExaminationListPage from './administration/examinationListPage.tsx';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route index={true} element={<Index />} />
        <Route path={'/proctor/:examId'} element={<Proctor />} />
        <Route path={'/candidate/:examId'} element={<Exam />} />
        <Route path={'/test'} element={<Test />} />
        <Route path={'/test2'} element={<Test2 />} />
        <Route path={'/administration'} element={<Administration />} />
        <Route path={'/administration/examination'} element={<ExaminationListPage />} />
        <Route path={'/administration/examination/:examinationId'} element={<ExaminationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
