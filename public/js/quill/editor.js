Quill.register("modules/imageUploader", ImageUploader);
let quill;
$(document).ready(function() {
    const fullToolbarOptions = [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", 'underline'],
        ["image"]
    ];

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
        deleted.length && console.log('delete', deleted)
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

    $('#postForm').submit(function() {
        $('#titleError').text('');
        $('#descriptionError').text('');
        $('#content').val(JSON.stringify(quill.getContents()));
        $('#htmlContent').val(quill.root.innerHTML);
        // console.log(quill.root.innerHTML);
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
});

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