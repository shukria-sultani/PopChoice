import React, { useState, useEffect } from "react";
import "./App.css";
import MovieForm from "./Components/MovieForm";
import Suggestion from "./Components/Suggestion";

// Import API clients and static data
import { openai, supabase } from "./config.js";
import movies from "./content.js";

const TABLE_NAME = "movie_embeddings";


async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("OpenAI Embedding Error:", error);
    throw new Error("Failed to generate embedding. Check API key and network.");
  }
}


async function setupMovieEmbeddings() {
  try {
    // 1. Check if the table is already populated 
    const { count } = await supabase
      .from(TABLE_NAME)
      .select("*", { count: "exact", head: true });

    if (count > 0) {
      console.log("Movie embeddings already exist. Skipping setup.");
      return;
    }

    console.log(
      "Starting initial setup: Generating and inserting movie embeddings..."
    );
    const embeddingData = [];

    // 2. Loop through movies, generate vectors, and format data
    for (const movie of movies) {
      // Combine all relevant text for a rich vector
      const textToEmbed = `${movie.title} (${movie.releaseYear}): ${movie.content}`;
      const embedding = await getEmbedding(textToEmbed);

      embeddingData.push({
        title: movie.title,
        release_year: movie.releaseYear,
        content: movie.content,
        embedding: embedding,
      });
    }

    // 3. Insert all data into Supabase
    const { error } = await supabase.from(TABLE_NAME).insert(embeddingData);
    if (error) throw error;

    console.log("✅ Successfully inserted all movie embeddings.");
  } catch (error) {
    console.error("🚨 Movie Embedding Setup Failed:", error);
  }
}

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    // 1. Combine user input into a single text string
    const combinedAnswers = `Favorite Movie: ${answers.favMovie}. 
            Mood: ${answers.mood}. 
            Tone: ${answers.type}.`;

    try {
      // 2. Generate User Query Embedding 
      const userVector = await getEmbedding(combinedAnswers);

      // 3. RETRIEVAL (Search Supabase Vector DB)
      const { data: results, error: searchError } = await supabase.rpc(
        "match_movie_embeddings",
        {
          query_embedding: userVector,
          match_threshold: 0.2,
          match_count: 1,
        } 
      );

      if (searchError || !results || results.length === 0) {
        console.error("Vector Search Error:", searchError);
        throw new Error(
          "Could not find a high-quality movie match in the database."
        );
      }

      const bestMatch = results[0];
      setRecommendation(bestMatch); // Save the retrieved movie data

      // 4. AUGMENTATION & GENERATION (Use LLM for Explanation)
      const explanationPrompt = `
                The user's preferences are: "${combinedAnswers}". 
                You found the movie "${bestMatch.title}" (${bestMatch.release_year}) 
                with description: ${bestMatch.content}. 
                Explain why this movie is a perfect fit in one short, friendly, and concise sentence.
            `;

      const chatResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a concise, friendly, and helpful AI movie recommender. Respond in one sentence.",
          },
          { role: "user", content: explanationPrompt },
        ],
        temperature: 0.5,
        max_tokens: 100,
      });

      const aiExplanation = chatResponse.choices[0].message.content.trim();
      setExplanation(aiExplanation); // Save the AI-generated text

      // 5. Switch to result view
      setView("suggestion");
    } catch (error) {
      console.error("Recommendation Workflow Error:", error);
      alert(`Recommendation failed: ${error.message}`);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    setupMovieEmbeddings();
  }, []);


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
