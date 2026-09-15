/*
==========================================================
Jimmy Website
Main JavaScript - Version 3
==========================================================
*/


const DATA_PATH = "data/";


/*
==========================================================
HTML Escape
==========================================================
*/

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/*
==========================================================
取得目前語言
==========================================================
*/

function getCurrentLanguage() {

    return (
        localStorage.getItem(
            "Jimmy-language"
        ) || "zh"
    );

}


/*
==========================================================
取得雙語資料

English 沒有時 fallback Chinese
==========================================================
*/

function localized(value) {

    if (!value) {

        return "";

    }


    if (typeof value === "string") {

        return value;

    }


    const language =
        getCurrentLanguage();


    if (
        value[language] !== undefined &&
        value[language] !== ""
    ) {

        return value[language];

    }


    return value.zh || "";

}


/*
==========================================================
載入 JSON
==========================================================
*/

async function loadJSON(filename) {

    const response =
        await fetch(
            DATA_PATH + filename
        );


    if (!response.ok) {

        throw new Error(
            `Unable to load ${filename}`
        );

    }


    return await response.json();

}


/*
==========================================================
Project Card
==========================================================
*/

function createProjectCard(
    project,
    large = false
) {

    const title =
        localized(project.title);

    const description =
        localized(
            large
                ? project.longDescription
                : project.description
        );


    const tag =
        project.id
            .replace(/-/g, " ")
            .toUpperCase();


    /*
    有網址
    */

    if (project.url) {

        return `
            <a
                href="${escapeHtml(project.url)}"
                class="${large
                    ? "large-project-card"
                    : "project-card"}"
                target="_blank"
                rel="noopener"
            >

                <div
                    class="${large
                        ? "project-card-content"
                        : ""}"
                >

                    <p class="card-label">
                        ${escapeHtml(tag)}
                    </p>

                    <h2>
                        ${escapeHtml(title)}
                    </h2>

                    <p>
                        ${escapeHtml(description)}
                    </p>

                </div>

                <span class="card-arrow">
                    ↗
                </span>

            </a>
        `;

    }


    /*
    沒有網址
    */

    return `
        <div
            class="${large
                ? "large-project-card"
                : "project-card"}"
        >

            <div
                class="${large
                    ? "project-card-content"
                    : ""}"
            >

                <p class="card-label">
                    ${escapeHtml(tag)}
                </p>

                <h2>
                    ${escapeHtml(title)}
                </h2>

                <p>
                    ${escapeHtml(description)}
                </p>

            </div>

            <span class="card-arrow">
                →
            </span>

        </div>
    `;

}


/*
==========================================================
載入精選 Projects
==========================================================
*/

async function loadFeaturedProjects() {

    const container =
        document.getElementById(
            "featured-projects"
        );


    if (!container) {

        return;

    }


    try {

        const data =
            await loadJSON(
                "projects.json"
            );


        const projects =
            data.projects
                .filter(
                    project =>
                        project.featured === true
                )
                .slice(0, 3);


        container.innerHTML =
            projects
                .map(
                    project =>
                        createProjectCard(
                            project,
                            false
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            error
        );

    }

}


/*
==========================================================
載入全部 Projects
==========================================================
*/

async function loadAllProjects() {

    const container =
        document.getElementById(
            "projects-container"
        );


    if (!container) {

        return;

    }


    try {

        const data =
            await loadJSON(
                "projects.json"
            );


        container.innerHTML =
            data.projects
                .map(
                    project =>
                        createProjectCard(
                            project,
                            true
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            error
        );

    }

}


/*
==========================================================
Link Card
==========================================================
*/

function createLinkCard(link) {

    const title =
        localized(link.title);

    const description =
        localized(link.description);


    const iconHtml =
        link.icon
            ? `<img src="${escapeHtml(link.icon)}" alt="${escapeHtml(localized(link.title))}" class="link-card-icon" />`
            : "";


    return `
        <a
            href="${escapeHtml(link.url)}"
            class="link-card"
            target="_blank"
            rel="noopener"
        >

            ${iconHtml}

            <div>

                <p class="card-label">
                    ${escapeHtml(link.label || "LINK")}
                </p>

                <h2>
                    ${escapeHtml(title)}
                </h2>

                <p>
                    ${escapeHtml(description)}
                </p>

            </div>

            <span class="card-arrow">
                ↗
            </span>

        </a>
    `;

}


/*
==========================================================
載入 Links
==========================================================
*/

async function loadLinks() {

    const container =
        document.getElementById(
            "links-container"
        );


    if (!container) {

        return;

    }


    try {

        const data =
            await loadJSON(
                "links.json"
            );


        container.innerHTML =
            data.links
                .map(
                    createLinkCard
                )
                .join("");


    } catch (error) {

        console.error(
            error
        );

    }

}


/*
==========================================================
語言切換後重新載入動態內容

Blog 已由 blog.js 獨立處理
==========================================================
*/

function reloadDynamicContent() {

    loadFeaturedProjects();

    loadAllProjects();

    loadLinks();

}


/*
==========================================================
Mobile Menu
==========================================================
*/

function setupMobileMenu() {

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );


    const navMenu =
        document.querySelector(
            ".nav-menu"
        );


    if (
        !menuToggle ||
        !navMenu
    ) {

        return;

    }


    menuToggle.addEventListener(
        "click",
        () => {

            navMenu.classList.toggle(
                "open"
            );

        }
    );


    navMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    navMenu.classList.remove(
                        "open"
                    );

                }
            );

        });

}


/*
==========================================================
Active Navigation
==========================================================
*/

function setupActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() ||
        "index.html";


    document
        .querySelectorAll(
            ".nav-menu > a"
        )
        .forEach(link => {

            const href =
                link
                    .getAttribute("href")
                    ?.split("/")
                    .pop();


            if (
                href === currentPage
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

}


/*
==========================================================
Current Year
==========================================================
*/

function setupYear() {

    const year =
        document.getElementById(
            "current-year"
        );


    if (year) {

        year.textContent =
            new Date()
                .getFullYear();

    }

}


/*
==========================================================
Language change observer

i18n.js 更新 localStorage 後，
這裡重新生成 Projects / Links
==========================================================
*/

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            "Jimmy-language"
        ) {

            reloadDynamicContent();

        }

    }
);


/*
==========================================================
Language buttons

同一個頁面內切換語言時，
需要重新生成 JSON 內容。
==========================================================
*/

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-language]"
            );


        if (!button) {

            return;

        }


        /*
        等 i18n.js 更新語言
        */

        setTimeout(
            reloadDynamicContent,
            50
        );

    }
);


/*
==========================================================
Initialize
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupMobileMenu();

        setupActiveNavigation();

        setupYear();

        reloadDynamicContent();

    }
);
