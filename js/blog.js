/*
==========================================================
Jimmy Website
Markdown Blog System - Version 3
==========================================================

功能：

1. 從 blog/index.json 讀取文章清單
2. 自動載入 Markdown
3. 支援 Front Matter
4. 中文 / English
5. English 不存在時 fallback 中文
6. Blog 列表依日期排序
7. 支援 ?post=xxx 開啟文章
8. 不需要為每篇文章建立 HTML
==========================================================
*/


const BLOG_INDEX_URL = "blog/index.json";

const BLOG_DIRECTORY = "blog/";


/*
==========================================================
目前語言
==========================================================
*/

function getBlogLanguage() {

    return (
        localStorage.getItem("Jimmy-language") ||
        "zh"
    );

}


/*
==========================================================
Language fallback
==========================================================
*/

function getLocalizedValue(value) {

    if (!value) {

        return "";

    }


    /*
    如果是普通字串
    */

    if (typeof value === "string") {

        return value;

    }


    const language =
        getBlogLanguage();


    /*
    目前語言
    */

    if (
        value[language] !== undefined &&
        value[language] !== null &&
        value[language] !== ""
    ) {

        return value[language];

    }


    /*
    fallback 中文
    */

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
Markdown HTML Escape
==========================================================
*/

function escapeMarkdownHtml(text) {

    return escapeHtml(text);

}


/*
==========================================================
讀取 Markdown
==========================================================
*/

async function loadMarkdown(filename) {

    const response =
        await fetch(
            BLOG_DIRECTORY + filename
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


    /*
    沒有 Front Matter
    */

    if (
        !markdown.trimStart().startsWith("---")
    ) {

        return result;

    }


    const lines =
        markdown
            .replace(/^\uFEFF/, "")
            .split(/\r?\n/);


    if (
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
    找不到結尾
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


        /*
        忽略空行
        */

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
        移除引號
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
    文章正文
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


    /*
    English
    */

    if (
        language === "en" &&
        metadata.title_en
    ) {

        return metadata.title_en;

    }


    /*
    Chinese
    */

    if (
        metadata.title_zh
    ) {

        return metadata.title_zh;

    }


    /*
    沒有雙語 metadata 時
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
建立 Blog Card
==========================================================
*/

function createBlogCard(
    metadata,
    filename
) {

    const title =
        getPostTitle(metadata);


    const description =
        getPostDescription(metadata);


    const date =
        formatDate(
            metadata.date
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
讀取 Blog Index
==========================================================
*/

async function loadBlogIndex() {

    const response =
        await fetch(
            BLOG_INDEX_URL
        );


    if (!response.ok) {

        throw new Error(
            `Unable to load blog/index.json`
        );

    }


    return await response.json();

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
        讀取文章索引
        */

        const index =
            await loadBlogIndex();


        /*
        index.json 預期格式：

        {
            "posts": [
                "2026-09-15-github-pages.md",
                "2026-09-20-minecraft-development.md"
            ]
        }
        */

        const filenames =
            Array.isArray(index.posts)
                ? index.posts
                : [];


        /*
        沒有文章
        */

        if (
            filenames.length === 0
        ) {

            container.innerHTML = `
                <div class="blog-empty">
                    <p>No blog posts yet.</p>
                </div>
            `;

            return;

        }


        /*
        載入所有 Markdown
        */

        const posts =
            await Promise.all(
                filenames.map(
                    async filename => {

                        try {

                            const markdown =
                                await loadMarkdown(
                                    filename
                                );


                            const parsed =
                                parseFrontMatter(
                                    markdown
                                );


                            return {

                                filename,

                                metadata:
                                    parsed.metadata,

                                content:
                                    parsed.content

                            };

                        } catch (error) {

                            console.error(
                                error
                            );


                            return null;

                        }

                    }
                )
            );


        /*
        移除讀取失敗文章
        */

        const validPosts =
            posts.filter(
                post => post !== null
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
        建立 HTML
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

                <p>
                    Unable to load blog posts.
                </p>

            </div>
        `;

    }

}


/*
==========================================================
Markdown → HTML
==========================================================

這裡使用瀏覽器端 Markdown parser。

需要在 blog.html 加入 marked.js：

<script
    src="https://cdn.jsdelivr.net/npm/marked/marked.min.js">
</script>

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
顯示文章
==========================================================
*/

async function loadBlogPost(filename) {

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
        解析 Front Matter
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
        Markdown HTML
        */

        const articleHtml =
            renderMarkdown(
                parsed.content
            );


        /*
        文章頁
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
                        data-i18n="nav.blog"
                    >
                        ← 我的部落格
                    </a>

                </div>

            </article>

        `;


        /*
        更新頁面 Title
        */

        document.title =
            `${title} — Jimmy`;


        /*
        套用 i18n
        */

        if (
            typeof applyTranslations ===
            "function"
        ) {

            applyTranslations(
                getBlogLanguage()
            );

        }


        /*
        捲回頂部
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
                    ← Back to Blog
                </a>

            </div>

        `;

    }

}


/*
==========================================================
判斷是否正在閱讀文章
==========================================================
*/

function getRequestedPost() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("post");

}


/*
==========================================================
Language change

切換語言後重新載入 Blog。
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
Initialize Blog
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
