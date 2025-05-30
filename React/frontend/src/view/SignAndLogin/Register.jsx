import { useState } from "react";
import logo from "../../assets/MCQ_logo.png";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import Poopin from "../../components/poppin";
import { useForm } from "react-hook-form";


export default function Register() {
    const navigate=useNavigate()
    // const [user, setUser] = useState({username:"",password:"",rollno:"",role:"teacher",email:""});
     const [message, setMessage] = useState({ success: false, message: "" });
    const path = import.meta.env.VITE_BASE_URL;
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" })

  const registerOptions = {
    username: { required: "Username can't be blank" ,minLength: { value: 3, message: "Minimum 3 characters required" }},
    password: { required: "Password can't be blank" },
    rollno:{required:"Roll no. can't be blank"},
    role:{required:"Select Role" },
    email:{required:"Email can't be blank"}
  }


  //   const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setUser(prev => ({ ...prev, [name]: value }));
  // };
  //Remove console.log before publishing
  const OnSubmit = (data) => {
    // e.preventDefault();
    const query={
      email:data.email.trim(),
      password:data.password.trim(),
      role:data.role.trim(),
      rollno:data.rollno,
      username:data.username.trim()
    }
    axios
    .post(`${path}/register`,query,{headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true})
    .then(res=>{
      const data= res.data; 
      if(data.success){
        if(data.user._doc.role=="teacher"){
          navigate("/teacher/dashboard",{ state: { success: data.success, message: data.message } })
        }
        else{
         navigate("/student/dashboard",{ state: { success: data.success, message: data.message } })
        }
        }else{
          setMessage({
            success: data.success,
            message: "Please enter the correct details",  
          });
        }
      })
    .catch((err) => {
        if (err.response && err.response.data) {
          setMessage({
            success: err.response.data.success,
            message: "Please enter the correct details",
          });
        } else {
          console.error(err.message);
          navigate("*", { state: { status: err.status || 500, message: err.message || "Something went wrong" } })
        }
      });
  };
    // TODO: Send formData to backend
    return (
        <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
           {message.message && (
                  <div className="flex justify-center mb-4">
                    <Poopin success={message.success} message={message.message} />
                  </div>
                )}
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Smart Assess"        
              src={logo}    
              className="mx-auto h-25 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
              Register
            </h2>
          </div>    

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleSubmit(OnSubmit)} method="POST" className="space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    {...register("username", registerOptions.username)}
                    // value={user.username}
                    autoComplete="off"
                    // onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  {errors.username && (
                <p className="text-sm text-red-500 mt-2">{errors.username.message}</p>
              )}
                </div>
              </div>
              <div>
                <label htmlFor="rollno" className="block text-sm/6 font-medium text-gray-900">
                  Id
                </label>
                <div className="mt-2">
                  <input
                    id="rollno"
                    name="rollno"
                    {...register("rollno", registerOptions.rollno)}
                    type="number"
                    placeholder="Rollno or Teacher Id"
                    required
                    // value={user.rollno}
                    autoComplete="off"
                    // onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  {errors.rollno && (
                <p className="text-sm text-red-500 mt-2">{errors.rollno.message}</p>
              )}
                </div>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm/6 font-medium text-gray-900">
                  Role
                </label>
                <div className="mt-2">
                  <select
                    id="role"
                    name="role"
                    required
                    autoComplete="off"
                    {...register("role", registerOptions.role)}
                    // onChange={handleChange}
                    //  value={user.role}
                    placeholder="Select role"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                </select>
                {errors.role && (
                <p className="text-sm text-red-500 mt-2">{errors.role.message}</p>
              )}
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    {...register("email", registerOptions.email)}
                    required
                    // value={user.email}
                    autoComplete="email"
                    // onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  {errors.email && (
                <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>
              )}
                </div>
              </div>
  
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                    Password
                  </label>  
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    {...register("password", registerOptions.password)}
                    type="password"
                    required
                    // value={user.password}
                    autoComplete="off"
                    // onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  {errors.password && (
                <p className="text-sm text-red-500 mt-2">{errors.password.message}</p>
              )}
                </div>
              </div>
  
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Register
                </button>
              </div>
            </form>
  
            <p className="mt-10 text-center text-sm/6 text-gray-500">
              Already have account?{' '}
              <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                login
              </a>
            </p>
          </div>
        </div>
      </>
    )
}

// export default function Example() {
//     return (
//       <>
//         {/*
//           This example requires updating your template:
  
//           ```
//           <html class="h-full bg-white">
//           <body class="h-full">
//           ```
//         */}
//         <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
//           <div className="sm:mx-auto sm:w-full sm:max-w-sm">
//             <img
//               alt="Your Company"
//               src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
//               className="mx-auto h-10 w-auto"
//             />
//             <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
//               Sign in to your account
//             </h2>
//           </div>
  
//           <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
//             <form action="#" method="POST" className="space-y-6">
//               <div>
//                 <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
//                   Email address
//                 </label>
//                 <div className="mt-2">
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     required
//                     autoComplete="email"
//                     className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                   />
//                 </div>
//               </div>
  
//               <div>
//                 <div className="flex items-center justify-between">
//                   <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
//                     Password
//                   </label>
//                   <div className="text-sm">
//                     <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
//                       Forgot password?
//                     </a>
//                   </div>
//                 </div>
//                 <div className="mt-2">
//                   <input
//                     id="password"
//                     name="password"
//                     type="password"
//                     required
//                     autoComplete="current-password"
//                     className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                   />
//                 </div>
//               </div>
  
//               <div>
//                 <button
//                   type="submit"
//                   className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//                 >
//                   Sign in
//                 </button>
//               </div>
//             </form>
  
//             <p className="mt-10 text-center text-sm/6 text-gray-500">
//               Not a member?{' '}
//               <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
//                 Start a 14 day free trial
//               </a>
//             </p>
//           </div>
//         </div>
//       </>
//     )
//   }
  
