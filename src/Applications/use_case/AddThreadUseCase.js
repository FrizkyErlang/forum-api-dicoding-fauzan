const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  execute(useCasePayload, owner) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread, owner);
  }
}

module.exports = AddThreadUseCase;
