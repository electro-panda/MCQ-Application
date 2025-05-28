import { useState } from "react";
import logo from "../../assets/MCQ_logo.png";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Poopin from "../../components/poppin";
import { useForm } from "react-hook-form";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { title } = location.state || { title: "Teacher" };
  // const [user, setUser] = useState({ username: "", password: "" });
  const [message, setMessage] = useState({ success: false, message: "" });
  const path = import.meta.env.VITE_BASE_URL;
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" })

  const registerOptions = {
    username: { required: "Username can't be blank" },
    password: { required: "Password can't be blank" }
  }

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setUser((prev) => ({ ...prev, [name]: value.trimStart() }));
  // };

  const OnSubmit = (data) => {
    // e.preventDefault();
    const query = {
      username: data.username.trim(),
      password: data.password.trim()
    }

    axios
      .post(`${path}/login`, query, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true  // ✅ Required here too
      })
      .then((res) => {
        const data = res.data;
        if (data.success) {
          if (data.user.role.toUpperCase() === title.toUpperCase()) {
            navigate(`/${title.toLowerCase()}/dashboard`, { state: { success: data.success, message: data.message } });
          }
          else {
            setMessage({
              success: false,
              message: `Access denied. Only ${title}s are allowed.`,
            });
          }
        }
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          setMessage({
            success: err.response.data.success,
            message: err.response.data.message,
          });
        } else {
          console.error(err.message);
          navigate("*", { state: { status: err.status || 500, message: err.message || "Something went wrong" } })
        }
      });
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      {message.message && (
        <div className="flex justify-center mb-4">
          <Poopin success={message.success} message={message.message} />
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <img src={logo} alt="SmartAssess" className="mx-auto h-24 w-auto" />
        <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {title} Login
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(OnSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                {...register("username", registerOptions.username)}
                type="text"
                required
                // value={user.username}
                // onChange={handleChange}
                autoComplete="off"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-2">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                {...register("password", registerOptions.password)}
                type="password"
                required
                // value={user.password}
                // onChange={handleChange}
                autoComplete="off"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-2">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
