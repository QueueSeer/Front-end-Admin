import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = ({ isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('หากอีเมลของคุณลงทะเบียนไว้แล้ว คุณจะได้รับลิงก์สำหรับรีเซ็ตรหัสผ่าน');
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      <div
        className={`p-8 rounded-xl shadow-lg w-full max-w-lg sm:max-w-xl lg:max-w-2xl ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
      >
        <h2 className="text-3xl font-semibold mb-8 text-center">
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className={`block text-lg font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`mt-2 p-3 w-full border rounded-lg focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white focus:ring-purple-700'
                  : 'border-gray-300 bg-white text-gray-900 focus:ring-purple-500'
              }`}
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 px-6 rounded-lg focus:outline-none focus:ring-2 ${
              isDarkMode
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-[rgb(126,34,206)] text-white hover:bg-[rgb(104,20,180)]'
            }`}
          >
            Reset Password
          </button>
        </form>
        {message && (
          <p className="mt-6 text-base text-center text-gray-500">
            {message}
          </p>
        )}
        <div className="mt-8 text-center text-base">
          <Link
            to="/login"
            className={`hover:underline ${
              isDarkMode ? 'text-purple-300' : 'text-purple-500'
            }`}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
