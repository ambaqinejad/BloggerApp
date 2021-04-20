let quill;
let bloggerId;
let role;
let articleID;

$(document).ready(function() {
            quill = new Quill("#editor_viewer", {
                theme: "bubble"
            });
            quill.disable();

            bloggerId = $("#bloggerId").html().trim();
            role = $("#admin").html().trim();

            articleID = window.location.href.split("/");
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

    getComments();

    $('#commentForm').submit(function (e) { 
        e.preventDefault();
        const comment = $('#comment').val()
        if(comment === '') {
            $('#empty-comment-error').text('Please enter a comment.')
            return false
        }
        $('#empty-comment-error').text('');
        const commentData = {
            content: comment,
            commentedBy: bloggerId,
            forArticle: articleID
        }
        fetch("/dashboard/postComment", {
            body: JSON.stringify(commentData),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(response => window.location.href = response.url)
        .catch(err => $('#error').text(err.errMessage))
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
            window.location.href = response.url;
        })
        .catch(err => {
            $('#error').text(err.message)
        })
    }
}

function getComments() {
    fetch(`/dashboard/getCommentsOf`, {
        body: JSON.stringify({articleID}),
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(comments => {
        console.log(comments);
        let commentsContents = '';
        comments.forEach(comment => {
            commentsContents += `
                <div class='comment-container mb-2'>
                    <p class='comment-content'><strong>${comment.content}</strong></p>
                    <div class="row">
                         <div class="col"></div>
                         <div class="col-sm-6">
                             <hr>
                         </div>
                         <div class="col"></div>
                     </div>
                     <div class='d-flex align-items-end'>
                         <img src="${comment.commentedBy.avatar ? `images/avatars/${comment.commentedBy.avatar}` : "images/avatars/default.jpg"}" alt="" class="me-2 comment-img"> 
                         <p class="me-2">${comment.commentedBy.username}</p>
                         <p>${comment.createdAt.substring(0, 10)}</p>

                    </div>
                </div>
            `
            if(role === 'admin') {
                commentsContents += `
                    <div class="d-flex justify-content-end">
                        <button type="button" id="deleteCommentBtn" class="btn btn-danger mb-2">Delete Comment</button>
                    </div>
                `
            }
        })
        $('#all-comments').html(commentsContents)
    })
    .catch(err => $('#comment-fetch-error').text(err.errorMessage))
}