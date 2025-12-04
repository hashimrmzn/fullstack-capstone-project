import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import "./RegisterPage.css";

function RegisterPage() {
    // Step 1: State variables
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showerr, setShowerr] = useState("");

    const { setIsLoggedIn } = useAppContext();
    const navigate = useNavigate();

    // Step 2: handleRegister Function
    const handleRegister = async () => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password
                })
            });

            // 🔹 Task 1: Access JSON data coming from backend
            const json = await response.json();
            console.log("Register Response:", json);

            // 🔹 Task 2: If registration successful, store details
            if (json.authtoken) {
                sessionStorage.setItem("auth-token", json.authtoken);
                sessionStorage.setItem("name", firstName);
                sessionStorage.setItem("email", json.email);

                // 🔹 Task 3: Set app state logged in
                setIsLoggedIn(true);

                // 🔹 Task 4: Navigate to Main Page
                navigate("/app");
            }

            // 🔹 Task 5: Registration fail error
            if (json.error) {
                setShowerr(json.error);
            }
        } catch (error) {
            setShowerr("Something went wrong. Try again.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="register-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Register</h2>

                        {/* 🔹 Show backend errors */}
                        <div className="text-danger">{showerr}</div>

                        {/* Input fields */}
                        <input
                            type="text"
                            placeholder="First Name"
                            className="form-control mb-3"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Last Name"
                            className="form-control mb-3"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            className="form-control mb-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="form-control mb-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {/* Register Button */}
                        <button className="btn btn-primary w-100" onClick={handleRegister}>
                            Register
                        </button>

                        <p className="mt-4 text-center">
                            Already a member?{" "}
                            <a href="/app/login" className="text-primary">
                                Login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
