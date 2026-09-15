// ==========================================================
// Blog Loader
// GitHub Repository Markdown Blog
// ==========================================================

const GITHUB_OWNER = "beeeeeeeluga";
const GITHUB_REPOSITORY = "beeeeeeeluga.github.io";
const BLOG_DIRECTORY = "blog";

const GITHUB_API_URL =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/${BLOG_DIRECTORY}`;


// ==========================================================
// Language
// ==========================================================

function getBlogLanguage() {
    return localStorage.getItem("Jimmy-language") || "zh";
}


function getLocalizedValue(value, language) {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "object") {
        return value[language] || value.zh || value.en || "";
    }

    return "";
}


// ==========================================================
// Escape HTML
// ==========================================================

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================================
// Load Markdown
// ==========================================================

async function loadMarkdown(filename) {

    const url =
        `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/main/${BLOG_DIRECTORY}/${encodeURIComponent(filename)}`;

    console.log("[Blog] Loading Markdown:", url);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Markdown loading failed: HTTP ${response.status} ${response.statusText}`
        );
    }

    return await response.text();
}


// ==========================================================
// Parse Front Matter
// ==========================================================

function parseFrontMatter(markdown) {

    const result = {
        data: {},
        content: markdown
    };

    if (!markdown.startsWith("---")) {
        return result;
    }

    const endIndex = markdown.indexOf("\n---", 3);

    if (endIndex === -1) {
        return result;
    }

    const frontMatter = markdown
        .substring(3, endIndex)
        .trim();

    const content = markdown
        .substring(endIndex + 4)
        .trim();

    frontMatter.split("\n").forEach(line => {

        const separator = line.indexOf(":");

        if (separator === -1) {
            return;
        }

        const key = line
            .substring(0, separator)
            .trim();

        let value = line
            .substring(separator + 1)
            .trim();

        // Remove quotation marks
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.substring(1, value.length - 1);
        }

        result.data[key] = value;
    });

    result.content = content;

    return result;
}


// ==========================================================
// Blog metadata
// ==========================================================

function getPostTitle(data) {

    const language = getBlogLanguage();

    if (language === "en") {
        return (
            data.title_en ||
            data.title_zh ||
            data.title ||
            "Untitled"
        );
    }

    return (
        data.title_zh ||
        data.title_en ||
        data.title ||
        "未命名文章"
    );
}


function getPostDescription(data) {

    const language = getBlogLanguage();

    if (language === "en") {
        return (
            data.description_en ||
            data.description_zh ||
            data.description ||
            ""
        );
    }

    return (
        data.description_zh ||
        data.description_en ||
        data.description ||
        ""
    );
}


function getPostDate(data) {
    return data.date || "";
}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        getBlogLanguage() === "en" ? "en-US" : "zh-TW",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


// ==========================================================
// Get blog files from GitHub
// ==========================================================

async function getBlogFiles() {

    console.log("[Blog] GitHub API:", GITHUB_API_URL);

    const response = await fetch(GITHUB_API_URL, {
        headers: {
            "Accept": "application/vnd.github+json"
        }
    });

    if (!response.ok) {

        let message = "";

        try {
            const errorData = await response.json();
            message = errorData.message || "";
        } catch (_) {
            // Ignore JSON parse error
        }

        throw new Error(
            `GitHub API failed: HTTP ${response.status} ${response.statusText}` +
            (message ? ` - ${message}` : "")
        );
    }

    const files = await response.json();

    if (!Array.isArray(files)) {
        throw new Error("GitHub API did not return a directory listing.");
    }

    return files
        .filter(file =>
            file.type === "file" &&
            file.name.toLowerCase().endsWith(".md")
        )
        .map(file => file.name);
}


// ==========================================================
// Render Markdown
// ==========================================================

function renderMarkdown(markdown) {

    if (typeof marked === "undefined") {
        throw new Error(
            "Marked.js is not loaded. Check the marked CDN script in blog.html."
        );
    }

    return marked.parse(markdown, {
        breaks: true,
        gfm: true
    });
}


// ==========================================================
// Blog list
// ==========================================================

async function loadBlogList() {

    const container = document.getElementById("blog-container");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="blog-loading">
            Loading...
        </div>
    `;

    try {

        const files = await getBlogFiles();

        console.log("[Blog] Markdown files:", files);

        if (files.length === 0) {

            container.innerHTML = `
                <div class="blog-empty">
                    <p>目前還沒有部落格文章。</p>
                </div>
            `;

            return;
        }

        const posts = [];

        for (const filename of files) {

            try {

                const markdown = await loadMarkdown(filename);
                const parsed = parseFrontMatter(markdown);

                posts.push({
                    filename,
                    data: parsed.data,
                    content: parsed.content
                });

            } catch (error) {

                console.error(
                    `[Blog] Failed to load ${filename}:`,
                    error
                );

            }
        }

        posts.sort((a, b) => {

            const dateA = new Date(a.data.date || 0);
            const dateB = new Date(b.data.date || 0);

            return dateB - dateA;
        });


        container.innerHTML = posts.map(post => {

            const title = escapeHtml(
                getPostTitle(post.data)
            );

            const description = escapeHtml(
                getPostDescription(post.data)
            );

            const date = escapeHtml(
                formatDate(getPostDate(post.data))
            );

            return `
                <a
                    class="blog-card"
                    href="blog.html?post=${encodeURIComponent(post.filename)}"
                >
                    <div class="blog-card-content">

                        <div class="blog-card-date">
                            ${date}
                        </div>

                        <h2>
                            ${title}
                        </h2>

                        ${
                            description
                                ? `<p>${description}</p>`
                                : ""
                        }

                    </div>
                </a>
            `;

        }).join("");


    } catch (error) {

        console.error("[Blog] Unable to load blog:", error);

        container.innerHTML = `
            <div class="blog-error">

                <h2>Unable to load blog</h2>

                <p>
                    Please try again later.
                </p>

                <details>
                    <summary>Technical details</summary>

                    <pre>${escapeHtml(error.message)}</pre>

                </details>

            </div>
        `;
    }
}


// ==========================================================
// Single blog post
// ==========================================================

async function loadBlogPost(filename) {

    const container = document.getElementById("blog-container");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="blog-loading">
            Loading...
        </div>
    `;

    try {

        const markdown = await loadMarkdown(filename);

        const parsed = parseFrontMatter(markdown);

        const title = getPostTitle(parsed.data);
        const date = formatDate(getPostDate(parsed.data));

        const html = renderMarkdown(parsed.content);

        document.title = `${title} - Jimmy`;

        container.innerHTML = `
            <article class="blog-post">

                <header class="blog-post-header">

                    <div class="blog-post-date">
                        ${escapeHtml(date)}
                    </div>

                    <h1>
                        ${escapeHtml(title)}
                    </h1>

                </header>

                <div class="blog-post-content">
                    ${html}
                </div>

            </article>
        `;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "[Blog] Unable to load post:",
            error
        );

        container.innerHTML = `
            <div class="blog-error">

                <h2>Unable to load article</h2>

                <p>
                    Please try again later.
                </p>

                <details>
                    <summary>Technical details</summary>

                    <pre>${escapeHtml(error.message)}</pre>

                </details>

            </div>
        `;
    }
}


// ==========================================================
// Language change
// ==========================================================

function reloadBlog() {

    const params = new URLSearchParams(
        window.location.search
    );

    const post = params.get("post");

    if (post) {
        loadBlogPost(post);
    } else {
        loadBlogList();
    }
}


// ==========================================================
// Initialize
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(
        window.location.search
    );

    const post = params.get("post");

    if (post) {
        loadBlogPost(post);
    } else {
        loadBlogList();
    }


    document
        .querySelectorAll("[data-language]")
        .forEach(button => {

            button.addEventListener("click", () => {

                setTimeout(() => {
                    reloadBlog();
                }, 100);

            });

        });

});
