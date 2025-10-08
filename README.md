🎬 PopChoice: The AI-Powered Movie Recommender
PopChoice is an intelligent movie recommendation application designed to find the perfect film for any user based on their favorite movie, current mood, and desired viewing tone. It leverages a powerful Retrieval-Augmented Generation (RAG) architecture using vector embeddings and Supabase to deliver high-quality, personalized suggestions.

✨ Key Features
Secure Infrastructure (Cloudflare Workers): All sensitive API calls (OpenAI for embeddings/LLM and Supabase for vector search) are proxied through a Cloudflare Worker, ensuring that no secret keys are exposed on the client-side (frontend).

Vector Search Recommendation: Converts user preferences into a 512-dimension vector embedding, performing a highly accurate cosine similarity search against the Supabase vector database.

AI-Augmented Explanations (RAG): Uses the best-matched movie data to generate a concise, friendly, and personalized explanation from an LLM, detailing why the suggested movie is the perfect fit.

User-Friendly UI: A clean, engaging interface built with React that guides the user through the recommendation process.

💻 Tech Stack

💻 Tech Stack
Frontend: React (HTML/CSS) The entire user interface and application state management.
Vector Database	Supabase (PostgreSQL with pg_vector extension): Stores movie data and their 512-dimensional vector embeddings for fast similarity search.
Embedding Model	OpenAI (text-embedding-3-small):Generates high-quality vector embeddings for both the movie dataset and the user's query.
LLM	OpenAI (gpt-3.5-turbo): Used for generating the friendly, personalized explanation (the Augmentation phase).
Security/API: Cloudflare Workers	Acts as a secure middleware layer to protect API keys and proxy requests to OpenAI and Supabase.


🚀 Setup and Installation
Follow these steps to set up the database, deploy the secure API gateway, and run the React frontend.

  clone the repo 
  git clone https://github.com/shukria-sultani/PopChoice.git

1. Cloudflare Worker Setup (Secure API Gateway)
This Worker will handle all traffic to OpenAI and Supabase, protecting your API keys.

Install Wrangler: Ensure you have the Cloudflare CLI tool installed globally:

npm install -g wrangler
wrangler init movie-worker
Define Secrets: You must use Wrangler to store your secrets securely in the Cloudflare environment. These secrets will be accessed by your Worker script:

1. OpenAI Key for Embeddings and GPT
wrangler secret put OPENAI_API_KEY
2. Supabase URL (e.g., [https://your-project.supabase.co])
wrangler secret put SUPABASE_URL
3. Supabase Anon Key (the public key from your Supabase project settings)
wrangler secret put SUPABASE_ANON_KEY

Deploy the Worker: Once your Worker code is written to utilize these secrets (it should proxy requests from your React app to the respective APIs), deploy it:

wrangler deploy

Get Worker URL: Note the public URL provided by Cloudflare upon deployment (e.g., https://popchoice-api.yourusername.workers.dev). You will use this in your frontend configuration.

2. Supabase Database Setup
Configure your Supabase project to handle vector storage and searching.

Enable Extension: In your Supabase Dashboard, go to Database > Extensions and enable the pg_vector extension.

Create Table: Run the following SQL in your SQL Editor to create the table with the correct 512-dimension vector column:

create table movie_embeddings (
  id bigserial primary key,
  title text,
  release_year text,
  content text,
  embedding vector(512) -- Matches text-embedding-3-small
);

-- Ensure RLS is OFF initially to allow the React app to insert data
alter table movie_embeddings disable row level security;

Create RPC Function (Vector Search): This function performs the core similarity search. The SECURITY DEFINER clause is critical to prevent permissions issues during the RPC call.

-- Drop and re-create the function with elevated security
drop function if exists match_movie_embeddings(vector, float, int);

create or replace function match_movie_embeddings(
  query_embedding vector(512),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  title text,
  release_year text,
  content text,
  similarity float
)
language sql stable SECURITY DEFINER
as $$
  select
    id,
    title,
    release_year,
    content,
    1 - (movie_embeddings.embedding <=> query_embedding) as similarity
  from movie_embeddings
  where 1 - (movie_embeddings.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Grant execution permission to the anonymous public role (used by the app)
GRANT EXECUTE ON FUNCTION match_movie_embeddings(vector, float, int) TO anon;

3. Frontend Application
Configure Frontend: Update your frontend configuration file (config.js or similar) to point the API client URLs to your Cloudflare Worker URL, not the direct OpenAI or Supabase API endpoints.

Install Dependencies:
cd PopChoice
npm install

Run the App:

npm start
On the first load, the application will automatically run setupMovieEmbeddings, which uses the Cloudflare Worker to send the movie data to OpenAI for embedding, and then inserts the resulting vectors into your populated Supabase table.

App UI
Movie Form
<img width="182" height="355" alt="movie form" src="https://github.com/user-attachments/assets/504c88ce-1286-4954-840d-7f1308ef11bb" />

Suggestion
<img width="182" height="397" alt="suggestion" src="https://github.com/user-attachments/assets/e8b50336-39d8-4486-aa51-5883c6f42c6f" />

