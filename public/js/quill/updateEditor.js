Quill.register("modules/imageUploader", ImageUploader);
let quill;
$(document).ready(function() {
    const fullToolbarOptions = [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", 'underline'],
        ["image"]
    ];
    const urlParams = new URLSearchParams(window.location.search);
    const articleID = urlParams.get('articleId');

    fetch('/dashboard/getArticle', {
            method: 'POST',
            body: JSON.stringify({ articleID }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(response => {
            console.log(response);
            quill = new Quill("#editor", {
                theme: "snow",
                modules: {
                    toolbar: {
                        container: fullToolbarOptions
                    }
                }
            });
            quill.getModule('toolbar').addHandler('image', () => {
                selectLocalImage()
            })

            quill.on('text-change', (delta, oldContents, source) => {
                const deleted = getImgUrls(quill.getContents().diff(oldContents));
                deleted.length && console.log(deleted)
                if (deleted.length) {
                    fetch('/dashboard/deletePostImage', {
                        method: 'POST',
                        body: JSON.stringify({ deleted }),
                        headers: { // ***
                            "Content-Type": "application/json" // ***
                        }
                    })
                }
            });
            quill.on("text-change", (delta, oldDelta, source) => {
                if (source === "user") {
                    let currrentContents = quill.getContents();
                    let diff = currrentContents.diff(oldDelta);
                    try {
                        console.log(diff.ops[0].insert.image);
                    } catch (_error) {}
                }
            });

            $('#postForm').submit(function() {
                $('#titleError').text('');
                $('#descriptionError').text('');
                $('#content').val(JSON.stringify(quill.getContents()));
                $('#htmlContent').val(quill.root.innerHTML);
                if (!$('#title').val() || !$('#description').val()) {
                    if (!$('#title').val()) {
                        $('#titleError').text('Title required.');
                    }
                    if (!$('#description').val()) {
                        $('#descriptionError').text('Description required.');
                    }
                    return false;
                }
            });

            function getImgUrls(delta) {
                return delta.ops.filter(i => i.insert && i.insert.image).map(i => i.insert.image);
            }

            fillForm(response);
        })
        .catch(err => {
            $('#error').text(err.message)
        })
});

const fillForm = (info) => {
    $('#articleId').val(info.article._id);
    $('#title').val(info.article.title);
    $('#description').val(info.article.description);
    quill.setContents(JSON.parse(info.article.content).ops)
}

const selectLocalImage = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', "image/png, image/jpeg, image/jpg")
    input.click();
    input.onchange = () => {
        const file = input.files[0];
        if (/^image\//.test(file.type)) {
            postImageToServer(file)
        } else {
            $('#imageError').text('Only image is acceptable.');
        }
    }
}

const postImageToServer = (file) => {
    const formData = new FormData();
    console.log(file);
    formData.append('postImage', file, file.name);
    fetch('/dashboard/uploadPostImage', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(response => {
            insertImageToEditor(response.imageUrl)
        }).catch(err => {
            console.log(err);
        });
}

const insertImageToEditor = (imageUrl) => {
    const range = quill.getSelection();
    quill.insertEmbed(range.index, 'image', `${imageUrl}`);
}