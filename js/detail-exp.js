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
      proof: [
        { image: "assets/experiences/technovision/lead.jpeg", caption: "Rio" },
        { image: "assets/experiences/technovision/sertificate.pdf", caption: "Certificate" }
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
      proof: []
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

  const id = new URLSearchParams(location.search).get("exp");
  const entry = Object.hasOwn(experienceData, id) ? experienceData[id] : null;
  const $ = (elementId) => document.getElementById(elementId);
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();

  if (!entry) {
    document.title = "Experience Not Found | Rio Rasyha Syadzily";
    $("experienceCategory").textContent = "Not found";
    $("experienceTitle").textContent = "Experience Not Found";
    $("experienceSubtitle").textContent = "The experience you are looking for does not exist.";
    $("experienceOverview").textContent = "Return to the collection to browse every session.";
    ["sidebarOrganization", "sidebarRole", "sidebarPeriod"].forEach((field) => { $(field).textContent = "-"; });
    $("experienceProof").replaceChildren(make("p", "proof-empty", "No documentation available."));
    return;
  }

  document.title = `${entry.title} | Rio Rasyha Syadzily`;
  $("experienceCategory").textContent = `${entry.period} · ${entry.category}`;
  $("experienceTitle").textContent = entry.title;
  $("experienceSubtitle").textContent = entry.subtitle;
  $("experienceOverview").textContent = entry.overview;
  $("sidebarOrganization").textContent = entry.organization;
  $("sidebarRole").textContent = entry.role;
  $("sidebarPeriod").textContent = entry.period;

  if (entry.highlights.length) {
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
  if (!entry.proof.length) {
    proof.replaceChildren(make("p", "proof-empty", "Documentation for this session will be added soon."));
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
