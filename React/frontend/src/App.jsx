import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './view/SignAndLogin/Register'
import Home from "./view/home"
import Login from "./view/SignAndLogin/Login"
import StudentDashboard from "./view/StudentDashboard"
import TeacherDashboard from "./view/TeacherDashboard"
import Error from "./view/Error"
import CreateTest from "./view/CreateTest"
import ViewTest from './view/ViewTest';
import DisplayTest from "./view/DisplayTest"
import EditTest from "./view/EditTest";
import StudentViewTest from './view/StudentViewTest';
import StudentViewResults from './view/StudentViewResult';
import StudentAttemptTest from './view/StudentAttemptList';
import TeacherViewResults from './view/TeacherViewResult';
import AttemptTest from './view/AttemptTest';
import ViewResultPage from './view/ViewResultPage';


function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />       {/* Home component at '/' */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/create_test" element={<CreateTest />} />
          <Route path="/view_tests" element={<ViewTest />} />
          <Route path="/test/:id" element={<DisplayTest />} />
          <Route path="/edit_test/:id" element={<EditTest />} />
          <Route path="/student/view_test" element={<StudentViewTest />} />
          <Route path="/student/results" element={<StudentViewResults />} />
          <Route path="/attempt_tests" element={<StudentAttemptTest />} />
          <Route path="/view_results" element={<TeacherViewResults />} />
          <Route path="/attempt_test/:id" element={<AttemptTest />} />
          <Route path="/result/detail/:attemptId" element={<ViewResultPage />} />



          {/* Route for all error */}
          < Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
