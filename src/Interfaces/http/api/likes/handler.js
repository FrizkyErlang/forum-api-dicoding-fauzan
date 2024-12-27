const autoBind = require('auto-bind');
const SetLikeCommentUseCase = require('../../../../Applications/use_case/SetLikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async putLikeComment(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const setLikeCommentUseCase = this._container.getInstance(SetLikeCommentUseCase.name);
    await setLikeCommentUseCase.execute(threadId, commentId, userId);

    const response = h.response({
      status: 'success',
    });
    return response;
  }
}

module.exports = LikesHandler;
