//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderBookmarks();
    renderCategory();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}
function renderCategory() {
    API_GetBookmarks().then(bookmarks => {
        let categories = [];

        bookmarks.forEach(bookmark => {
            if (!categories.includes(bookmark.Category)) {
                categories.push(bookmark.Category);
            }
        });

        const categoryList = $('#categoryList');
        categoryList.empty();

        categories.forEach(category => {
            const categoryItem = `<div class="dropdown-item" data-category="${category}">
    ${category}
</div>`;
            categoryList.append(categoryItem);
        });

        $('.dropdown-item').click(function () {
            const selectedCategory = $(this).data('category');
            filterBookmarks(selectedCategory);
        });
    });
}
function filterBookmarks(selectedCategory) {
    $('#content').html('');

    API_GetBookmarks().then(bookmarks => {
        bookmarks.forEach(bookmark => {
            if (bookmark.Category === selectedCategory || selectedCategory === 'all') {
                const bookmarkItem = `
<div class="bookmarkRow" bookmark_id=${bookmark.Id}">
    <div class="bookmarkContainer noselect">
        <div class="bookmarkLayout">
            <span class="bookmarkPhone">
                <img src="http://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(bookmark.Url)}"
                    alt="">
            </span>
            <span class="bookmarkName">${bookmark.Title}</span>
            <span class="bookmarkEmail">${bookmark.Category}</span>
        </div>
        <div class="bookmarkCommandPanel">
            <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}"
                title="Modifier ${bookmark.Title}"></span>
            <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}"
                title="Effacer ${bookmark.Title}"></span>
        </div>
    </div>
</div> `;

                $('#content').append(bookmarkItem);
            }
        });

        if ($('#content').children().length === 0) {
            $('#content').html('<p>Pas de favoris trouvé pour cette catégorie</p>');
        }
    });
}
function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
<div class="aboutContainer">
    <h2>Gestionnaire de Bookmarks</h2>
    <hr>
    <p>
        Petite application de gestion de Bookmarks à titre de démonstration
        d'interface utilisateur monopage réactive.
    </p>
    <p>
        Auteur: Nicolas Chourot
    </p>
    <p>
        Collège Lionel-Groulx, automne 2024
    </p>
</div>
`))
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
<div class="errorContainer">
    ${message}
</div>
`)
    );
}
function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await API_GetBookmarks();
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            $("#content").append(renderBookmark(bookmark));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function renderBookmark(bookmark) {
    return $(`
<div class="bookmarkRow" bookmark_id=${bookmark.Id}">
    <div class="bookmarkContainer noselect">
        <div class="bookmarkLayout">
            <span class="bookmarkPhone">
                <img src="http://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(bookmark.Url)}"
                    alt="">
            </span>
            <span class="bookmarkName">${bookmark.Title}</span>
            <span class="bookmarkEmail">${bookmark.Category}</span>
        </div>
        <div class="bookmarkCommandPanel">
            <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}"
                title="Modifier ${bookmark.Title}"></span>
            <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}"
                title="Effacer ${bookmark.Title}"></span>
        </div>
    </div>
</div>
`);
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await API_GetBookmark(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Favoris introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
<div class="bookmarkdeleteForm">
    <h4>Effacer le bookmark suivant?</h4>
    <br>
    <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
        <div class="bookmarkContainer">
            <div class="bookmarkLayout">
                <div class="bookmarkPhone"><img src="http://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(bookmark.Url)}"
                    alt=""></div>
                <div class="bookmarkName">${bookmark.Title}</div>
                <div class="bookmarkEmail">${bookmark.Category}</div>
            </div>
        </div>
    </div>
    <br>
    <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
    <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
</div>
`);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
<form class="form" id="bookmarkForm">
    <input type="hidden" name="Id" value="${bookmark.Id}" />

    <label for="Title" class="form-label">Titre </label>
    <input class="form-control Alpha" name="Title" id="Title" placeholder="Titre du bookmark" required
        RequireMessage="Veuillez entrer un titre" InvalidMessage="Le titre comporte un caractère illégal"
        value="${bookmark.Title}" />

    <label for="Url" class="form-label">URL </label>
    <input class="form-control Url" name="Url" id="Url" placeholder="http:// ou https://" required
        RequireMessage="Veuillez entrer une URL valide" InvalidMessage="L'URL est invalide" value="${bookmark.Url}" />

    <label for="Category" class="form-label">Catégorie </label>
    <input class="form-control Category" name="Category" id="Category" placeholder="Catégorie" required
        RequireMessage="Veuillez sélectionner une catégorie" InvalidMessage="La catégorie est requise"
        value="${bookmark.Category}" />
    <hr>
    <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
    <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
</form>

`);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmark();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}
