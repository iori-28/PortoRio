window.mountPortorioDetail = () => {
  /* =====================================================
     PROJECT DATA
     ===================================================== */

  const projectData = {

    /* =================================================
       PROCULUS
       ================================================= */

    proculus: {

      category: "Full-Stack · Web & Mobile",

      title: "Proculus",

      subtitle: "E-Procurement Web & Mobile Application",

      image: "assets/projects/proculus/homepr.jpeg",

      overview:
        "Proculus is an E-Procurement platform designed to support tender and procurement processes between administrators and vendors. The system consists of a web-based admin dashboard, vendor web application, and vendor mobile application.",

      tech: [
        "Laravel",
        "PHP",
        "MySQL",
        "Ionic Angular",
        "Tailwind CSS",
        "Bootstrap",
        "JavaScript",
        "Laravel Sanctum"
      ],

      roles: [
        {
          title: "Full-Stack Developer",
          description:
            "Responsible for developing both front-end and back-end functionality for the web application and contributing to the Ionic Angular vendor mobile application. Worked on authentication, vendor functionality, tender management, interfaces, and application integration."
        },

        {
          title: "Team Leader",
          description:
            "Coordinated the development team, distributed tasks, monitored development progress, and helped maintain consistency across the web and mobile components of the application."
        }
      ],

      features: [
        "Admin Dashboard",
        "Vendor Management",
        "Vendor Registration & Approval",
        "Tender Management",
        "Tender Bidding",
        "Document Upload",
        "Notifications",
        "Vendor Mobile Application",
        "Purchase Order PDF Generation"
      ],

      screenshots: [
        {
          image: "assets/projects/proculus/dashboard.jpeg",
          title: "Admin Dashboard"
        },
        {
          image: "assets/projects/proculus/pakettender.png",
          title: "Paket Tender Dashboard"
        },
        {
          image: "assets/projects/proculus/tenderMB.jpeg",
          title: "Tender Mobile"
        },
        {
          image: "assets/projects/proculus/MB.jpeg",
          title: "Mobile Application"
        }
      ],

      technical:
        "The web application uses Laravel as the backend framework with MySQL for data persistence. Laravel Sanctum is used for API authentication, while the Ionic Angular mobile application communicates with the backend through structured API endpoints.",

      challenge:
        "Maintaining communication between the web application, backend services, and mobile application while keeping authentication and data access consistent.",

      solution:
        "Structured the application around dedicated API endpoints and Laravel Sanctum authentication while separating web and mobile responsibilities within the system.",

      process: [
        "Planning",
        "Interface Design",
        "Backend Development",
        "Web Development",
        "Mobile Development",
        "Testing",
        "Deployment"
      ],

      result:
        "Developed an integrated E-Procurement system consisting of web and mobile applications to support tender, vendor, bidding, document, and procurement-related processes.",

      links: {
        github: "https://github.com/Vestegar4/E-Procurement",
        demo: "",
        documentation: ""
      }
    },


    /* =================================================
       HIBITTY
       ================================================= */

    hibitty: {

      category: "Mobile · Personal Project",

      title: "Hibitty",

      subtitle: "Offline Habit Tracking Android Application",

      image: "assets/projects/hibitty/logo.png",

      overview:
        "Hibitty is an Android habit tracking application focused on helping users manage daily habits through habit tracking, daily check-ins, and a streak system. The application is designed to work offline without requiring an internet connection.",

      tech: [
        "Ionic Angular",
        "JavaScript",
        "Capacitor",
        "Local Storage",
        "Android Studio"
      ],

      roles: [
        {
          title: "Mobile Developer",
          description:
            "Responsible for developing the mobile application, implementing the user interface, managing local data storage, and developing the core habit tracking functionality."
        }
      ],

      features: [
        "Habit Tracking",
        "Daily Check-in",
        "Streak System",
        "Offline Support",
        "Local Data Storage",
        "Habit Management"
      ],

      screenshots: [
        {
          image: "assets/projects/hibitty/cover.png",
          title: "Logo"
        },
        {
          image: "assets/projects/hibitty/track2.png",
          title: "Habit Tracking"
        },
        {
          image: "assets/projects/hibitty/streak.png",
          title: "Daily Check-in"
        },
        {
          image: "assets/projects/hibitty/welcome.png",
          title: "welcome page"
        }
      ],

      technical:
        "Hibitty is developed using Ionic Angular and packaged for Android through Capacitor. Local Storage is used to persist habit data directly on the device, allowing the main application functionality to operate without an internet connection.",

      challenge:
        "Implementing an offline-first habit tracking experience while ensuring that user data remains persistent between application sessions.",

      solution:
        "Implemented local data persistence using Local Storage and designed the application's core data flow around local device storage instead of relying on a remote server.",

      process: [
        "Planning",
        "UI Design",
        "Development",
        "Testing",
        "Android Build",
        "Release"
      ],

      result:
        "Developed and released an offline Android habit tracking application with habit management, daily check-ins, streak tracking, and local data persistence.",

      links: {
        github: "https://github.com/iori-28/Hibitty",
        demo: "https://play.google.com/store/apps/details?id=com.habit.hibitty",
        documentation: ""
      }
    },


    /* =================================================
       ECHOES OF GAIA
       ================================================= */

    echoes: {

      category: "Game Development · GEMASTIK XIX 2026",

      title: "Echoes of Gaia: The Living World",

      subtitle: "2D Game Development Project",

      image: "assets/projects/echoes/proses.png",

      overview:
        "Echoes of Gaia: The Living World is a 2D game development project created for the GEMASTIK XIX 2026 Game Development Division. The project focused on gameplay development, creative direction, visual presentation, and team-based development.",

      tech: [
        "Unity",
        "C#",
        "Unity 2D",
        "Game Design",
        "Pixel Art"
      ],

      roles: [
        {
          title: "Team Leader",
          description:
            "Led the development team, established the core game concept and creative direction, guided development activities, and coordinated the team's progress throughout the competition development period."
        }
      ],

      features: [
        "2D Gameplay",
        "Character System",
        "Combat System",
        "Game Environment",
        "User Interface",
        "Pixel Art",
        "Gameplay Mechanics"
      ],

      screenshots: [
        {
          image: "assets/projects/echoes/map1.png",
          title: "Main Gameplay"
        },
        {
          image: "assets/projects/echoes/first.png",
          title: "Character"
        },
        {
          image: "assets/projects/echoes/map2.png",
          title: "Environment"
        },
        {
          image: "assets/projects/echoes/map3.jpeg",
          title: "map"
        }
      ],

      technical:
        "Unity and C# were used to implement gameplay systems, character behavior, environments, user interface components, and other core game mechanics. Unity 2D provided the primary development environment for the game.",

      challenge:
        "Developing a coherent game concept while coordinating multiple development tasks within the limited timeline of a technology competition.",

      solution:
        "Established the main concept and creative direction early, divided responsibilities among team members, and coordinated development progress to maintain consistency between different parts of the game.",

      process: [
        "Concept Development",
        "Game Design",
        "Visual Design",
        "Development",
        "Testing",
        "Submission"
      ],

      result:
        "Developed a playable 2D game prototype for GEMASTIK XIX 2026 while leading the team's development and creative direction.",

      links: {
        github: "https://github.com/iori-28/Echoes-of-Gaia",
        demo: "https://youtu.be/gri83M_e2kw",
        documentation: ""
      }
    },


    /* =================================================
       EVENTSITE
       ================================================= */

    eventsite: {

      category: "Web · Academic Project",

      title: "Eventsite",

      subtitle: "Event Organizer Web Application",

      image: "assets/projects/eventsite/home.jpg",

      overview:
        "Eventsite is a web-based Event Organizer application developed as an academic team project. The application focuses on managing event-related information and supporting event organizer activities through a web interface.",

      tech: [
        "PHP",
        "JavaScript",
        "MySQL",
        "HTML",
        "CSS"
      ],

      roles: [
        {
          title: "Team Leader",
          description:
            "Led the project team while also contributing as a Full-Stack Developer. Responsible for front-end and back-end development, task distribution, development coordination, and handling key implementation tasks."
        },

        {
          title: "Full-Stack Developer",
          description:
            "Contributed to both front-end and back-end development, implementing key features, managing data interactions, and ensuring the application functions as intended."
        }
      ],

      roleTitle:
        "Team Leader & Full-Stack Developer",

      role:
        "Led the project team while also contributing as a Full-Stack Developer. Responsible for front-end and back-end development, task distribution, development coordination, and handling key implementation tasks.",

      features: [
        "Event Management",
        "User Management",
        "Event Information",
        "Data Management",
        "Web-based Interface"
      ],

      screenshots: [
        {
          image: "assets/projects/eventsite/eventMG.jpg",
          title: "Event Management"
        },
        {
          image: "assets/projects/eventsite/cal.png",
          title: "Event Calendar"
        },
        {
          image: "assets/projects/eventsite/detail.png",
          title: "Event Details"
        },
        {
          image: "assets/projects/eventsite/dashboard.png",
          title: "Dashboard"
        }
      ],

      technical:
        "The application uses PHP for server-side processing, JavaScript for client-side interactions, MySQL for data storage, and HTML/CSS for the web interface.",

      challenge:
        "Coordinating the development team while simultaneously handling both front-end and back-end implementation.",

      solution:
        "Divided responsibilities among team members, coordinated development progress, and handled key full-stack implementation tasks to keep the project moving toward completion.",

      process: [
        "Planning",
        "Interface Design",
        "Database Design",
        "Development",
        "Testing",
        "Presentation"
      ],

      result:
        "Developed a functional Event Organizer web application and completed the project as part of an academic team assignment.",

      links: {
        github: "https://github.com/iori-28/EventSite",
        demo: "",
        documentation: ""
      }
    },
  };

  /* =====================================================
     GET PROJECT FROM URL
     ===================================================== */

  const params = new URLSearchParams(window.location.search);

  const projectId = params.get("project");

  const project = Object.hasOwn(projectData, projectId) ? projectData[projectId] : null;
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();


  /* =====================================================
     ELEMENTS
     ===================================================== */

  const projectCategory =
    document.getElementById("projectCategory");

  const projectTitle =
    document.getElementById("projectTitle");

  const projectSubtitle =
    document.getElementById("projectSubtitle");

  const mainProjectImage =
    document.getElementById("mainProjectImage");

  const projectOverview =
    document.getElementById("projectOverview");

  const projectTech =
    document.getElementById("projectTech");

  const projectRoles =
    document.getElementById("projectRoles");

  const projectFeatures =
    document.getElementById("projectFeatures");

  const projectScreenshots =
    document.getElementById("projectScreenshots");

  const projectTechnical =
    document.getElementById("projectTechnical");

  const projectChallenge =
    document.getElementById("projectChallenge");

  const projectSolution =
    document.getElementById("projectSolution");

  const projectProcess =
    document.getElementById("projectProcess");

  const projectResult =
    document.getElementById("projectResult");

  const sidebarProject =
    document.getElementById("sidebarProject");

  const sidebarCategory =
    document.getElementById("sidebarCategory");

  const sidebarRole =
    document.getElementById("sidebarRole");

  const projectLinks =
    document.getElementById("projectLinks");


  /* =====================================================
     INVALID PROJECT
     ===================================================== */

  if (!project) {

    document.title = "Project Not Found | Rio Rasyha Syadzily";

    projectCategory.textContent = "PROJECT NOT FOUND";

    projectTitle.textContent = "Project Not Found";

    projectSubtitle.textContent =
      "The project you are looking for does not exist.";

    mainProjectImage.textContent =
      "Project Not Found";

    projectOverview.textContent =
      "The requested project could not be found.";

    projectTech.innerHTML = "";

    projectRoles.textContent = "";

    projectFeatures.innerHTML = "";

    projectScreenshots.innerHTML = "";

    projectTechnical.textContent = "";

    projectChallenge.textContent = "";

    projectSolution.textContent = "";

    projectProcess.innerHTML = "";

    projectResult.textContent = "";

    sidebarProject.textContent = "-";

    sidebarCategory.textContent = "-";

    sidebarRole.textContent = "-";

    projectLinks.innerHTML = "";

  }


  /* =====================================================
     RENDER PROJECT
     ===================================================== */

  else {

    document.title =
      `${project.title} | Rio Rasyha Syadzily`;

    projectCategory.textContent =
      project.category;

    projectTitle.textContent =
      project.title;

    projectSubtitle.textContent =
      project.subtitle;

    projectOverview.textContent =
      project.overview;

    projectTechnical.textContent =
      project.technical;

    projectChallenge.textContent =
      project.challenge;

    projectSolution.textContent =
      project.solution;

    projectResult.textContent =
      project.result;

    project.roles.forEach(function (role) {

      const roleBox =
        document.createElement("div");

      roleBox.className =
        "role-box";

      const roleTitle =
        document.createElement("strong");

      roleTitle.textContent =
        role.title;

      const roleDescription =
        document.createElement("p");

      roleDescription.textContent =
        role.description;

      roleBox.appendChild(roleTitle);

      roleBox.appendChild(roleDescription);

      projectRoles.appendChild(roleBox);

    });

    sidebarProject.textContent =
      project.title;

    sidebarCategory.textContent =
      project.category;

    sidebarRole.textContent =
      project.roles[0].title;


    /* ================================================
       MAIN IMAGE
       ================================================ */

    if (project.image) {

      const image =
        document.createElement("img");

      image.src = project.image;

      image.alt = project.title;

      image.addEventListener("error", function () {

        this.remove();

        mainProjectImage.textContent =
          "Project Image";

      });

      mainProjectImage.innerHTML = "";

      mainProjectImage.appendChild(image);

    }


    /* ================================================
       TECH STACK
       ================================================ */

    project.tech.forEach(function (tech) {

      const tag =
        document.createElement("span");

      tag.className =
        "tech-tag";

      tag.textContent =
        tech;

      projectTech.appendChild(tag);

    });


    /* ================================================
       FEATURES
       ================================================ */

    project.features.forEach(function (feature) {

      const item =
        document.createElement("li");

      item.textContent =
        feature;

      projectFeatures.appendChild(item);

    });


    /* ================================================
       SCREENSHOTS
       ================================================ */

    project.screenshots.forEach(function (screenshot) {

      const wrapper =
        document.createElement("div");

      wrapper.className =
        "screenshot";

      if (screenshot.image) {

        const image =
          document.createElement("img");

        image.src =
          screenshot.image;

        image.alt =
          screenshot.title;

        image.loading = "lazy";
        image.decoding = "async";

        image.addEventListener("error", function () {

          this.remove();

          wrapper.textContent =
            screenshot.title;

        });

        wrapper.appendChild(image);

      } else {

        wrapper.textContent =
          screenshot.title;

      }

      projectScreenshots.appendChild(wrapper);

    });


    /* ================================================
       DEVELOPMENT PROCESS
       ================================================ */

    project.process.forEach(function (step, index) {

      const wrapper =
        document.createElement("div");

      wrapper.className =
        "process-step";

      const number =
        document.createElement("span");

      number.className =
        "process-number";

      number.textContent =
        index + 1;

      const text =
        document.createElement("span");

      text.textContent =
        step;

      wrapper.appendChild(number);

      wrapper.appendChild(text);

      projectProcess.appendChild(wrapper);

    });


    /* ================================================
       LINKS
       ================================================ */

    if (project.links.github) {

      const github =
        document.createElement("a");

      github.href =
        project.links.github;

      github.target =
        "_blank";

      github.rel =
        "noopener noreferrer";

      github.className =
        "project-link";

      github.textContent =
        "GitHub";

      projectLinks.appendChild(github);

    }


    if (project.links.demo) {

      const demo =
        document.createElement("a");

      demo.href =
        project.links.demo;

      demo.target =
        "_blank";

      demo.rel =
        "noopener noreferrer";

      demo.className =
        "project-link";

      demo.textContent =
        "Demo";

      projectLinks.appendChild(demo);

    }


    if (project.links.documentation) {

      const documentation =
        document.createElement("a");

      documentation.href =
        project.links.documentation;

      documentation.target =
        "_blank";

      documentation.rel =
        "noopener noreferrer";

      documentation.className =
        "project-link";

      documentation.textContent =
        "Documentation";

      projectLinks.appendChild(documentation);

    }

  }

};
