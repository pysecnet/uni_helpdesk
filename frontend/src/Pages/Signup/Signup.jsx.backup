import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signupUser, clearError } from "../../features/userSlice";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
    address: "",
    role: "student", // ✅ Fixed as student
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect after signup
  useEffect(() => {
    if (user?.role === "student") {
      navigate("/student-dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.email || !formData.password) {
      alert("Please fill all required fields!");
      return;
    }

    dispatch(signupUser(formData));
  };

  return (
    <div
      className="container mt-5 p-4 shadow rounded"
      style={{ maxWidth: "500px" }}
    >
      <h2 className="mb-4 text-center">Create Student Account</h2>

      {error && <p className="text-danger text-center">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            placeholder="Full Name *"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Email Address *"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Password *"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <select
            name="gender"
            value={formData.gender}
            className="form-select"
            onChange={handleChange}
          >
            <option value="">Select Gender (Optional)</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label text-muted small">Date of Birth (Optional)</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <input
            type="text"
            name="address"
            value={formData.address}
            placeholder="Address (Optional)"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center mt-3 text-muted">
        Already have an account?{" "}
        <a href="/login" className="text-primary">
          Login here
        </a>
      </p>
    </div>
  );
}

export default Signup;
