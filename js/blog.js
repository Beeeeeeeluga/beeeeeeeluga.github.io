// ==========================================================
// Blog Loader
// Markdown + Manual index.json
// ==========================================================

const BLOG_INDEX_URL = "blog/index.json";


// ==========================================================
// Language
// ==========================================================

function getBlogLanguage() {
    return localStorage.getItem("Jimmy-language") || "zh";
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
// Get localized title
// ==========================================================

function getBlogLocalizedValue(data, language) {

    if (!data) {
        return "";
    }

    if (language === "en") {

        return (
            data.title_en ||
            data.title_zh ||
            ""
        );

    }

    return (
        data.title_zh ||
        data.title_en ||
        ""
    );
}


// ==========================================================
// Get localized description
// ==========================================================

function getLocalizedDescription(data, language) {

    if (!data) {
        return "";
    }

    if (language === "en") {

        return (
            data.description_en ||
            data.description_zh ||
            ""
        );

    }

    return (
        data.description_zh ||
        data.description_en ||
        ""
    );
}


// ==========================================================
// Load blog index
// ==========================================================

async function getBlogPosts() {

    const response = await fetch(
        `${BLOG_INDEX_URL}?t=${Date.now()}`
    );

    if (!response.ok) {

        throw new Error(
            `Unable to load blog index: HTTP ${response.status}`
        );

    }

    const posts = await response.json();

    if (!Array.isArray(posts)) {

        throw new Error(
            "Blog index format is invalid."
        );

    }

    return posts;
}


// ==========================================================
// Load Markdown
// ==========================================================

async function loadMarkdown(filename) {

    const response = await fetch(
        `blog/${encodeURIComponent(filename)}?t=${Date.now()}`
    );

    if (!response.ok) {

        throw new Error(
            `Unable to load Markdown: HTTP ${response.status}`
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


    const endIndex =
        markdown.indexOf("\n---", 3);


    if (endIndex === -1) {
        return result;
    }


    const frontMatter =
        markdown
            .substring(3, endIndex)
            .trim();


    const content =
        markdown
            .substring(endIndex + 4)
            .trim();


    frontMatter
        .split("\n")
        .forEach(line => {

            const separator =
                line.indexOf(":");


            if (separator === -1) {
                return;
            }


            const key =
                line
                    .substring(0, separator)
                    .trim();


            let value =
                line
                    .substring(separator + 1)
                    .trim();


            if (
                (value.startsWith('"') &&
                    value.endsWith('"')) ||

                (value.startsWith("'") &&
                    value.endsWith("'"))
            ) {

                value =
                    value.substring(
                        1,
                        value.length - 1
                    );

            }


            result.data[key] = value;

        });


    result.content = content;

    return result;
}


// ==========================================================
// Date
// ==========================================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        getBlogLanguage() === "en"
            ? "en-US"
            : "zh-TW",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


// ==========================================================
// Render Markdown
// ==========================================================

function renderMarkdown(markdown) {

    if (typeof marked === "undefined") {

        throw new Error(
            "Marked.js is not loaded."
        );

    }


    return marked.parse(
        markdown,
        {
            breaks: true,
            gfm: true
        }
    );
}


// ==========================================================
// Blog List
// ==========================================================

async function loadBlogList() {

    const container =
        document.getElementById(
            "blog-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="blog-loading">
            Loading...
        </div>
    `;


    try {

        const posts =
            await getBlogPosts();


        const language =
            getBlogLanguage();


        if (posts.length === 0) {

            container.innerHTML = `
                <div class="blog-empty">

                    <p>
                        ${
                            language === "en"
                                ? "There are no blog posts yet."
                                : "目前還沒有部落格文章。"
                        }
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML =
            posts
                .map(post => {

                    const title =
                        getBlogLocalizedValue(
                            post,
                            language
                        );


                    const description =
                        getLocalizedDescription(
                            post,
                            language
                        );


                    const date =
                        formatDate(
                            post.date
                        );


                    return `
                        <a
                            class="blog-card"
                            href="blog.html?post=${encodeURIComponent(post.filename)}"
                        >

                            <div class="blog-card-content">

                                ${
                                    date
                                        ? `
                                            <div class="blog-card-date">
                                                ${escapeHtml(date)}
                                            </div>
                                          `
                                        : ""
                                }

                                <h2>
                                    ${escapeHtml(title)}
                                </h2>

                                ${
                                    description
                                        ? `
                                            <p>
                                                ${escapeHtml(description)}
                                            </p>
                                          `
                                        : ""
                                }

                            </div>

                        </a>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "[Blog] Unable to load blog:",
            error
        );


        container.innerHTML = `
            <div class="blog-error">

                <h2>
                    Unable to load blog
                </h2>

                <p>
                    Please try again later.
                </p>

                <details>

                    <summary>
                        Technical details
                    </summary>

                    <pre>
${escapeHtml(error.message)}
                    </pre>

                </details>

            </div>
        `;

    }
}


// ==========================================================
// Single Blog Post
// ==========================================================

async function loadBlogPost(filename) {

    const container =
        document.getElementById(
            "blog-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="blog-loading">
            Loading...
        </div>
    `;


    try {

        const markdown =
            await loadMarkdown(filename);


        const parsed =
            parseFrontMatter(
                markdown
            );


        const language =
            getBlogLanguage();


        let title;


        if (language === "en") {

            title =
                parsed.data.title_en ||
                parsed.data.title_zh ||
                parsed.data.title ||
                "Untitled";

        } else {

            title =
                parsed.data.title_zh ||
                parsed.data.title_en ||
                parsed.data.title ||
                "未命名文章";

        }


        const date =
            formatDate(
                parsed.data.date
            );


        const html =
            renderMarkdown(
                parsed.content
            );


        document.title =
            `${title} - Jimmy`;


        container.innerHTML = `
            <article class="blog-post">

                <header class="blog-post-header">

                    ${
                        date
                            ? `
                                <div class="blog-post-date">
                                    ${escapeHtml(date)}
                                </div>
                              `
                            : ""
                    }

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

                <h2>
                    Unable to load article
                </h2>

                <p>
                    Please try again later.
                </p>

                <details>

                    <summary>
                        Technical details
                    </summary>

                    <pre>
${escapeHtml(error.message)}
                    </pre>

                </details>

            </div>
        `;

    }
}


// ==========================================================
// Reload
// ==========================================================

function reloadBlog() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const post =
        params.get("post");


    if (post) {

        loadBlogPost(post);

    } else {

        loadBlogList();

    }
}


// ==========================================================
// Initialize
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const post =
            params.get("post");


        if (post) {

            loadBlogPost(post);

        } else {

            loadBlogList();

        }


        document
            .querySelectorAll(
                "[data-language]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        setTimeout(
                            () => {
                                reloadBlog();
                            },
                            100
                        );

                    }
                );

            });

    }
);
