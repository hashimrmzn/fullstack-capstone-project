import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AuthContext';
import { urlConfig } from '../../config';
import './LoginPage.css';

function LoginPage() {
    // State variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [incorrect, setIncorrect] = useState('');

    // Local variables
    const navigate = useNavigate();
    const { setIsLoggedIn } = useAppContext();
    const bearerToken = sessionStorage.getItem('auth-token');

    // Redirect if user is already logged in
    useEffect(() => {
        if (bearerToken) {
            navigate('/app');
        }
    }, [navigate, bearerToken]);

    // Handle login API call
    const handleLogin = async () => {
        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': bearerToken ? `Bearer ${bearerToken}` : ''
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const json = await response.json();

            if (response.ok && json.authtoken) {
                // Task 1 & 2: Access data and set user details
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);

                // Task 3: Update global login state
                setIsLoggedIn(true);

                // Task 4: Navigate to MainPage
                navigate('/app');

                // Clear local inputs
                setEmail('');
                setPassword('');
            } else {
                // Task 5: Clear input and set error message
                setEmail('');
                setPassword('');
                setIncorrect(json.error || "Wrong password. Try again.");

                // Optional: Clear error message after 2 seconds
                setTimeout(() => setIncorrect(''), 2000);
            }
        } catch (e) {
            console.error('Login error: ' + e.message);
            setIncorrect('An error occurred. Please try again.');
            setTimeout(() => setIncorrect(''), 2000);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="text"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Task 6: Display error message */}
                        {incorrect && (
                            <span
                                style={{
                                    color: 'red',
                                    height: '.5cm',
                                    display: 'block',
                                    fontStyle: 'italic',
                                    fontSize: '12px'
                                }}
                            >
                                {incorrect}
                            </span>
                        )}

                        <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>
                            Login
                        </button>

                        <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register Here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
