
// image
import movieIcon from "../assets/images/movieIcon.png"
export function MovieForm (){
      return(
        <main>
            <header>
                <img src={movieIcon} alt="movie icon" width="80px" height="90px" />
                <h1>PopChoice</h1>
            </header>

            <div className="user-data">
                <form action="">
                    <label htmlFor="favMovie">What’s your favorite movie and why?</label>
                    <input type="text"  id="favMovie"/>
                    
                    <label htmlFor="mood">Are you in the mood for something classic or new?</label>
                    <input type="text" id="mood"/>
                    
                    <label htmlFor="type">Do you wanna have fun or do you want something serious?</label>
                    <input type="text" id="type" />

                    <button>Lets Go</button>
                </form>
            </div>
        </main>
      )
}