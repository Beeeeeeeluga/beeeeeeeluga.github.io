/*
==========================================================
Jimmy Website
Markdown Blog System - Version 3.1
==========================================================

功能：

1. 自動透過 GitHub API 找出 blog/ 裡的 Markdown
2. 不需要 index.json
3. 不需要修改 blog.html
4. 支援 Markdown Front Matter
5. 中文 / English
6. English 不存在時 fallback 中文
7. Blog 列表依日期由新到舊排序
8. 支援 ?post=xxx 開啟文章
9. 每篇文章只需要一個 .md 檔案
==========================================================
*/


/*
==========================================================
GitHub Repository 設定
==========================================================

請修改下面兩個值。

例如：

GitHub：
https://github.com/Jimmy123/Jimmy123.github.io

那麼：

GITHUB_OWNER = "Jimmy123"
GITHUB_REPOSITORY = "Jimmy123.github.io"

==========================================================
*/

const GITHUB_OWNER =
    "beeeeeeeluga";

const GITHUB_REPOSITORY =
    "beeeeeeeluga.github.io";


const BLOG_DIRECTORY =
    "blog";


/*
==========================================================
GitHub API
==========================================================
*/

const GITHUB_API_URL =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/${BLOG_DIRECTORY}`;


/*
==========================================================
目前語言
==========================================================
*/

function getBlogLanguage() {

    return (
        localStorage.getItem(
            "Jimmy-language"
        ) || "zh"
    );

}


/*
==========================================================
取得雙語資料
==========================================================

English 沒有時：

English
   ↓
Chinese
==========================================================
*/

function getLocalizedValue(value) {

    if (!value) {

        return "";

    }


    if (typeof value === "string") {

        return value;

    }


    const language =
        getBlogLanguage();


    if (
        value[language] !== undefined &&
        value[language] !== null &&
        value[language] !== ""
    ) {

        return value[language];

    }


    if (
        value.zh !== undefined &&
        value.zh !== null &&
        value.zh !== ""
    ) {

        return value.zh;

    }


    return "";

}


/*
==========================================================
HTML Escape
==========================================================
*/

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


/*
==========================================================
讀取 Markdown
==========================================================
*/

async function loadMarkdown(filename) {

    const response =
        await fetch(
            `${BLOG_DIRECTORY}/${filename}`
        );


    if (!response.ok) {

        throw new Error(
            `Unable to load Markdown: ${filename}`
        );

    }


    return await response.text();

}


/*
==========================================================
解析 Front Matter
==========================================================

格式：

---
title_zh: 我的文章
title_en: My Article
date: 2026-09-15
description_zh: 中文簡介
description_en: English description
---

文章內容

==========================================================
*/

function parseFrontMatter(markdown) {

    const result = {

        metadata: {},

        content: markdown

    };


    const cleanMarkdown =
        markdown.replace(
            /^\uFEFF/,
            ""
        );


    const lines =
        cleanMarkdown.split(
            /\r?\n/
        );


    /*
    沒有 Front Matter
    */

    if (
        lines.length === 0 ||
        lines[0].trim() !== "---"
    ) {

        return result;

    }


    let endIndex = -1;


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        if (
            lines[i].trim() === "---"
        ) {

            endIndex = i;

            break;

        }

    }


    /*
    沒有找到結束 ---
    */

    if (
        endIndex === -1
    ) {

        return result;

    }


    /*
    解析 metadata
    */

    for (
        let i = 1;
        i < endIndex;
        i++
    ) {

        const line =
            lines[i];


        if (
            !line.trim()
        ) {

            continue;

        }


        const separator =
            line.indexOf(":");


        if (
            separator === -1
        ) {

            continue;

        }


        const key =
            line
                .slice(
                    0,
                    separator
                )
                .trim();


        let value =
            line
                .slice(
                    separator + 1
                )
                .trim();


        /*
        移除單引號 / 雙引號
        */

        if (
            (
                value.startsWith('"') &&
                value.endsWith('"')
            ) ||
            (
                value.startsWith("'") &&
                value.endsWith("'")
            )
        ) {

            value =
                value.slice(
                    1,
                    -1
                );

        }


        result.metadata[key] =
            value;

    }


    /*
    Markdown 正文
    */

    result.content =
        lines
            .slice(
                endIndex + 1
            )
            .join("\n")
            .trim();


    return result;

}


/*
==========================================================
取得文章標題
==========================================================
*/

function getPostTitle(metadata) {

    const language =
        getBlogLanguage();


    if (
        language === "en" &&
        metadata.title_en
    ) {

        return metadata.title_en;

    }


    if (
        metadata.title_zh
    ) {

        return metadata.title_zh;

    }


    /*
    相容單語 title
    */

    if (
        metadata.title
    ) {

        return metadata.title;

    }


    return "Untitled";

}


/*
==========================================================
取得文章 Description
==========================================================
*/

function getPostDescription(metadata) {

    const language =
        getBlogLanguage();


    if (
        language === "en" &&
        metadata.description_en
    ) {

        return metadata.description_en;

    }


    if (
        metadata.description_zh
    ) {

        return metadata.description_zh;

    }


    if (
        metadata.description
    ) {

        return metadata.description;

    }


    return "";

}


/*
==========================================================
日期
==========================================================
*/

function getPostDate(metadata) {

    return metadata.date || "";

}


/*
==========================================================
格式化日期
==========================================================
*/

function formatDate(dateString) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        getBlogLanguage() === "en"
            ? "en-US"
            : "zh-TW",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    );

}


/*
==========================================================
取得 GitHub Blog 檔案列表
==========================================================
*/

async function getBlogFiles() {

    const response =
        await fetch(
            GITHUB_API_URL,
            {
                headers: {
                    "Accept":
                        "application/vnd.github+json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            `GitHub API error: HTTP ${response.status}`
        );

    }


    const files =
        await response.json();


    /*
    只保留 Markdown
    */

    return files.filter(
        file =>
            file.type === "file" &&
            file.name
                .toLowerCase()
                .endsWith(".md")
    );

}


/*
==========================================================
建立 Blog Card
==========================================================
*/

function createBlogCard(
    metadata,
    filename
) {

    const title =
        getPostTitle(
            metadata
        );


    const description =
        getPostDescription(
            metadata
        );


    const date =
        formatDate(
            getPostDate(
                metadata
            )
        );


    return `
        <a
            href="blog.html?post=${encodeURIComponent(filename)}"
            class="blog-card"
        >

            <div class="blog-date">
                ${escapeHtml(date)}
            </div>


            <div class="blog-content">

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


            <span class="card-arrow">
                →
            </span>

        </a>
    `;

}


/*
==========================================================
載入 Blog 列表
==========================================================
*/

async function loadBlogList() {

    const container =
        document.getElementById(
            "blog-container"
        );


    if (!container) {

        return;

    }


    try {

        /*
        從 GitHub API 找出所有 .md
        */

        const files =
            await getBlogFiles();


        /*
        沒有文章
        */

        if (
            files.length === 0
        ) {

            container.innerHTML = `
                <div class="blog-empty">

                    <p>
                        No blog posts yet.
                    </p>

                </div>
            `;

            return;

        }


        /*
        讀取所有文章
        */

        const posts =
            await Promise.all(

                files.map(
                    async file => {

                        try {

                            const markdown =
                                await loadMarkdown(
                                    file.name
                                );


                            const parsed =
                                parseFrontMatter(
                                    markdown
                                );


                            return {

                                filename:
                                    file.name,

                                metadata:
                                    parsed.metadata,

                                content:
                                    parsed.content

                            };

                        } catch (error) {

                            console.error(
                                `Failed to load ${file.name}:`,
                                error
                            );


                            return null;

                        }

                    }
                )

            );


        /*
        移除失敗文章
        */

        const validPosts =
            posts.filter(
                post =>
                    post !== null
            );


        /*
        日期由新到舊
        */

        validPosts.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.metadata.date ||
                        0
                    );


                const dateB =
                    new Date(
                        b.metadata.date ||
                        0
                    );


                return dateB - dateA;

            }
        );


        /*
        產生 Blog Cards
        */

        container.innerHTML =
            validPosts
                .map(
                    post =>
                        createBlogCard(
                            post.metadata,
                            post.filename
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            "Blog loading failed:",
            error
        );


        container.innerHTML = `
            <div class="blog-empty">

                <h2>
                    Unable to load blog
                </h2>

                <p>
                    Please try again later.
                </p>

            </div>
        `;

    }

}


/*
==========================================================
Markdown → HTML
==========================================================
*/

function renderMarkdown(markdown) {

    if (
        typeof marked === "undefined"
    ) {

        console.error(
            "Marked.js is not loaded."
        );


        return `
            <p>
                Markdown renderer is unavailable.
            </p>
        `;

    }


    return marked.parse(
        markdown,
        {
            breaks: true,
            gfm: true
        }
    );

}


/*
==========================================================
載入單篇 Blog
==========================================================
*/

async function loadBlogPost(
    filename
) {

    const container =
        document.getElementById(
            "blog-container"
        );


    if (!container) {

        return;

    }


    try {

        /*
        讀取 Markdown
        */

        const markdown =
            await loadMarkdown(
                filename
            );


        /*
        Front Matter
        */

        const parsed =
            parseFrontMatter(
                markdown
            );


        const metadata =
            parsed.metadata;


        const title =
            getPostTitle(
                metadata
            );


        const description =
            getPostDescription(
                metadata
            );


        const date =
            formatDate(
                metadata.date
            );


        /*
        Markdown → HTML
        */

        const articleHtml =
            renderMarkdown(
                parsed.content
            );


        /*
        建立文章頁
        */

        container.innerHTML = `

            <article class="blog-post">

                <header class="blog-post-header">

                    <p class="blog-date">
                        ${escapeHtml(date)}
                    </p>


                    <h1>
                        ${escapeHtml(title)}
                    </h1>


                    ${
                        description
                            ? `
                                <p class="blog-post-description">
                                    ${escapeHtml(description)}
                                </p>
                            `
                            : ""
                    }

                </header>


                <div class="blog-post-content">

                    ${articleHtml}

                </div>


                <div class="blog-post-back">

                    <a
                        href="blog.html"
                    >
                        ←
                        ${
                            getBlogLanguage() === "en"
                                ? "Back to Blog"
                                : "返回部落格"
                        }
                    </a>

                </div>

            </article>

        `;


        /*
        更新 Browser Title
        */

        document.title =
            `${title} — Jimmy`;


        /*
        回到頂部
        */

        window.scrollTo(
            0,
            0
        );


    } catch (error) {

        console.error(
            "Blog post loading failed:",
            error
        );


        container.innerHTML = `

            <div class="blog-empty">

                <h1>
                    Article Not Found
                </h1>


                <p>
                    Unable to load this blog post.
                </p>


                <a
                    href="blog.html"
                    class="button"
                >
                    ←
                    ${
                        getBlogLanguage() === "en"
                            ? "Back to Blog"
                            : "返回部落格"
                    }
                </a>

            </div>

        `;

    }

}


/*
==========================================================
取得 URL 裡的文章
==========================================================
*/

function getRequestedPost() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(
        "post"
    );

}


/*
==========================================================
語言切換
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


        setTimeout(
            () => {

                const post =
                    getRequestedPost();


                if (post) {

                    loadBlogPost(
                        post
                    );

                } else {

                    loadBlogList();

                }

            },
            100
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

        const post =
            getRequestedPost();


        if (post) {

            loadBlogPost(
                post
            );

        } else {

            loadBlogList();

        }

    }
);
