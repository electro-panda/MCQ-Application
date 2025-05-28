import logo from "../assets/MCQ_logo.png";
import teacher from "../assets/teacher.png";
import student from "../assets/student2.png";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Poopin from "../components/poppin";

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const { message, success } = location.state || {}
    const handleClick = (title) => (
        navigate("/login", { state: { title: title } })
    )
    return (
        <>

            <div className="flex flex-col">

                {/* For Alert Box */}
                <div className="flex justify-center">
                    {message && <Poopin message={message} success={success} />}
                </div>
                <div className="cursor-pointer flex flex-row justify-center items-center mt-10     ">

                    <img className="w-25 h-25 sm:w-50 sm:h-50 " src={logo} alt="SmartAssess" />
                    <h1 className="w-50 ml-4 text-xl font-extrabold text-blue-900 sm:w-100 sm:text-6xl">SmartAssess</h1></div>
                <div className="cursor-pointer flex flex-row justify-around md:justify-center md:gap-24 mt-10">

                    <div className="flex flex-col items-center border-4 border-gray-500 rounded-xl p-5 transition-transform transform hover:scale-105 hover:shadow-md hover:border-blue-500" onClick={() => handleClick("Teacher")}>
                        <img className="w-20 sm:w-36" src={teacher} alt="Teacher Login" />
                        <p className="text-lg font-bold">Teacher Login</p>
                    </div>

                    <div className="flex flex-col items-center border-4 border-gray-500 rounded-xl p-5 transition-transform transform hover:scale-105 hover:shadow-md hover:border-blue-500" onClick={() => handleClick("Student")}>
                        <img className="w-20 sm:w-36" src={student} alt="Student Login" />
                        <p className="text-lg font-bold">Student Login</p>
                    </div>

                </div>
                <p className="text-center mt-16">Don't have an account?{' '}<Link to="/register" className="text-blue-600 transition duration-700 ease-in-out hover:underline hover:underline-offset-3">Register</Link></p>
                <p className="text-center text-gray-600 mt-16">
                    A Smart Platform for Teachers and Students to Assess and Improve Learning.
                </p>
            </div>
        </>
    )
}
