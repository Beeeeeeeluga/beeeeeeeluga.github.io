import json
import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "blog"
INDEX_FILE = BLOG_DIR / "index.json"


def escape(value):
    return html.escape(str(value or ""), quote=True)


def parse_front_matter(content):
    """
    讀取 Markdown 最前面的：

    ---
    title_zh: ...
    title_en: ...
    date: ...
    description_zh: ...
    description_en: ...
    ---
    """

    if not content.startswith("---"):
        return {}, content

    parts = content.split("---", 2)

    if len(parts) < 3:
        return {}, content

    front_matter_text = parts[1].strip()
    markdown = parts[2].lstrip()

    data = {}

    for line in front_matter_text.splitlines():
        if ":" not in line:
            continue

        key, value = line.split(":", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")

    return data, markdown


def markdown_to_html(markdown):
    """
    非常簡單的 Markdown → HTML。
    目前支援常見標題、粗體、斜體、連結、段落。
    """

    lines = markdown.splitlines()
    output = []

    in_list = False

    for line in lines:
        line = line.rstrip()

        if not line:
            if in_list:
                output.append("</ul>")
                in_list = False
            continue

        if line.startswith("### "):
            output.append(f"<h3>{escape(line[4:])}</h3>")
            continue

        if line.startswith("## "):
            output.append(f"<h2>{escape(line[3:])}</h2>")
            continue

        if line.startswith("# "):
            output.append(f"<h1>{escape(line[2:])}</h1>")
            continue

        if line.startswith("- "):
            if not in_list:
                output.append("<ul>")
                in_list = True

            output.append(f"<li>{escape(line[2:])}</li>")
            continue

        if in_list:
            output.append("</ul>")
            in_list = False

        text = escape(line)

        text = re.sub(
            r"\*\*(.+?)\*\*",
            r"<strong>\1</strong>",
            text
        )

        text = re.sub(
            r"\*(.+?)\*",
            r"<em>\1</em>",
            text
        )

        text = re.sub(
            r"\[(.+?)\]\((https?://[^)]+)\)",
            r'<a href="\2" target="_blank" rel="noopener">\1</a>',
            text
        )

        output.append(f"<p>{text}</p>")

    if in_list:
        output.append("</ul>")

    return "\n".join(output)


def generate_post(post):
    filename = post["filename"]
    markdown_file = BLOG_DIR / filename

    if not markdown_file.exists():
        print(f"WARNING: {markdown_file} does not exist")
        return

    content = markdown_file.read_text(encoding="utf-8")

    front_matter, markdown = parse_front_matter(content)

    title_zh = (
        post.get("title_zh")
        or front_matter.get("title_zh")
        or "未命名文章"
    )

    title_en = (
        post.get("title_en")
        or front_matter.get("title_en")
        or title_zh
    )

    description_zh = (
        post.get("description_zh")
        or front_matter.get("description_zh")
        or ""
    )

    description_en = (
        post.get("description_en")
        or front_matter.get("description_en")
        or description_zh
    )

    date = (
        post.get("date")
        or front_matter.get("date")
        or ""
    )

    slug = Path(filename).stem
    output_file = BLOG_DIR / f"{slug}.html"

    url = f"https://beeeeeeluga.github.io/blog/{slug}.html"

    content_html = markdown_to_html(markdown)

    page = f"""<!DOCTYPE html>
<html lang="zh-Hant">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>{escape(title_zh)} | Jimmy</title>

    <meta name="description"
          content="{escape(description_zh)}">

    <meta property="og:type"
          content="article">

    <meta property="og:title"
          content="{escape(title_zh)}">

    <meta property="og:description"
          content="{escape(description_zh)}">

    <meta property="og:url"
          content="{escape(url)}">

    <meta property="og:site_name"
          content="Jimmy">

    <meta name="twitter:card"
          content="summary">

    <meta name="twitter:title"
          content="{escape(title_zh)}">

    <meta name="twitter:description"
          content="{escape(description_zh)}">

    <link rel="stylesheet"
          href="../css/style.css">

</head>

<body>

<header class="navbar">

    <div class="nav-container">

        <a href="../index.html"
           class="logo">
            Jimmy
        </a>

        <button class="menu-toggle"
                aria-label="Menu">
            ☰
        </button>

        <nav class="nav-menu">

            <a href="../index.html">
                關於我
            </a>

            <a href="../projects.html">
                我的專案
            </a>

            <a href="../links.html">
                連結列表
            </a>

            <a href="../blog.html">
                我的部落格
            </a>

        </nav>

    </div>

</header>


<main>

<section class="page-header">

    <p class="eyebrow">
        BLOG
    </p>

    <h1>
        {escape(title_zh)}
    </h1>

    <p>
        {escape(description_zh)}
    </p>

    <p class="blog-date">
        {escape(date)}
    </p>

</section>


<section class="section">

    <article class="blog-post">

        {content_html}

    </article>

</section>

</main>


<footer class="footer">

    <p>
        © <span id="current-year"></span> Jimmy
    </p>

</footer>


<script src="../js/i18n.js"></script>
<script src="../js/main.js"></script>

</body>

</html>
"""

    output_file.write_text(page, encoding="utf-8")

    print(f"Generated: {output_file}")


def main():
    if not INDEX_FILE.exists():
        raise FileNotFoundError(INDEX_FILE)

    posts = json.loads(
        INDEX_FILE.read_text(encoding="utf-8")
    )

    for post in posts:
        generate_post(post)


if __name__ == "__main__":
    main()
