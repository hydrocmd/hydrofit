// ========================================
// HYDROFIT - AI EXERCISE GUIDE
// ========================================

console.log("HYDROFIT AI Module Loaded");

const exerciseDatabase = {
    "push-up": { difficulty: "Beginner", muscles: ["Chest", "Triceps", "Shoulders"], instructions: "Start in plank position, lower body until chest nearly touches floor, push back up." },
    "squat": { difficulty: "Beginner", muscles: ["Quadriceps", "Hamstrings", "Glutes"], instructions: "Stand with feet shoulder-width apart, lower hips as if sitting back, return to start." },
    "plank": { difficulty: "Beginner", muscles: ["Core", "Shoulders", "Back"], instructions: "Hold push-up position with body straight, engage core, hold for time." },
    "lunges": { difficulty: "Beginner", muscles: ["Quadriceps", "Glutes", "Hamstrings"], instructions: "Step forward with one leg, lower hips until both knees bent at 90°, return." },
    "burpees": { difficulty: "Advanced", muscles: ["Full Body"], instructions: "Drop into squat, kick feet back, do push-up, jump forward, jump up." }
};

function getAIExerciseRecommendation(fitnessLevel = "beginner") {
    const exercises = Object.keys(exerciseDatabase);
    const filtered = exercises.filter(ex => exerciseDatabase[ex].difficulty.toLowerCase() === fitnessLevel.toLowerCase());
    const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : exercises[0];
    return {
        name: selected,
        ...exerciseDatabase[selected]
    };
}

function getExerciseDetails(exerciseName) {
    const name = exerciseName.toLowerCase();
    return exerciseDatabase[name] || null;
}

window.getAIExerciseRecommendation = getAIExerciseRecommendation;
window.getExerciseDetails = getExerciseDetails;