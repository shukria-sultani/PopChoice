import movieIcon from "../assets/images/movieIcon.png";

export function Suggestion() {
  return (
    <main className="suggestion-container">
      <header>
        <img src={movieIcon} alt="movie icon" width="80px" height="90px" />
        <h1>PopChoice</h1>
      </header>
        <div class="suggestion">
            <h2>Name Here</h2>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Modi sint hic quasi, voluptatem placeat temporibus molestiae vitae possimus id beatae </p>
                    <button>Go Again</button>
        </div>


    </main>
  );
}
