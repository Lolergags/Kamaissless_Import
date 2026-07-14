# KamaisslessImport

A Tampermonkey userscript to easily import Missless data directly into Kamaitachi (`kamai.tachi.ac`) with a single click, completely avoiding the need to download or manually upload JSON files.

## Features
- Injects a "Send to Kamaitachi" button next to the standard export buttons on the `chun.missless.net` playlog page.
- Native, direct memory fetching of the JSON export data.
- Secure, cross-origin POST requests directly to Kamaitachi's import endpoint.
- Secure API token management.

## Installation
1. Ensure you have the [Tampermonkey](https://www.tampermonkey.net/) extension installed in your browser.
2. Open the Tampermonkey dashboard and create a new script.
3. Paste the contents of `KamaisslessImport.user.js` into the editor.
4. Save and enable the script.

## Usage
1. Navigate to your playlog page at `https://chun.missless.net/record/playlog`.
2. Find the new "Send to Kamaitachi" button and click it.
3. On the first run, the script will prompt you for your Kamaitachi API Token. 
   **To generate a token:**
   - Go to your profile on `kamai.tachi.ac` -> Settings -> API.
   - Click "Create New Token".
   - You **only** need to enable the `submit_score` permission.
   - Copy the generated token and paste it into the script prompt.
4. Wait a few seconds for the import to complete. You'll receive a browser alert with the success or failure status.
5. If you ever need to change your API token, use the Tampermonkey extension menu while on the page to run the "Update Kamaitachi API Token" command.
