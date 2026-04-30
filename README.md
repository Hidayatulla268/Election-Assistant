# Indian Election Assistant

A sleek, interactive web application designed to help users understand the Indian election process, timelines, and steps. Built with HTML, CSS (Vanilla, Dark Mode Glassmorphism), and JavaScript.

## Features

- **Process Guide**: Step-by-step information on how to register and vote in India.
- **Interactive Timeline**: A visual timeline of the general Indian election process (from announcement to counting).
- **AI Assistant**: A Gemini-powered chatbot that answers questions about the election process factually and neutrally.
- **Civic Info**: Look up civic information (using Google Civic Information API).

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: Google Gemini API, Google Civic Information API
- **Design**: Dark mode, Glassmorphism, Material Icons

## How to Run Locally

1. Clone this repository.
2. Open `index.html` in your web browser.
3. To use the AI Assistant or Civic Info features, simply click on the respective tabs. You will be prompted to enter your API keys securely in the browser.

## Security Note

API keys are **not** hardcoded in the source code to prevent exposure and quota theft. The application securely prompts the user for their own API keys during runtime.

## License

MIT
