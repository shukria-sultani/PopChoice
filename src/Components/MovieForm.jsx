import React from 'react';
import movieIcon from "../assets/images/movieIcon.png"
/**
 * MovieForm Component
 * Renders the user input form and passes data back to the parent (App.jsx) via props.
 * @param {object} props - Contains answers, setAnswers, handleSubmit, and isLoading from App state.
 */
export default function MovieForm({ answers, setAnswers, handleSubmit, isLoading }) {
    
    // Helper function to update the specific answer field in the parent state
    const handleChange = (e) => {
        const { id, value } = e.target;
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    return (
        <main>
            <header>
                
                <img src={movieIcon} alt="" width="80px" height="80px" />
                <h1>PopChoice</h1>
            </header>

            <div className="user-data">
                <form onSubmit={handleSubmit}> 
                    
                    <label htmlFor="favMovie">What’s your favorite movie and why?</label>
                    <input 
                        id="favMovie"
                        value={answers.favMovie}
                        onChange={handleChange} 
                        required
                        disabled={isLoading} 
                    />
                    
                    <label htmlFor="mood">Are you in the mood for something classic or new?</label>
                    <input 
                        type="text" 
                        id="mood"
                        value={answers.mood} 
                        onChange={handleChange} 
                        required
                        disabled={isLoading} 
                    />
                    
                    <label htmlFor="type">Do you wanna have fun or do you want something serious?</label>
                    <input 
                        type="text" 
                        id="type"
                        value={answers.type}
                        onChange={handleChange} 
                        required
                        disabled={isLoading} 
                    />

                    <button type="submit" disabled={isLoading}>
                         {isLoading ? 'Analyzing Preferences...' : 'Lets Go'}
                    </button>
                </form>
            </div>
        </main>
    );
}
