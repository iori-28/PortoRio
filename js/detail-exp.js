window.mountPortorioExperience = () => {
  "use strict";

  /* Experience data. To add documentation (certificates, photos, letters),
     place the files in assets/experiences/<folder>/ and list them under `proof`.
     Images (jpg, jpeg, png, webp) and PDFs are both supported:

       proof: [
         { image: "assets/experiences/gemastik/sertificate.pdf", caption: "Participation certificate" },
         { image: "assets/experiences/inau/tents.jpeg", caption: "Tents" }
       ]

     File names must match exactly, including upper/lower case (most web hosts
     treat "photo.JPG" and "photo.jpg" as different files).

     `highlights` is optional; the section only appears when it has items. */
  const experienceData = {
    gemastik: {
      category: "Competition · Game Development",
      title: "GEMASTIK XIX 2026",
      subtitle: "Game Development Division · Team Leader",
      organization: "Universitas Buana Perjuangan Karawang",
      role: "Team Leader",
      period: "August 2026",
      overview: "Represented Universitas Buana Perjuangan Karawang, leading a team building a 2D game with Unity and C#. Responsible for the core concept, creative direction, and team coordination.",
      highlights: [],
      proof: [
        { image: "assets/experiences/gemastik/sertificate.pdf", caption: "Participation certificate" }
      ],
      related: { label: "Echoes of Gaia project", href: "detail_PJ.html?project=echoes" }
    },
    technovision: {
      category: "Competition · E-Procurement",
      title: "Technovision",
      subtitle: "Full-Stack Developer · E-Procurement",
      organization: "Technovision",
      role: "Full-Stack Developer",
      period: "May — June 2026",
      overview: "Developed the Laravel, PHP, Tailwind CSS, and Bootstrap web application, contributed to the Ionic Angular mobile app, and presented the project to industry professionals.",
      highlights: [],
      description: "Participated in the Technovision competition, where I developed a full-stack web application using Laravel, PHP, Tailwind CSS, and Bootstrap. I also contributed to the development of an Ionic Angular mobile app and presented the project to industry professionals.",
      proof: [
        { image: "assets/experiences/technovision/lead.jpeg", caption: "Rio" },
        { image: "assets/experiences/technovision/sertificate.pdf", caption: "Certificate" },
        { image: "assets/experiences/technovision/classA.jpeg", caption: "Class A" },
        { image: "assets/experiences/technovision/team.jpeg", caption: "Team Dartd" }
      ],
      related: { label: "Proculus project", href: "detail_PJ.html?project=proculus" }
    },
    "bem-fik": {
      category: "Organization",
      title: "BEM FIK UBP",
      subtitle: "Secretary",
      organization: "BEM FIK UBP",
      role: "Secretary",
      period: "July 2026 — Present",
      overview: "Manage administration, documentation, correspondence, and organizational records to support internal activities.",
      highlights: [],
      proof: [
        { image: "assets/experiences/bem/bem_Rio.jpeg", caption: "Pelantikan BEM & BLM FIK UBP 2026" },
        { image: "assets/experiences/bem/bem_Rio3.jpeg", caption: "Pelantikan BEM & BLM FIK UBP 2026" },
        { image: "assets/experiences/bem/bem_Rio2.jpeg", caption: "BEM FIK UBP 2026 dan DPM FIK" },
        { image: "assets/experiences/bem/myself.jpg", caption: "Rio - PKKMB 2026" }
      ]
    },
    inauguration: {
      category: "Event",
      title: "FIK UBP Inauguration 2026",
      subtitle: "Secretary",
      organization: "FIK UBP",
      role: "Secretary",
      period: "November 2026",
      overview: "Manage administration, documentation, correspondence, and organizational records to support internal activities.",
      highlights: [],
      proof: [
        { image: "assets/experiences/inau/api_inau.JPG", caption: "Api Unggun Pengukuhan" },
        { image: "assets/experiences/inau/myself.jpeg", caption: "Rio" },
        { image: "assets/experiences/inau/tents.jpeg", caption: "Tents" },
        { image: "assets/experiences/inau/together.JPG", caption: "The Participants and Committees" }
      ]
    },
    pom: {
      category: "Event",
      title: "Pekan Olahraga Mahasiswa",
      subtitle: "Secretary",
      organization: "Pekan Olahraga Mahasiswa",
      role: "Secretary",
      period: "August — September 2026",
      overview: "Managed administrative documentation and coordination, preparing supporting materials and resources throughout the event.",
      highlights: [],
      proof: [
        { image: "assets/experiences/pom/sertificate.png", caption: "Certificate as Secretary" }
      ]
    },
    "ukm-bahasa": {
      category: "Organization",
      title: "UKM Bahasa",
      subtitle: "Member",
      organization: "UKM Bahasa",
      role: "Member",
      period: "September 2025 — Present",
      overview: "Participate in structured Japanese and English learning activities, including practice sessions, quizzes, and assessments.",
      highlights: [],
      proof: []
    },
    itska: {
      category: "Organization",
      title: "ITSKA — SMAN 1 Karawang",
      subtitle: "Member",
      organization: "SMAN 1 Karawang",
      role: "Member",
      period: "July 2023 — March 2024",
      overview: "Participated in student organization activities and technology initiatives within the school environment.",
      highlights: [],
      proof: []
    }
  };

  /* Studies use the same page: detail_exp.html?study=<id>. Every field except
     title is optional; empty rows and sections are hidden.

       status:     "In progress" / "Upcoming" / "Completed" (shown as a label)
       highlights: what you have learned so far
       proof:      certificates, notes, screenshots (images or PDFs) */
  const studyData = {
    rails: {
      status: "In progress",
      category: "Learning list",
      title: "Ruby on Rails",
      subtitle: "Web application development",
      focus: "Web app development",
      overview: "Currently building Freshlio Finance with Ruby on Rails for web app development.",
      highlights: [],
      proof: []
    },

    yachiyo: {
      status: "In progress",
      category: "Learning list",
      title: "Yachiyo GenAI",
      subtitle: "Generative Artificial Intelligence",
      focus: "Generative AI",
      overview: "Currently building Yachiyo GenAI for generative artificial intelligence chatbots.",
      highlights: [],
      proof: []
    }
  };

  const params = new URLSearchParams(location.search);
  const study = params.has("study");
  const id = study ? params.get("study") : params.get("exp");
  const data = study ? studyData : experienceData;
  const entry = Object.hasOwn(data, id) ? data[id] : null;
  const copy = study ? {
    kind: "Study", back: ["index.html#studies", "Back to Studies"], sidebar: "Study Information",
    rows: [["Source", "organization"], ["Focus", "focus"], ["Period", "period"]],
    highlights: "What I've learned", proof: "Notes & documentation",
    empty: "Notes and documentation will be added as this study progresses."
  } : {
    kind: "Experience", back: ["index.html#experience", "Back to Experience"], sidebar: "Session Information",
    rows: [["Organization", "organization"], ["Role", "role"], ["Period", "period"]],
    highlights: "Highlights", proof: "Documentation",
    empty: "Documentation for this session will be added soon."
  };
  const $ = (elementId) => document.getElementById(elementId);
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();
  const back = document.querySelector(".back-button");
  if (back) { back.href = copy.back[0]; back.textContent = copy.back[1]; }
  document.querySelector(".sidebar-card h3").textContent = copy.sidebar;
  $("experienceHighlightsSection").querySelector("h2").textContent = copy.highlights;
  $("experienceProof").closest(".detail-section").querySelector("h2").textContent = copy.proof;
  const rowIds = ["sidebarOrganization", "sidebarRole", "sidebarPeriod"];

  if (!entry) {
    document.title = `${copy.kind} Not Found | Rio Rasyha Syadzily`;
    $("experienceCategory").textContent = "Not found";
    $("experienceTitle").textContent = `${copy.kind} Not Found`;
    $("experienceSubtitle").textContent = `The ${copy.kind.toLowerCase()} you are looking for does not exist.`;
    $("experienceOverview").textContent = "Return to the collection to browse everything.";
    rowIds.forEach((field, index) => { $(field).textContent = "-"; $(field).previousElementSibling.textContent = copy.rows[index][0]; });
    $("experienceProof").replaceChildren(make("p", "proof-empty", "No documentation available."));
    return;
  }

  document.title = `${entry.title} | Rio Rasyha Syadzily`;
  $("experienceCategory").textContent = [entry.period, entry.category].filter(Boolean).join(" · ");
  if (entry.status) $("experienceCategory").append(" ", make("span", "status-tag", entry.status));
  $("experienceTitle").textContent = entry.title;
  $("experienceSubtitle").textContent = entry.subtitle || "";
  $("experienceOverview").textContent = entry.overview || "";
  $("experienceOverview").closest(".detail-section").hidden = !entry.overview;
  rowIds.forEach((field, index) => {
    const [label, key] = copy.rows[index];
    $(field).previousElementSibling.textContent = label;
    $(field).textContent = entry[key] || "";
    $(field).closest(".sidebar-item").hidden = !entry[key];
  });

  if (entry.highlights?.length) {
    $("experienceHighlightsSection").hidden = false;
    $("experienceHighlights").replaceChildren(...entry.highlights.map((text) => make("li", "", text)));
  }

  // PDFs embed where the browser has a built-in viewer (most desktop browsers);
  // elsewhere (e.g. Android) an embed can render blank or start a download, so
  // a document card links to the file instead.
  function renderPdf(item) {
    const figure = make("figure", "screenshot proof-item proof-pdf");
    if (navigator.pdfViewerEnabled) {
      const frame = make("iframe", "proof-frame");
      frame.src = `${item.image}#view=Fit&toolbar=0&navpanes=0`;
      frame.title = item.caption;
      frame.loading = "lazy";
      figure.append(frame);
    } else {
      const sheet = make("div", "proof-sheet");
      sheet.setAttribute("aria-hidden", "true");
      sheet.append(make("span", "", "PDF"));
      figure.append(sheet);
    }
    const open = make("a", "proof-open", "Open PDF");
    open.href = item.image;
    open.target = "_blank";
    open.rel = "noopener";
    open.setAttribute("aria-label", `Open PDF: ${item.caption}`);
    figure.append(make("figcaption", "", item.caption), open);
    return figure;
  }

  const proof = $("experienceProof");
  if (!entry.proof?.length) {
    proof.replaceChildren(make("p", "proof-empty", copy.empty));
  } else {
    proof.replaceChildren(...entry.proof.map((item) => {
      if (/\.pdf$/i.test(item.image)) return renderPdf(item);
      const figure = make("figure", "screenshot proof-item");
      const link = make("a", "proof-link");
      link.href = item.image;
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("aria-label", `Open full size: ${item.caption}`);
      const image = make("img");
      image.src = item.image;
      image.alt = item.caption;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => link.replaceWith(make("span", "proof-missing", "Image unavailable")));
      link.append(image);
      figure.append(link, make("figcaption", "", item.caption));
      return figure;
    }));
  }

  if (entry.related) {
    const link = make("a", "project-link", entry.related.label);
    link.href = entry.related.href;
    $("experienceLinks").replaceChildren(link);
  }
};
