class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(commentId, threadId, owner) {
    await this._threadRepository.verifyThread(threadId);

    await this._commentRepository.verifyComment(commentId);

    await this._commentRepository.verifyCommentOwner(commentId, owner);

    this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
