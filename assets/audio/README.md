# Local soundtracks

Main and Projects recordings have been supplied locally; their files are preserved.
The other four recordings still need to be supplied. Use recordings you own or are
licensed to redistribute:

| Section | Default file |
| --- | --- |
| Main | Existing recording under `main/` (exact path in configuration) |
| Projects and every project detail | Existing recording under `projects/` (exact path in configuration) |
| Tech Stack | `techstack.mp3` |
| Studies | `studies.mp3` |
| Experience | `experience.mp3` |
| Contact | `contact.mp3` |

Paths, section names, work titles, composers, performers, source links, licenses, and attribution are configured once in `js/audio-engine.js`, in `tracks`.
Paths resolve relative to the HTML document and work under a static-host subdirectory.
Other browser-decodable audio formats can be used by changing those paths.
Prefer short, well-trimmed loops: Web Audio decodes complete recordings and keeps
forward/reverse buffers for at most two tracks in memory.

Fill the metadata fields on each track in `js/audio-engine.js`; the main footer's
Music Credits dialog renders that configuration. Known work names/composers come
from the supplied filenames. Performer, verified recording source, license, and
attribution are unknown and explicitly marked for owner verification. The
https://classicals.de reference link does not assert the source or license of any
particular recording. A composition's status does not determine a recording's license.

Missing or invalid files display an unavailable message with Retry. Navigation,
project content, and manual record rotation continue to work. Initial load and entering a different sleeve attempt playback; browser restrictions
show Start Music. Stop preserves the current position until Play or a different
sleeve is selected. Each sleeve resumes its own timestamp during the current visit.
Project detail routes share the Projects position and stopped/playing state. Seamless loop boundaries depend on the supplied files.
