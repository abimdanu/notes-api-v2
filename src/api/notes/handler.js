class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    // Validate payload before processing the request
    this._validator.validateNotePayload(request.payload);

    const {
      title = 'untitled',
      body,
      tags,
    } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const noteId = await this._service.addNote({
      title,
      body,
      tags,
      owner: credentialId,
    });

    return h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId,
      },
    }).code(201);
  }

  async getNotesHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const notes = await this._service.getNotes(credentialId);

    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  async getNoteByIdHandler(request, h) {
    const { id: noteId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyNoteOwner(noteId, credentialId);
    const note = await this._service.getNoteById(noteId);

    return h.response({
      status: 'success',
      data: {
        note,
      },
    });
  }

  async putNoteByIdHandler(request, h) {
    const { id: noteId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const noteData = request.payload;

    // Sebelum melakukan edit, validasi payload yang diterima
    this._validator.validateNotePayload(noteData);

    await this._service.verifyNoteOwner(noteId, credentialId);
    await this._service.editNoteById(noteId, noteData);

    return h.response({
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    });
  }

  async deleteNoteByIdHandler(request, h) {
    const { id: noteId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyNoteOwner(noteId, credentialId);
    await this._service.deleteNoteById(noteId);

    return h.response({
      status: 'success',
      message: 'Catatan berhasil dihapus',
    });
  }
}

module.exports = NotesHandler;
