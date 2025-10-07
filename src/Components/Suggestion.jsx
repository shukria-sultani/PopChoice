import React from "react";
import movieIcon from "../assets/images/movieIcon.png"

/**
 * Suggestion Component
 * Renders the final recommended movie and explanation using passed props.
 * @param {object} props - Contains movie data, explanation string, and handleGoAgain function.
 */
export default function Suggestion({ movie, explanation, handleGoAgain }) {
  // Safely extract a descriptive snippet from the movie content for display
  const fullDescription = movie?.content || "";
  const descriptiveSnippet = fullDescription.split(": ")[1] || fullDescription;

  return (
    <main className="suggestion-container">
      <header>
        <img src={movieIcon} alt="" width="80px" height="80px" />

        <h1>PopChoice</h1>
      </header>

      <div className="suggestion">
        {movie ? (
          <>
            {/* Display Movie Title and Year from the 'movie' prop */}
            <h2>
              {movie.title} ({movie.release_year})
            </h2>

            {/* Display movie description and AI explanation */}
            <p>{descriptiveSnippet}</p>
            <p>
              <strong>AI Match:</strong> {explanation}
            </p>

            {/* Button is wired to the handleGoAgain function */}
            <button onClick={handleGoAgain}>Go Again</button>
          </>
        ) : (
          // Fallback state if no movie is found
          <>
            <h2>No Movie Found</h2>
            <p>We couldn't find a strong match. Try different inputs!</p>
            <button onClick={handleGoAgain}>Go Again</button>
          </>
        )}
      </div>
    </main>
  );
}
