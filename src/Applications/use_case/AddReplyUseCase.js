const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, commentId, threadId, owner) {
    const addReply = new AddReply(useCasePayload);

    await this._threadRepository.verifyThread(threadId);

    await this._commentRepository.verifyComment(commentId);

    return this._replyRepository.addReply(addReply, commentId, owner);
  }
}

module.exports = AddReplyUseCase;
