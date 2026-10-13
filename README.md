# PortoRio

**A Developer's Discography — An Interactive Vinyl Portfolio**

PortoRio is a personal developer portfolio built around a playable vinyl record collection. Warm paper tones, editorial typography, and tactile turntable interactions bring projects, skills, and personal background into one retro music-inspired experience.

## About the Project

Each record sleeve represents a chapter in the developer's journey. Selecting a sleeve changes the record, reveals a portfolio section, and selects its soundtrack. Visitors can read the collection, explore individual projects, or take control of the turntable themselves.

Developed and maintained by **Riora**, PortoRio explores frontend creativity, interactive design, and user experience while keeping the portfolio readable and straightforward to navigate.

## Features

### Interactive Vinyl Turntable

- Automatic record rotation during playback, with Play, Stop, and playback status controls.
- A tonearm that moves onto the record, follows playback progress, and returns to rest when stopped.
- Mouse, touch, and pen rotation in either direction, with release momentum.
- DJ-style scratching through the current recording using forward and reversed audio buffers; releasing the record resumes playback.
- Keyboard controls, visible focus indicators, and reduced-motion support. Dragging is never required to navigate.

### Vinyl-Specific Soundtracks

- Six separately configured local soundtracks, one for each portfolio section.
- Automatic playback attempts when entering a different sleeve, with independent resume positions and continuous looping.
- Stop pauses without rewinding. Selecting another sleeve starts or resumes that section's track.
- One persistent audio engine keeps the Projects soundtrack playing during internal project-detail navigation, including returning to the collection.
- A **Start Music** fallback for blocked autoplay and a **Retry soundtrack** control for loading failures.

Playback positions are remembered during the current in-app visit. Refreshing, opening a new tab, or leaving the site starts a new playback session. Loop transitions depend on the recording itself.

### Audio Frequency Visualizer

- Real frequency data from the shared Web Audio analyser drives the bars.
- Project-detail visualizers fill the player's inner width and adapt their bar count to the available space.
- Bars follow the active soundtrack and scratching, settle when stopped, and remain static with reduced motion.

### Portfolio Navigation

- Animated sleeve selection for **Main**, **Projects Discography**, **Tech Stack**, **Studies**, **Experience**, and **Contact**.
- Responsive sleeve navigation and browser Back/Forward support.
- Individual project pages for **Proculus**, **Hibitty**, **Echoes of Gaia**, and **EventSite**, with descriptions, screenshots, technology lists, and project links.
- Technology cards with hover, keyboard, and tap interactions; project image and unknown-project fallbacks.

### Music Credits

- A compact editorial dialog with section navigation and one recording's details at a time.
- Desktop sidebar navigation and a horizontally scrollable mobile selector.
- Keyboard selection, focus containment and restoration, Escape, Close, and backdrop dismissal.
- Opens on the current vinyl's credits. **Browsing Music Credits never changes the playing song or its playback position.**

## Tech Stack

- **HTML5 and SVG** for semantic content and turntable artwork.
- **CSS3** with custom properties, Grid, Flexbox, responsive layouts, and transitions.
- **Vanilla JavaScript (ES6+)** with classic scripts and native browser APIs.
- **Web Audio API** for decoding, looping, scratching, and frequency analysis.
- **Pointer Events**, **requestAnimationFrame**, and the **Web Animations API** for direct interaction and motion.
- **Fetch**, the **History API**, and **ResizeObserver** for internal navigation and responsive visualization.

No frontend framework, third-party JavaScript runtime library, package installation, or bundler is required. Fonts use system stacks. Frameworks listed on project cards describe the showcased projects, not PortoRio's dependencies.

If Web Audio is unavailable, the engine falls back to native audio playback; reverse scratch audio and live frequency analysis require Web Audio.

## Project Structure

```text
.
├── index.html                 # Collection, turntable, sections, and credits dialog
├── detail_PJ.html             # Shared project-detail template
├── README.md
├── css/
│   ├── index.css              # Homepage layout and typography
│   ├── vinyl.css              # Sleeves and turntable styling
│   ├── playback.css           # Shared audio controls, spectrum, and credits
│   ├── detail-base.css        # Base project-detail styles
│   └── detail.css             # Detail theme and responsive overrides
├── js/
│   ├── app.js                 # Page mounting, internal routing, shared controls
│   ├── audio-engine.js        # Persistent player and soundtrack configuration
│   ├── index.js               # Vinyl interaction and collection navigation
│   └── detail.js              # Project data and rendering
└── assets/
    ├── audio/                 # Local recordings, organized by section
    ├── pfp/                   # Profile image
    ├── projects/              # Project images and screenshots
    ├── tech/                  # Technology icons and third-party notices
    └── record.svg             # Record mark and favicon
```

Both pages load `js/app.js`, which initializes the shared engine and page scripts. Internal navigation replaces the view while keeping the audio engine alive. Project URLs retain the form `detail_PJ.html?project=hibitty`; supported IDs are `proculus`, `hibitty`, `echoes`, and `eventsite`.

## Getting Started

### Prerequisites

- Git to clone the repository.
- A modern browser.
- Python 3 for the local server below, or an equivalent static server such as VS Code Live Server.

### Local Setup

The configured Git remote is `iori-28/iori-28.github.io`; the project name is PortoRio. <!-- changed to iori-28/PortoRio

```sh
git clone https://github.com/iori-28/PortoRio
cd iori-28.github.io
python -m http.server 8000 --bind 127.0.0.1
```

On systems where Python 3 is named `python3`, use that command instead. Open the cloned folder in your editor, then visit **http://127.0.0.1:8000/**. Keep the server running while browsing; press Ctrl+C to stop it.

Use an HTTP server rather than opening the HTML through `file://`, because audio loading and internal page navigation use Fetch. There is no npm install or build step.

### Validation and Hosting

If Node.js is available, run the existing scripts through its syntax checker:

```sh
node --check js/app.js
node --check js/audio-engine.js
node --check js/index.js
node --check js/detail.js
git diff --check
```

Node.js is optional tooling, not a runtime dependency. No package-based lint, type-check, or production-build commands are configured.

For a manual smoke test, visit all six sleeves and four project routes, try Play/Stop and scratching, resize the viewport, and check keyboard navigation and Music Credits without interrupting playback.

Serve the repository root on a static host with `index.html` as the entry page. Keep `detail_PJ.html`, `css/`, `js/`, and `assets/` at their existing relative paths. No server-side application or custom build output directory is required; hosting activation is configured separately.

## How to Use

1. Open PortoRio. If your browser blocks audible autoplay, choose **Start Music**.
2. Select a vinyl sleeve to explore its portfolio section and soundtrack.
3. Use **Play** or **Stop** below the turntable. Stop retains the current position.
4. Drag around the record to rotate it. During playback, move forward or backward to scratch; release to resume. While stopped, rotation remains silent.
5. Open a project from **Projects Discography**. Its soundtrack continues during internal navigation; detail pages provide their own Play/Stop controls and visualizer.
6. Open **Music Credits** in the main portfolio footer to browse recording information independently of playback.

With keyboard focus on the record, Left/Right arrows rotate it and Space or Escape stops playback. Sleeve links and playback buttons are also keyboard accessible. Browser audio policies may still require an explicit playback gesture.

## Music and Attribution

The `tracks` object in [js/audio-engine.js](js/audio-engine.js) is the shared configuration for audio paths and Music Credits. Its keys are `home`, `projects`, `skills`, `studies`, `experience`, and `contact`. Local MP3 files are present under `assets/audio/main/`, `projects/`, `techStack/`, `studies/`, `experience/`, and `contact/`, respectively. Paths resolve relative to the HTML document.

The following are **supplied configuration credits, pending recording-specific verification**. The code currently marks every title as provisional and leaves each recording's `source` and `attribution` fields unset. License links below preserve the configured references; they do not establish that a particular audio file is covered by those terms.

| Record               | Configured work / composer                                                                    | Supplied performer                                            | Configured license or status reference                                       |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Main                 | *The Four Seasons: Spring, Violin Concerto in E major, Op. 8 No. 1, RV 269* — Antonio Vivaldi | [John Harrison](https://johnharrison.cc)                      | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)              |
| Projects Discography | *The Marriage of Figaro* — Wolfgang Amadeus Mozart                                            | The Czech National Symphony Orchestra                         | [Public Domain Mark 1.0](https://creativecommons.org/publicdomain/mark/1.0/) |
| Tech Stack           | *Peer Gynt Suite No. 1, Op. 46 — I. Morning* — Edvard Grieg                                   | The Czech National Symphony Orchestra                         | [Public Domain Mark 1.0](https://creativecommons.org/publicdomain/mark/1.0/) |
| Studies              | *Jeux d'eau — M. 30* — Maurice Ravel                                                          | Gregor Quendel                                                | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)              |
| Experience           | *Sonata in E Minor, K 304, for Piano and Violin* — Wolfgang Amadeus Mozart                    | The Park Sisters (Mi-Young Park, violin; Pong-Hi Park, piano) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)              |
| Contact              | *Bach — Notebook for Anna Madgalena* (as configured) — Johann Sebastian Bach                  | Gregor Quendel                                                | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)              |

The Contact filename identifies *Minuet in G major, BWV Anh 114*, arranged for piano, while the configured title names the notebook. Its exact work title and composer attribution need verification along with the recording credits.

[Classicals.de](https://classicals.de) every tracks are from here, thanks to Classical.de.

Before reusing or redistributing recordings, confirm their source pages, performer credits, applicable terms, and required attribution. CC BY-NC and CC BY-SA have different conditions; the Public Domain Mark is a status marker, not a license grant. A composition's status alone does not establish the rights to a recording. PortoRio does not make a blanket copyright-free or royalty-free claim.

## Screenshots / Preview

Portfolio preview screenshots have not yet been added to the versioned assets.

<!-- TODO: Add repository-hosted screenshots of the Main turntable, Projects Discography, a project detail page, and the Music Credits modal. -->

## Version History

### V1.0 — Initial Portfolio

A conventional personal portfolio with background, skills, projects, and individual project-detail pages using query-parameter routes.

### V2.0 — Vinyl Experience

Introduced the retro record collection, sleeve navigation, animated record changes, manual rotation with momentum, and matching project liner-note styling.

### V2.1 — Interactive Audio Experience

Added vinyl-specific soundtracks, audio-reactive DJ scratching, a functional tonearm, automatic rotation, looping, independent resume positions, and persistent playback during project navigation. Shared frequency visualizers, project-detail audio controls, and the editorial Music Credits interface complete the audio experience.

## Author

**Rio Rasyha Syadzily** is an Informatics Engineering student and developer interested in full-stack development, creative frontend experiences, and interactive applications.

- [GitHub](https://github.com/iori-28)
- [LinkedIn](https://www.linkedin.com/in/rio-rasyha-syadzily)

## License

No root `LICENSE` file is present; licensing for PortoRio's source code has not been specified.

Third-party music is separate from source-code licensing; see [Music and Attribution](#music-and-attribution). Technology icon sources and notices are documented in [assets/tech/README.md](assets/tech/README.md), with the [Devicon MIT notice](assets/tech/LICENSE-devicon.txt) and [Simple Icons CC0 notice](assets/tech/LICENSE-simple-icons.txt) retained locally.
