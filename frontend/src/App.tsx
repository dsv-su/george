import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Index from './Index.tsx';
import Proctor from './Proctor.tsx';
import Exam from './candidate/Exam.tsx';
import Test from './Test.tsx';
import Test2 from './Test2.tsx';
import NewExaminationPage from './administration/newExaminationPage.tsx';
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
        <Route
          path={'/administration'}
          element={
            <div className="container-lg">
              <Outlet />
            </div>
          }
        >
          <Route index element={<Navigate to={'examination'} />} />
          <Route path={'examination/new'} element={<NewExaminationPage />} />
          <Route path={'examination'} element={<ExaminationListPage />} />
          <Route path={'examination/:examinationId'} element={<ExaminationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
