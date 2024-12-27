class SetLikeCommentUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._threadRepository.verifyThread(threadId);

    await this._commentRepository.verifyComment(commentId);

    if (await this._likeRepository.verifyLikedComment(commentId, userId)) {
      await this._likeRepository.deleteLike(commentId, userId);
    } else {
      await this._likeRepository.addLike(commentId, userId);
    }
  }
}

module.exports = SetLikeCommentUseCase;
