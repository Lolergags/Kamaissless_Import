# KamaisslessImport

A Tampermonkey userscript to easily import Missless data directly into Kamaitachi (`kamai.tachi.ac`) with a single click, completely avoiding the need to download or manually upload JSON files.

## Supported Games & Websites
- **CHUNITHM**: `https://chun.missless.net/record/playlog`
- **ONGEKI**: `https://geki.missless.net/record/playlog`
- **maimai DX**: `https://mai.missless.net/record/playlog`

## Features
- **Multi-Game Support**: Seamlessly works on Chunithm, Ongeki, and Maimai playlog pages on Missless.
- **Game-Themed Styling**: Features custom visual styling, hover/click dynamics, and 3D button shading designed to match each game's official website theme:
  - **Chunithm**: Deep Maroon (`#8B0000`)
  - **Ongeki**: Signature Magenta / Pink (`#E6007E`)
  - **maimai DX**: Bright Orange (`#FF6600`)
- **Direct Import**: Fetches export data directly in memory and uploads it to Kamaitachi's `file/batch-manual` import endpoint.
- **Interactive Feedback**: Shows live loading states ("Importing to Kamaitachi...") while processing.
- **Token Persistence**: Store your Kamaitachi API Token once across all supported Missless domains.

## Installation & Release Auto-Updates
1. Ensure you have the [Tampermonkey](https://www.tampermonkey.net/) extension installed in your browser.
2. Click here to install from the latest release: **[Install Latest Release](https://github.com/Lolergags/Kamaissless_Import/releases/latest/download/KamaisslessImport.user.js)** (or from the `main` branch raw file).
3. Confirm installation in Tampermonkey.
4. **Release-Based Auto-Updates**: The script uses `@updateURL` and `@downloadURL` headers pointing to `https://github.com/Lolergags/Kamaissless_Import/releases/latest/download/KamaisslessImport.user.js`. Tampermonkey will only update when a new tagged **GitHub Release** is published with an updated `@version` and asset.

## Usage
1. Navigate to your playlog page on any supported Missless site:
   - `https://chun.missless.net/record/playlog`
   - `https://geki.missless.net/record/playlog`
   - `https://mai.missless.net/record/playlog`
2. Click the game-themed **"Send to Kamaitachi"** button injected next to the export button.
3. On the first run, the script will prompt you for your Kamaitachi API Token. 
   **To generate a token:**
   - Go to your profile on `kamai.tachi.ac` -> Settings -> API.
   - Click "Create New Token".
   - You **only** need to enable the `submit_score` permission.
   - Copy the generated token and paste it into the script prompt.
4. Wait a few seconds for the import to complete. You'll receive a browser alert confirming success or detailing any errors.
5. To update your token in the future, click the Tampermonkey extension icon and select **"Update Kamaitachi API Token"**.
