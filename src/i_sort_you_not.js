const builtInItems = [
    "root________",
    "menu________",
    "toolbar_____",
    "unfiled_____",
    "mobile______"
]

const getBookmark = function getBookmarkTreeNode(bookmarkId) {
    return browser.bookmarks.get(bookmarkId);
}
const getChildren = function getBookmarkChildrenTree(bookmarkId) {
    return browser.bookmarks.getChildren(bookmarkId)
}
const reorder = function setBookmarkLocation(bookmarkId, destination) {
    return browser.bookmarks.move(bookmarkId, destination)
}

const sortBookmarks = async function sortBookmakrTree(bookmarkId, direction, forlder_first) {
    let folders = []
    let urls = []
    let other = []
    let offset = 0
    let bookmarkTreeNode = await getBookmark(bookmarkId)

    const sortByTitle = (a, b) => {
        if (a.title < b.title) {
            return -1;
        } else if (a.title > b.title) {
            return 1;
        } else {
            return 0;
        }
    };

    try {
        if (bookmarkTreeNode[0].type === 'folder') {
            // get children
            let children = await getChildren(bookmarkId)

            // iterate and build separate lists by type 
            for (const child of children) {
                if (child.type === 'folder') {
                    folders.push(child)
                } else if (child?.url && child.url.substr(0, 6) === 'place:') {
                    other.push(child)
                } else {
                    urls.push(child)
                }
            }

            other.sort(sortByTitle)
            folders.sort(sortByTitle)
            urls.sort(sortByTitle)

            other.forEach(async (e, i) => {
                await reorder(e.id, {parentId: bookmarkId, index: offset + i })
            })
            offset += other.length || 0


            folders.forEach(async (e, i) => {
                await reorder(e.id, {parentId: bookmarkId, index: offset + i })
            })
            offset += folders.length || 0

            urls.forEach(async (e, i) => {
                await reorder(e.id, {parentId: bookmarkId, index: offset + i })
            })
        }
    }
    catch (error) {
        console.log(error)
    }
}


browser.menus.onShown.addListener(async (info) => {
    if (info.contexts.includes("bookmark")) {
        browser.menus.create({
            id: "sort-az",
            contexts: ["bookmark"],
            title: "Sort A-Z",
        });
        browser.menus.create({
            id: "sort-za",
            contexts: ["bookmark"],
            title: "Sort Z-A",
        });
        browser.menus.refresh();
    }
});

browser.menus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "sort-az":
            sortBookmarks(info.bookmarkId, "ASC")
        break;
        case "sort-za":
            sortBookmarks(info.bookmarkId, "DESC")
        break;
    }
});
