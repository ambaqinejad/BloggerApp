let quill;
$(document).ready(function() {
            quill = new Quill("#editor_viewer", {
                theme: "bubble"
            });
            quill.disable();

            let bloggerId = $("#bloggerId").html().trim();
            let role = $("#admin").html().trim();

            let articleID = window.location.href.split("/");
            articleID = articleID[articleID.length - 1];
            $.ajax({
                        type: "post",
                        url: "/dashboard/getArticle",
                        data: { articleID },
                        success: function(article) {
                                quill.setContents(JSON.parse(article.article.content).ops)
                                let writerInfo = `
                <img src="${article.article.postedBy.avatar ? `images/avatars/${article.article.postedBy.avatar}` : 'images/avatars/default.jpg'}" alt="" class="mb-3 writer-avatar_container">
                <p><strong>Writer:</strong> ${article.article.postedBy.username}</p>
                <p class="mb-4"><strong>Writer Email:</strong> ${article.article.postedBy.email}</p>
                <p><strong>Created at:</strong> ${article.article.createdAt.substring(0, 10)}</p>
            `
            $('#writerInfo').html(writerInfo)

            if(article.article.postedBy._id === bloggerId) {
                let modifyingPart = `
                    <a id="updatePostBtn" href="/dashboard/updatePost?articleId=${article.article._id}" class="btn btn-primary">Update</a>
                    <button type="button" id="deletePostBtn" onclick="_delete('${article.article._id}')" class="btn btn-danger">Delete</button>
                `
                $('#modifyingPart').html(modifyingPart);
            }
            if(role === 'admin') {
                let modifyingPart = `
                    <button type="button" id="deletePostBtn" onclick="_delete('${article.article._id}')" class="btn btn-danger">Delete</button>
                `
                $('#modifyingPart').html(modifyingPart);
            }
        },
        error: function(err) {
            $('#error').text(err)
        }
    });
})

function _delete(articleId) {
    let ok = confirm("Are you sure?");
    if(ok) {
        fetch('/dashboard/deletePost', {
            method: 'DELETE',
            body: JSON.stringify({articleId}),
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(response => {
            window.location.href = document.referrer;
        })
        .catch(err => {
            $('#error').text(err.message)
        })
    }
}