# Vlaai Bargaining Game

A web-based implementation of a two-player bargaining game centered around splitting a traditional Limburg vlaai (pie), with optional AI assistance for negotiation strategies.

## Overview

This game implements a classic bargaining scenario where two players need to agree on how to split a vlaai. Players take turns making offers and responding to them, with the goal of reaching a mutually acceptable agreement.

## Quick Start (GitHub Codespace)

1. Open the repository in GitHub Codespaces
2. Wait for the Codespace to fully load (you'll see a stable VS Code interface)
3. Look for the "Go Live" button in the bottom right corner of the window (get the "Live Server" extension)
4. Click "Go Live" to start the local server
5. The game will open in a new browser tab automatically

## Game Rules

1. The game starts with a vlaai that needs to be split (100%)
2. Players take turns:
   - The offering player proposes how to split the vlaai (what percentage they want)
   - The responding player can either accept or reject the offer
   - If rejected, the responding player becomes the offering player for the next round
3. The game ends when either:
   - A player accepts an offer (both players get their agreed-upon percentages)
   - The maximum number of rounds (3) is reached (neither player gets any vlaai)

## Features

- Clean, modern UI with clear player turn indicators
- Real-time game history tracking
- Optional AI assistant that can:
  - Explain game mechanics
  - Provide negotiation strategies
  - Share interesting facts about Limburg vlaai
- Comprehensive game logging for research purposes
- Mobile-responsive design

## Using the AI Assistant

1. The AI assistant can be toggled using the checkbox in the top-right corner
2. When enabled, you can ask questions about:
   - Game rules and mechanics
   - Negotiation strategies
   - Traditional Limburg vlaai
3. The AI's state (enabled/disabled) persists between sessions
4. For control group experiments, simply disable the AI assistant

## Game Logs

The game automatically logs:
- All offers made (who made them and the percentages)
- All responses (accepts/rejects)
- Final outcomes
- Timestamps for all actions

To export logs:
1. Click the "Export Game Logs" button at the bottom of the game panel
2. The logs will download as a JSON file
3. Each game session has a unique ID for research purposes

## Technical Details

- Pure HTML/CSS/JavaScript implementation
- No external dependencies required
- GPT-4 integration for intelligent assistance
- LocalStorage for game logs and chat preferences

## Cost Estimation

The GPT-4 integration costs approximately:
- $0.03 per 1K input tokens
- $0.06 per 1K output tokens
- Average conversation might cost $0.01-0.05 per game session

## Security Note

Before deploying to production:
1. Set up proper API key management
2. Implement rate limiting
3. Add user authentication if needed
4. Never commit API keys to version control

## Development

To modify the game:
1. `game.js` - Core game logic and state management
2. `chat.js` - AI assistant integration
3. `index.html` - Game interface structure
4. `styles.css` - Visual styling

## License

MIT License - Feel free to use and modify as needed. 