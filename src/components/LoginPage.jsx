// components/LoginPage.jsx
import React, { useState } from 'react'; // Import useState for form fields
import { useNavigate } from 'react-router-dom';
import axiosPublic from '../axiosPublic'; // Import axiosPublic
import Swal from 'sweetalert2'; // For alerts

const LoginPage = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosPublic.post('/api/login', { username, password });
            const { token, userId } = response.data;

            // Store token and userId in local storage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId); // Store userId for consistency/future use

            setIsAuthenticated(true); // Update authentication state
            Swal.fire('Success!', 'Logged in successfully.', 'success');
            navigate('/'); // Redirect to the main dashboard
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            Swal.fire('Error!', error.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 font-[kalpurush]">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                            Username:
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="*******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/signup')}
                            className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;