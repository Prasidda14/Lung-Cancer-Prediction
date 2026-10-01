import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/predict";

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
  { name: "chest_pain", label: "Chest pain" }
];

const initialForm = Object.fromEntries(
  questions.map((question) => [question.name, ""])
);

const modelResults = [
  {
    name: "Random forest",
    prediction: "random_forest_prediction",
    probability: "random_forest_probability"
  },
  {
    name: "XGBoost",
    prediction: "xboost_prediction",
    probability: "xboost_probability"
  }
];

function formatProbability(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(name, value) {
    setFormData((current) => ({ ...current, [name]: Number(value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Prediction request failed.");
      }

      setResult(await response.json());
    } catch {
      setError(
        "The estimate could not be loaded. Check that the FastAPI server is running, then try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <h1 id="page-title">Lung cancer risk, made easier to read.</h1>
          <p className="hero-description">
            Answer eleven questions about common risk factors. Two models will
            return an estimate, with the probability shown alongside the result.
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
          <p className="section-intro">
            Choose yes or no for each factor. There are no right answers.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="question-grid">
              {questions.map((question) => (
                <fieldset className="question" key={question.name}>
                  <legend>{question.label}</legend>
                  <div className="options">
                    <label className="option">
                      <input
                        type="radio"
                        name={question.name}
                        value="1"
                        checked={formData[question.name] === 1}
                        onChange={(event) =>
                          handleChange(question.name, event.target.value)
                        }
                        required
                      />
                      <span>Yes</span>
                    </label>
                    <label className="option">
                      <input
                        type="radio"
                        name={question.name}
                        value="0"
                        checked={formData[question.name] === 0}
                        onChange={(event) =>
                          handleChange(question.name, event.target.value)
                        }
                      />
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

          {error && (
            <div className="error" role="alert">
              <p>{error}</p>
              <button className="retry-button" type="button" onClick={handleSubmit}>
                Try again
              </button>
            </div>
          )}
        </section>

        <section className="results" aria-live="polite" aria-labelledby="results-title">
          <div className="section-heading results-heading">
            <div>
              <p className="section-kicker">Model readout</p>
              <h2 id="results-title">Your estimate</h2>
            </div>
            {result && <span className="results-state">Updated just now</span>}
          </div>

          {loading && (
            <div className="empty-results loading-state">
              <span className="loading-pulse" aria-hidden="true" />
              <p>Comparing model outputs...</p>
            </div>
          )}

          {result && (
            <div className="model-list">
              {modelResults.map((model) => {
                const isPositive = result[model.prediction] === 1;
                const probability = Number(result[model.probability]);

                return (
                  <article className={`model-result ${isPositive ? "is-positive" : ""}`} key={model.name}>
                    <div className="model-result-topline">
                      <h3>{model.name}</h3>
                      <span className="model-status">
                        {isPositive ? "Lung cancer predicted" : "No lung cancer predicted"}
                      </span>
                    </div>
                    <div className="probability-row">
                      <div className="probability-track" aria-hidden="true">
                        <span style={{ width: `${probability * 100}%` }} />
                      </div>
                      <strong>{formatProbability(probability)}</strong>
                    </div>
                    <p className="probability-caption">Estimated lung cancer probability</p>
                  </article>
                );
              })}
            </div>
          )}

        </section>
      </div>
    </main>
  );
}

export default App;