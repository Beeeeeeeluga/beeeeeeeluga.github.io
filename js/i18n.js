/*
==========================================================
Jimmy Website
i18n System - Version 3
==========================================================

功能：

1. 中文 / English 切換
2. localStorage 記住語言
3. 自動偵測瀏覽器語言
4. 英文不存在時自動 fallback 到中文
5. 從 data/site.json 載入網站文字
6. 支援 data-i18n
7. 支援多段文字
==========================================================
*/


const I18N_DATA_URL = "data/site.json";

let siteData = null;

let currentLanguage = "zh";


/*
==========================================================
取得物件中的值
==========================================================
*/

function getValue(object, path) {

    if (!object) {
        return undefined;
    }

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
Language fallback
==========================================================

優先：

English
 ↓
沒有
 ↓
Chinese
==========================================================
*/

function getLocalizedValue(value, language) {

    if (
        value === undefined ||
        value === null
    ) {

        return undefined;

    }


    /*
    如果本身就是普通文字
    */

    if (typeof value === "string") {

        return value;

    }


    /*
    如果是陣列
    */

    if (Array.isArray(value)) {

        return value;

    }


    /*
    嘗試目前語言
    */

    if (
        value[language] !== undefined &&
        value[language] !== null &&
        value[language] !== ""
    ) {

        return value[language];

    }


    /*
    fallback 到中文
    */

    if (
        value.zh !== undefined &&
        value.zh !== null &&
        value.zh !== ""
    ) {

        return value.zh;

    }


    return undefined;
}


/*
==========================================================
取得翻譯
==========================================================
*/

function translate(key, language = currentLanguage) {

    const value =
        getValue(
            siteData,
            key
        );


    const result =
        getLocalizedValue(
            value,
            language
        );


    if (
        result === undefined
    ) {

        return key;

    }


    return result;
}


/*
==========================================================
套用文字
==========================================================
*/

function applyTranslations(language) {

    currentLanguage = language;


    document.documentElement.lang =
        language === "en"
            ? "en"
            : "zh-Hant";


    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.dataset.i18n;

            const value =
                translate(
                    key,
                    language
                );


            /*
            多段文字
            */

            if (Array.isArray(value)) {

                element.innerHTML =
                    value
                        .map(
                            paragraph =>
                                `<p>${escapeHtml(paragraph)}</p>`
                        )
                        .join("");

                return;

            }


            /*
            input / textarea
            */

            if (
                element.tagName === "INPUT" ||
                element.tagName === "TEXTAREA"
            ) {

                element.placeholder = value;

            }

            /*
            一般 HTML
            */

            else {

                element.textContent = value;

            }

        });


    /*
    更新語言按鈕
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
設定語言
==========================================================
*/

function setLanguage(language) {

    if (
        language !== "zh" &&
        language !== "en"
    ) {

        language = "zh";

    }


    localStorage.setItem(
        "Jimmy-language",
        language
    );


    if (siteData) {

        applyTranslations(language);

    }

}


/*
==========================================================
偵測瀏覽器語言
==========================================================
*/

function detectBrowserLanguage() {

    const browserLanguage =
        navigator.language ||
        navigator.userLanguage ||
        "";


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
取得目前應使用的語言
==========================================================
*/

function getInitialLanguage() {

    const savedLanguage =
        localStorage.getItem(
            "Jimmy-language"
        );


    if (
        savedLanguage === "zh" ||
        savedLanguage === "en"
    ) {

        return savedLanguage;

    }


    return detectBrowserLanguage();
}


/*
==========================================================
載入 site.json
==========================================================
*/

async function loadSiteData() {

    try {

        const response =
            await fetch(
                I18N_DATA_URL
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        siteData =
            await response.json();


        /*
        載入完成後套用語言
        */

        applyTranslations(
            getInitialLanguage()
        );


    } catch (error) {

        console.error(
            "Unable to load site.json:",
            error
        );

    }

}


/*
==========================================================
初始化
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
        語言按鈕
        */

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


        /*
        載入網站資料
        */

        loadSiteData();

    }
);
