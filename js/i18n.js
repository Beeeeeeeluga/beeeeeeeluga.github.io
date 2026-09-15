/*
==========================================================
Jimmy Website
i18n System
==========================================================

功能：

1. 中文 / English 切換
2. localStorage 記住語言
3. 自動偵測瀏覽器語言
4. 英文不存在時自動 fallback 到中文
5. 支援 data-i18n
==========================================================
*/


const translations = {

    /*
    ======================================================
    中文
    ======================================================
    */

    zh: {

        nav: {

            about: "關於我",

            projects: "我的專案",

            links: "連結列表",

            blog: "我的部落格"

        },


        home: {

            eyebrow: "你好，我是",

            role: "Developer · Coding Student",

            description:
                "喜歡研究程式設計、Web 開發與 Minecraft 相關技術。",

            projects: "我的專案",

            blog: "閱讀部落格",

            featuredProjects: "精選專案",

            viewAll: "查看全部 →"

        },


        about: {

            title: "關於我",

            description:
                "我是一名喜歡研究程式設計與網路技術的學生。平時會製作網站、Minecraft 相關工具與各種自己感興趣的專案。",

            description2:
                "我喜歡從實際的問題出發，慢慢研究技術並將它實作出來。"

        },


        pages: {

            projects: "我的專案",

            projectsDescription:
                "我正在製作或曾經製作的一些專案。",

            links: "連結列表",

            linksDescription:
                "我的網站、社群與其他相關連結。",

            blog: "我的部落格",

            blogDescription:
                "我的開發紀錄、技術筆記與一些想法。"

        },


        projects: {

            xhakyialk: {

                title: "xhakyialk",

                description:
                    "Minecraft 社群網站與相關服務。",

                longDescription:
                    "Minecraft 社群網站，提供伺服器資訊、社群內容以及各種 Minecraft 相關服務。"

            },


            minecraftMap: {

                title: "Minecraft Web Map",

                description:
                    "使用 uNmINeD 建立 Minecraft 世界地圖。",

                longDescription:
                    "使用 uNmINeD 將 Minecraft 世界轉換成可以透過瀏覽器查看的互動式地圖。"

            },


            bridge: {

                title: "BedrockBridge Plugins",

                description:
                    "Minecraft Bedrock Edition 的自訂插件開發。",

                longDescription:
                    "為 Minecraft Bedrock Edition 開發的 JavaScript 插件。"

            },


            website: {

                title: "Personal Website",

                description:
                    "使用 HTML、CSS 與 JavaScript 建立的個人網站。"

            }

        },


        links: {

            github:
                "我的程式碼與開源專案。",

            xhakyialk:
                "Minecraft 社群網站。",

            discord:
                "我的 Discord 社群。"

        },


        blog: {

            post1: {

                title:
                    "建立我的 GitHub Pages",

                description:
                    "開始建立自己的個人網站，並研究 GitHub Pages 的使用方式。"

            },


            post2: {

                title:
                    "我的 Minecraft 開發紀錄",

                description:
                    "記錄 Minecraft 相關插件與工具的開發過程。"

            }

        }

    },


    /*
    ======================================================
    English
    ======================================================
    */

    en: {

        nav: {

            about: "About Me",

            projects: "Projects",

            links: "Links",

            blog: "Blog"

        },


        home: {

            eyebrow: "HELLO, I'M",

            role: "Developer · Coding Student",

            description:
                "I enjoy programming, web development and Minecraft-related technologies.",

            projects: "My Projects",

            blog: "Read My Blog",

            featuredProjects: "Featured Projects",

            viewAll: "View All →"

        },


        about: {

            title: "About Me",

            description:
                "I'm a coding student interested in programming and web technologies. I enjoy building websites, Minecraft tools and various projects.",

            description2:
                "I like starting from real-world problems, learning how things work and turning ideas into working projects."

        },


        pages: {

            projects: "Projects",

            projectsDescription:
                "Some of the projects I am working on or have worked on.",

            links: "Links",

            linksDescription:
                "My websites, communities and other related links.",

            blog: "Blog",

            blogDescription:
                "Development logs, technical notes and thoughts."

        },


        projects: {

            xhakyialk: {

                title: "xhakyialk",

                description:
                    "A Minecraft community website and related services.",

                longDescription:
                    "A Minecraft community website providing server information, community content and various Minecraft-related services."

            },


            minecraftMap: {

                title: "Minecraft Web Map",

                description:
                    "A Minecraft world map generated with uNmINeD.",

                longDescription:
                    "An interactive web map that converts Minecraft worlds into maps that can be viewed directly in a browser."

            },


            bridge: {

                title: "BedrockBridge Plugins",

                description:
                    "Custom plugin development for Minecraft Bedrock Edition.",

                longDescription:
                    "JavaScript plugins developed for Minecraft Bedrock Edition."

            },


            website: {

                title: "Personal Website",

                description:
                    "A personal website built with HTML, CSS and JavaScript."

            }

        },


        links: {

            github:
                "My code and open-source projects.",

            xhakyialk:
                "Minecraft community website.",

            discord:
                "My Discord community."

        },


        blog: {

            post1: {

                title:
                    "Building My GitHub Pages",

                description:
                    "Starting my personal website and learning how to use GitHub Pages."

            },


            post2: {

                title:
                    "My Minecraft Development Log",

                description:
                    "Development notes about my Minecraft plugins and tools."

            }

        }

    }

};


/*
==========================================================
取得物件中的值
==========================================================
*/

function getTranslation(object, path) {

    const parts = path.split(".");

    let value = object;

    for (const part of parts) {

        if (
            value &&
            Object.prototype.hasOwnProperty.call(value, part)
        ) {

            value = value[part];

        } else {

            return undefined;

        }

    }

    return value;

}


/*
==========================================================
取得翻譯
==========================================================

如果 English 沒有：

English → Chinese fallback
==========================================================
*/

function translate(key, language) {

    const currentLanguage =
        translations[language] || translations.zh;

    let value =
        getTranslation(currentLanguage, key);


    /*
    English 找不到
    ↓
    自動使用中文
    */

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        value =
            getTranslation(
                translations.zh,
                key
            );

    }


    /*
    連中文也沒有
    */

    if (
        value === undefined ||
        value === null
    ) {

        return key;

    }


    return value;

}


/*
==========================================================
套用翻譯
==========================================================
*/

function applyTranslations(language) {

    document.documentElement.lang =
        language === "en"
            ? "en"
            : "zh-Hant";


    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.dataset.i18n;

            const text =
                translate(
                    key,
                    language
                );


            /*
            如果是 input / textarea
            */

            if (
                element.tagName === "INPUT" ||
                element.tagName === "TEXTAREA"
            ) {

                element.placeholder = text;

            } else {

                element.textContent = text;

            }

        });


    /*
    更新按鈕狀態
    */

    document
        .querySelectorAll("[data-language]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.language === language
            );

        });

}


/*
==========================================================
設定語言
==========================================================
*/

function setLanguage(language) {

    if (!translations[language]) {

        language = "zh";

    }


    localStorage.setItem(
        "Jimmy-language",
        language
    );


    applyTranslations(language);

}


/*
==========================================================
取得瀏覽器語言
==========================================================
*/

function detectBrowserLanguage() {

    const browserLanguage =
        navigator.language ||
        navigator.userLanguage ||
        "";


    /*
    zh-TW
    zh-HK
    zh-CN
    ...
    */

    if (
        browserLanguage
            .toLowerCase()
            .startsWith("en")
    ) {

        return "en";

    }


    return "zh";

}


/*
==========================================================
初始化
==========================================================
*/

function initI18n() {

    const savedLanguage =
        localStorage.getItem(
            "Jimmy-language"
        );


    let language;


    /*
    1. 使用使用者之前選擇的語言
    */

    if (savedLanguage) {

        language = savedLanguage;

    }

    /*
    2. 第一次進站
    */

    else {

        language =
            detectBrowserLanguage();

    }


    setLanguage(language);

}


/*
==========================================================
Language Buttons
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll("[data-language]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        setLanguage(
                            button.dataset.language
                        );

                    }
                );

            });


        initI18n();

    }
);
