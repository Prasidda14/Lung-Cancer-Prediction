import { useState } from "react";
import "./App.css";

const API_ROOT = "http://127.0.0.1:8000";

const questions = [
  { name: "yellow_fingers", label: "Yellow fingers" },
  { name: "anxiety", label: "Anxiety" },
  { name: "peer_pressure", label: "Peer pressure related to smoking" },
  { name: "chronic_disease", label: "Chronic disease" },
  { name: "fatigue", label: "Fatigue" },
  { name: "allergy", label: "Allergy" },
  { name: "wheezing", label: "Wheezing" },
  { name: "alcohol_consuming", label: "Alcohol consumption" },
  { name: "coughing", label: "Coughing" },
  { name: "swallowing_difficulty", label: "Swallowing difficulty" },
  { name: "chest_pain", label: "Chest pain" },
];

const initialForm = Object.fromEntries(
  questions.map((question) => [question.name, ""])
);

const modelResults = [
  {
    name: "Random forest",
    prediction: "random_forest_prediction",
    probability: "random_forest_probability",
  },
  {
    name: "XGBoost",
    prediction: "xboost_prediction",
    probability: "xboost_probability",
  },
];

function formatProbability(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

async function readResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "The request could not be completed.");
  }
  return data;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [credentials, setCredentials] = useState({ full_name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateCredential(event) {
    setCredentials((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_ROOT}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await readResponse(response);
      localStorage.setItem("lung_cancer_token", data.access_token);
      onAuthenticated(data.access_token);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="section-kicker">Lung cancer risk</p>
        <h1>{mode === "login" ? "Welcome back." : "Create an account."}</h1>
        <p className="auth-copy">
          Sign in before running a private risk estimate. Your password is stored as a secure hash.
        </p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <>
              <label>
                Full name
                <input
                  name="full_name"
                  value={credentials.full_name}
                  onChange={updateCredential}
                  minLength="2"
                  maxLength="100"
                  required
                  autoComplete="name"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={updateCredential}
                  required
                  autoComplete="email"
                />
              </label>
            </>
          )}
          <label>
            Username
            <input
              name="username"
              value={credentials.username}
              onChange={updateCredential}
              minLength="3"
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={updateCredential}
              minLength="8"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
          <button className="submit-button auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait" : mode === "login" ? "Log in" : "Register"}
          </button>
        </form>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="auth-switch">
          {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Register" : "Log in"}
          </button>
        </p>
      </section>
    </main>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("lung_cancer_token"));
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(name, value) {
    setFormData((current) => ({ ...current, [name]: Number(value) }));
  }

  function logout() {
    localStorage.removeItem("lung_cancer_token");
    setToken(null);
    setResult(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_ROOT}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await readResponse(response);
      setResult(data);
    } catch (requestError) {
      if (requestError.message.includes("token") || requestError.message.includes("Login required")) {
        logout();
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <AuthScreen onAuthenticated={setToken} />;
  }

  return (
    <main className="app-shell">
      <div className="topbar">
        <span>Signed in</span>
        <button type="button" onClick={logout}>Log out</button>
      </div>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <h1 id="page-title">Lung cancer risk, made easier to read.</h1>
          <p className="hero-description">
            Answer eleven questions about common risk factors. Two models will return an estimate, with the probability shown alongside the result.
          </p>
        </div>
      </section>

      <div className="workspace">
        <section className="assessment" aria-labelledby="assessment-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Patient inputs</p>
              <h2 id="assessment-title">Tell us what applies</h2>
            </div>
            <span className="question-count">11 questions</span>
          </div>
          <p className="section-intro">Choose yes or no for each factor. There are no right answers.</p>

          <form onSubmit={handleSubmit}>
            <div className="question-grid">
              {questions.map((question) => (
                <fieldset className="question" key={question.name}>
                  <legend>{question.label}</legend>
                  <div className="options">
                    <label className="option">
                      <input type="radio" name={question.name} value="1" checked={formData[question.name] === 1} onChange={(event) => handleChange(question.name, event.target.value)} required />
                      <span>Yes</span>
                    </label>
                    <label className="option">
                      <input type="radio" name={question.name} value="0" checked={formData[question.name] === 0} onChange={(event) => handleChange(question.name, event.target.value)} />
                      <span>No</span>
                    </label>
                  </div>
                </fieldset>
              ))}
            </div>
            <button className="submit-button" type="submit" disabled={loading}>
              <span>{loading ? "Reading responses" : "Run the estimate"}</span>
            </button>
          </form>

          {error && <div className="error" role="alert"><p>{error}</p></div>}
        </section>

        <section className="results" aria-live="polite" aria-labelledby="results-title">
          <div className="section-heading results-heading">
            <div>
              <p className="section-kicker">Model readout</p>
              <h2 id="results-title">Your estimate</h2>
            </div>
            {result && <span className="results-state">Updated just now</span>}
          </div>

          {loading && <div className="empty-results loading-state"><span className="loading-pulse" aria-hidden="true" /><p>Comparing model outputs...</p></div>}
          {result && <div className="model-list">
            {modelResults.map((model) => {
              const isPositive = result[model.prediction] === 1;
              const probability = Number(result[model.probability]);
              return (
                <article className={`model-result ${isPositive ? "is-positive" : ""}`} key={model.name}>
                  <div className="model-result-topline">
                    <h3>{model.name}</h3>
                    <span className="model-status">{isPositive ? "Lung cancer predicted" : "No lung cancer predicted"}</span>
                  </div>
                  <div className="probability-row">
                    <div className="probability-track" aria-hidden="true"><span style={{ width: `${probability * 100}%` }} /></div>
                    <strong>{formatProbability(probability)}</strong>
                  </div>
                  <p className="probability-caption">Estimated lung cancer probability</p>
                </article>
              );
            })}
          </div>}
        </section>
      </div>
    </main>
  );
}

export default App;
