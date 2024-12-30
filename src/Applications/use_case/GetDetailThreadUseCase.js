const PopulatedComment = require('../../Domains/comments/entities/PopulatedComment');
const GetReply = require('../../Domains/replies/entities/GetReply');
const PopulatedThread = require('../../Domains/threads/entities/PopulatedThread');

class GetDetailThreadUseCase {
  constructor({ replyRepository, likeRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    // get Thread data
    await this._threadRepository.verifyThread(threadId);

    const thread = await this._threadRepository.getThread(threadId);

    // get Comment data
    const comments = await this._commentRepository.getComments(threadId);

    // get Reply data
    const replies = await this._replyRepository.getRepliesByCommentIds(
      comments.map((comment) => comment.id),
    );

    // get likeCounts
    const likeCounts = await this._likeRepository.countLikeByCommentIds(
      comments.map((comment) => comment.id),
    );

    // populate the comment with replies and like count
    const populatedComment = comments.map(
      (comment) =>
        new PopulatedComment(
          comment,
          this._mapReplies(comment.id, replies),
          this._mapLikeCounts(comment.id, likeCounts),
        ),
    );

    // Populate the Thread with comments
    const populatedThread = new PopulatedThread(thread, populatedComment);

    return populatedThread;
  }

  _mapReplies(commentId, replies) {
    const filteredReply = replies.filter((reply) => reply.comment_id === commentId);

    const getReplies = filteredReply.map((reply) => new GetReply(reply));

    return getReplies;
  }

  _mapLikeCounts(commentId, likeCounts) {
    const likeCount = likeCounts.find((reply) => reply.comment_id === commentId)?.like_count || 0;

    return likeCount;
  }
}

module.exports = GetDetailThreadUseCase;
