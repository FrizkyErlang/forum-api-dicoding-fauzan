const autoBind = require('auto-bind');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(request.payload, threadId, owner);

    const response = h.response({
      status: 'success',
      data: { addedComment },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute(commentId, threadId, owner);

    const response = h.response({
      status: 'success',
    });
    return response;
  }
}

module.exports = CommentsHandler;