class GetDetailThreadUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    // get Thread data
    await this._threadRepository.verifyThread(threadId);

    const thread = await this._threadRepository.getThread(threadId);

    // get Comment data
    const comments = await this._commentRepository.getComments(threadId);

    // get Reply data and populate the comment with replies
    const populatedComment = comments.map(async (comment) => {
      const content = comment.is_delete ? '**komentar telah dihapus**' : comment.content;
      const replies = await this._getReplies(comment.id);

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content,
        replies,
      };
    });

    // Populate the Thread with comments
    Object.assign(thread, { comments: await Promise.all(populatedComment) });

    return thread;
  }

  async _getReplies(commentId) {
    const replies = await this._replyRepository.getReplies(commentId);

    const populatedReplies = replies.map((reply) => {
      const content = reply.is_delete ? '**balasan telah dihapus**' : reply.content;

      return {
        id: reply.id,
        date: reply.date,
        content,
        username: reply.username,
      };
    });

    return populatedReplies;
  }
}

module.exports = GetDetailThreadUseCase;
