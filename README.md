# YG-GEN — K-POP Fan Song Generator

YG-GEN is a web-based application that allows you to generate full-length, member-wise K-POP songs inspired by popular groups like BLACKPINK and BABYMONSTER. The entire process, from lyric generation to audio rendering, happens directly in your browser.

## Features

- **Group Selection**: Choose from predefined K-POP groups (BLACKPINK, BABYMONSTER, (G)I-DLE, Aespa), select a solo artist, or create a custom unit of 2-3 members.
- **Structured Songs**: Generates songs with a complete structure, including Intro, Verses, Pre-Chorus, Chorus, Rap, Bridge, and Outro.
- **Customizable Lyrics**: Select the language for the lyrics: English, Korean, or a mix of both.
- **Adjustable Length**: Choose the approximate duration of the generated song.
- **Live TTS Playback**: Listen to the generated lyrics with Text-to-Speech (TTS) technology, using your browser's available voices.
- **Audio Rendering**: Render the generated song into a downloadable audio file (`.webm`) using a built-in WebAudio synthesizer.
- **Gallery**: Save your favorite creations to a gallery, stored locally in your browser.
- **Selectable Themes**: Switch between two different UI themes: 'YG Official' (a dark, modern theme) and 'Cute Fan' (a light, pastel theme).

## Technology Stack

This project is a purely client-side application, meaning it runs entirely in your web browser without needing a server.

- **Frontend**: HTML5, CSS3, JavaScript
- **Web APIs**:
    - **WebAudio API**: Used for the audio synthesizer that renders the song.
    - **MediaRecorder API**: Used to capture the rendered audio into a downloadable file.
    - **SpeechSynthesis API**: Powers the live TTS playback feature.
    - **Web Storage API (`localStorage`)**: Used to save and manage the song gallery.

## How to Use

1.  Clone or download this repository.
2.  Open the `index.html` file in your web browser.
3.  Navigate to the **Generator** page from the navigation bar.
4.  Select your desired group, language, and song length.
5.  Click the **"Generate Lyrics"** button to create your song.
6.  Use the control buttons to:
    - **▶ Play Live TTS**: Listen to the song.
    - **🔁 Render WAV**: Generate the downloadable audio file.
    - **💾 Save to Gallery**: Save the song to your local gallery.

## Themes

You can change the look and feel of the application by selecting a theme from the dropdown menu in the header. The available themes are:

-   **YG Official**: A dark theme with neon pink accents.
-   **Cute Fan**: A light theme with pastel colors.

Your theme preference is saved in your browser's local storage.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer

This is a fan-made project created for entertainment and educational purposes. It is not affiliated with, endorsed by, or connected to YG Entertainment, BLACKPINK, BABYMONSTER, or any other artists mentioned. All rights to the original artists and their work belong to their respective owners.
