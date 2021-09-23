import cheerio from "react-native-cheerio";
import { Status } from "../helpers/constants";

const baseUrl = "https://arthurscan.xyz/";

const sourceId = 80;
const sourceName = "ArthurScans (Br)";

const popularNovels = async (page) => {
    let url = baseUrl + "/manga/page/" + page + "/?m_orderby=rating";

    const totalPages = 2;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".page-item-detail").each(function () {
        const novelName = $(this).find(".item-summary h3").text().trim();
        const novelCover = $(this).find(".img-responsive").attr("data-src");

        let novelUrl = $(this).find("div > a").attr("href");

        const novel = {
            sourceId,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return { totalPages, novels };
};

const parseNovelAndChapters = async (novelUrl) => {
    const url = novelUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novel = { sourceId, url, sourceName };

    $(".post-title > h3 > span").remove();

    novel.novelUrl = novelUrl;

    novel.novelName = $(".post-title > h1").text().trim();

    novel.novelCover = $(".summary_image > a > img").attr("data-src");

    $(".post-content_item").each(function () {
        const detailName = $(this).find(".summary-heading > h5").text().trim();
        const detail = $(this).find(".summary-content").text().trim();

        switch (detailName) {
            case "Genre(s)":
                novel.genre = detail.replace(/[\t\n]/g, ",");
                break;
            case "Author(s)":
                novel.author = detail;
                break;
            case "Status":
                novel.status = detail.includes("OnGoing")
                    ? Status.ONGOING
                    : Status.COMPLETED;
                break;
        }
    });

    $(".description-summary > div.summary__content").find("em").remove();
    $(".premium-block").remove();

    novel.summary = $("div.summary__content").text().trim();

    let novelChapters = [];

    const data = await fetch(novelUrl + "ajax/chapters", { method: "POST" });
    const text = await data.text();

    $ = cheerio.load(text);

    $(".wp-manga-chapter").each(function () {
        $("i").remove();

        const chapterName = $(this).find("a").text().trim();
        const releaseDate = null;

        const chapterUrl = $(this).find("a").attr("href");

        const chapter = { chapterName, releaseDate, chapterUrl };

        novelChapters.push(chapter);
    });

    novel.chapters = novelChapters.reverse();

    return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
    const url = chapterUrl;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    const chapterName = $("#chapter-heading").text();
    const chapterText = $(".reading-content").html();

    const chapter = {
        sourceId,
        novelUrl,
        chapterUrl,
        chapterName,
        chapterText,
    };

    return chapter;
};

const searchNovels = async (searchTerm) => {
    const url = `${baseUrl}?s=${searchTerm}&post_type=wp-manga`;

    const result = await fetch(url);
    const body = await result.text();

    $ = cheerio.load(body);

    let novels = [];

    $(".c-tabs-item__content").each(function (result) {
        const novelName = $(this).find(".post-title > h3").text().trim();
        const novelCover = $(this).find("div > div > a > img").attr("data-src");

        let novelUrl = $(this).find("div > div > a").attr("href");
        novelUrl = novelUrl.replace(`${baseUrl}/`, "");

        const novel = {
            sourceId,
            novelName,
            novelCover,
            novelUrl,
        };

        novels.push(novel);
    });

    return novels;
};

const ArthurScansScraper = {
    popularNovels,
    parseNovelAndChapters,
    parseChapter,
    searchNovels,
};

export default ArthurScansScraper;
