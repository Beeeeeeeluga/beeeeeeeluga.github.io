/*
==========================================================
Jimmy Website
Main JavaScript
==========================================================
*/


/*
==========================================================
Mobile Menu
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const menuToggle =
            document.querySelector(
                ".menu-toggle"
            );

        const navMenu =
            document.querySelector(
                ".nav-menu"
            );


        if (
            menuToggle &&
            navMenu
        ) {

            menuToggle.addEventListener(
                "click",
                () => {

                    navMenu.classList.toggle(
                        "open"
                    );

                }
            );


            /*
            點擊 Navbar Link 後關閉手機選單
            */

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
        ==================================================
        Current Year
        ==================================================
        */

        const yearElement =
            document.getElementById(
                "current-year"
            );


        if (yearElement) {

            yearElement.textContent =
                new Date().getFullYear();

        }


        /*
        ==================================================
        Active Navigation
        ==================================================
        */

        const currentPage =
            window.location.pathname
                .split("/")
                .pop() || "index.html";


        document
            .querySelectorAll(
                ".nav-menu a"
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
);
