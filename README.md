# KamaisslessImport

A Tampermonkey userscript to easily import Missless data directly into Kamaitachi (`kamai.tachi.ac`) with a single click, completely avoiding the need to download or manually upload JSON files.

## Supported Games & Websites
- **CHUNITHM**: `https://chun.missless.net`
- **ONGEKI**: `https://geki.missless.net`
- **maimai DX**: `https://mai.missless.net`

## Features
- **Multi-Game Support**: Seamlessly works on Chunithm, Ongeki, and Maimai playlog pages on Missless.
- **Direct Import**: Fetches export data directly in memory and uploads it to Kamaitachi's `file/batch-manual` import endpoint.
- **Token Persistence**: Store your Kamaitachi API Token once across all supported Missless domains.

## Installation & Auto-Updates
1. Ensure you have the [Tampermonkey](https://www.tampermonkey.net/) extension installed in your browser.
2. Click here to install: **[Install KamaisslessImport Userscript](https://raw.githubusercontent.com/Lolergags/Kamaissless_Import/main/KamaisslessImport.user.js)**
3. Tampermonkey will automatically check new releases for updates.

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
