import React, { useState, useEffect } from "react";
import "./App.css";
import MovieForm from "./Components/MovieForm";
import Suggestion from "./Components/Suggestion";

const TABLE_NAME = "movie_embeddings";


export default function App() {
  const [view, setView] = useState("form");
  const [answers, setAnswers] = useState({ favMovie: "", mood: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [explanation, setExplanation] = useState("");

  const handleGoAgain = () => {
    setAnswers({ favMovie: "", mood: "", type: "" });
    setRecommendation(null);
    setExplanation("");
    setView("form");
  };

const WORKER_URL = "https://movie-worker.shukriasul5.workers.dev/"; 

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // Send the user's answers to the secure Worker proxy
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answers), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Worker failed to process request.');
        }

        // The Worker returns the final result (movie + explanation)
        const { recommendation, explanation } = await response.json();

        setRecommendation(recommendation);
        setExplanation(explanation);
        setView('suggestion'); 

    } catch (error) {
        console.error("Recommendation Workflow Error:", error);
        alert(`Recommendation failed: ${error.message}`); 
    } finally {
        setIsLoading(false);
    }
};


  return (
    <div className="app-container">
      {view === "form" ? (
        <MovieForm
          answers={answers}
          setAnswers={setAnswers}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      ) : (
        <Suggestion
          movie={recommendation}
          explanation={explanation}
          handleGoAgain={handleGoAgain}
        />
      )}
    </div>
  );
}
