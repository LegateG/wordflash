# WordFlash 📖

## Project Overview

WordFlash is a web-based flashcard and quiz application designed to help users efficiently learn new vocabulary. The project is a simple, effective, and user-friendly tool for language acquisition, focusing on core mechanics for learning and testing new words.

### Purpose

Our goal was to create a fun and engaging platform for language learners to build vocabulary. The application allows users to actively learn words through a flashcard-based system and then test their knowledge in a dynamic quiz environment.

### Main Features ✨

  - **Personalized Welcome:** Users can enter their name, which is saved locally to provide a personalized experience.
  - **Interactive Flashcards:** The learning section presents words via flashcards that automatically flip or can be manually controlled.
  - **Dynamic Quiz Game:** A multiple-choice quiz tests the user's knowledge of the words learned.
  - **Detailed Quiz Results:** The results screen provides comprehensive feedback, including:
      - Overall score and total time taken.
      - **Average time per question** to help users gauge their pacing.
      - A detailed list of all **incorrectly answered words** for quick review.
  - **Responsive Design:** The application is built with a responsive layout using CSS Flexbox and media queries, ensuring a seamless experience on both desktop and mobile devices.

### Screenshots
| Welcome Page | Learning Phase | Quiz Results |
|:---:|:---:|:---:|
| ![Welcome Page](https://raw.githubusercontent.com/LegateG/wordflash/main/assets/images/screenshots/ss1.jpg) | ![Learning Phase](https://raw.githubusercontent.com/LegateG/wordflash/main/assets/images/screenshots/ss4.jpg) | ![Quiz Results](https://raw.githubusercontent.com/LegateG/wordflash/main/assets/images/screenshots/ss5.jpg) |

## Getting Started

### Installation

This is a web-based application, so no complex installation is required.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LegateG/wordflash
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd WordFlash
    ```
3.  **Run a local web server and open the project:**
    To ensure the JavaScript files work properly when running locally, serve the project using a local web server instead of opening index.html directly.

    Option A. Using Python (if installed):
    ```bash
    python3 -m http.server 8000
    ```
    Then open your browser and go to http://localhost:8000/index.html.

     Option B. Using VS Code Live Server extension (recommended for ease):
   
       - Open the project directory in VS Code.
       - Install the "Live Server" extension if you don’t have it.
       - Right-click on index.html and select "Open with Live Server".
       - This will open the app in your browser with a local server running.

### Dependencies

This project is built using standard web technologies. No external libraries or frameworks are required.

  - HTML5
  - CSS3
  - JavaScript (ES6+)

-----

## Team Contributions

  - **Craig:**

      - **Role:** Front-End Developer, Project Manager
      - **Contributions:** Developed the welcome screen, managed user input with local storage, and implemented the responsive design. Handled project setup and resolved GitHub workflow issues.

  - **Gorkem:**

      - **Role:** Game Logic Developer
      - **Contributions:** Built the core game mechanics, including the flashcard learning phase and the quiz functionality. Developed the logic for calculating average quiz time and displaying incorrect answers on the results page.

-----

## Project Documentation & Resources

  - **Video Demonstration:**
    
    [![Watch the video](https://img.youtube.com/vi/h-8ueGT0txs/2.jpg)](https://youtu.be/h-8ueGT0txs) 

  - **Issue Board:**
    [Github Projects](https://github.com/users/LegateG/projects/4)

  - **Feature Branches:**

      - `feature/homepage-update`
      - `HTML-Cards-and-quiz`
      - `Restart-Learning-feature`
      - `feature/avgtimer&wronglist`

-----

## Future Enhancements

We have several ideas for future work to expand the project's functionality:

  - Expanding the word dictionary with more languages and categories.
  - Implementing user progress tracking across sessions.
  - Adding a returning user feature to save quiz history and stats.
  - Creating a competitive leaderboard.
