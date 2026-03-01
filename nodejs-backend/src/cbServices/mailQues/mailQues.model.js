module.exports = function (app) {
  const modelName = "mail_ques";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      name: {
        type: String,
        maxLength: 150,
        index: true,
        trim: true,
        comment: "Name, p, false, true, true, true, true, true, true, , , , ,",
      },
      from: {
        type: String,
        comment:
          "From, p, false, false, false, null, null, true, true, , , , ,",
      },
      recipients: {
        type: [String],
        comment:
          "Recipients, chip, false, false, false, null, null, true, true, , , , ,",
      },
      status: {
        type: Boolean,
        required: false,
        default: false,
        comment:
          "Status, tick, false, false, false, null, null, true, true, , , , ,",
      },
      data: {
        type: Schema.Types.Mixed,
        comment:
          "Data, pre, false, true, true, true, true, true, true, , , , ,",
      },
      // templateId: {
      //   type: Schema.Types.ObjectId,
      //   ref: 'templates',
      //   comment:
      //     'Template, p, false, false, false, null, null, true, true, templates, templates, one-to-one, name,',
      // },
      templateId: { type: String, required: false },
      subject: {
        type: String,
        required: true,
        comment:
          "Subject, inputTextarea, false, true, true, true, true, true, true, , , , ,",
      },
      content: {
        type: String,
        comment:
          "Content, inputTextarea, false, false, false, null, null, true, true, , , , ,",
      },
      jobId: {
        type: Number,
        comment:
          "Job Id, p_number, false, false, false, null, null, true, true, , , , ,",
      },
      errors: {
        type: String,
        comment:
          "Errors, inputTextarea, false, false, false, null, null, true, true, , , , ,",
      },
      end: {
        type: Date,
        comment:
          "End, p_calendar, false, true, true, true, true, true, true, , , , ,",
      },

      createdBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
      updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
    },
    {
      timestamps: true,
    },
  );

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
module.exports = function (app) {
  const modelName = "mail_ques";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      name: {
        type: String,
        maxLength: 150,
        index: true,
        trim: true,
        comment: "Name, p, false, true, true, true, true, true, true, , , , ,",
      },
      from: {
        type: String,
        comment:
          "From, p, false, false, false, null, null, true, true, , , , ,",
      },
      recipients: {
        type: [String],
        comment:
          "Recipients, chip, false, false, false, null, null, true, true, , , , ,",
      },
      status: {
        type: Boolean,
        required: false,
        default: false,
        comment:
          "Status, tick, false, false, false, null, null, true, true, , , , ,",
      },
      data: {
        type: Schema.Types.Mixed,
        comment:
          "Data, pre, false, true, true, true, true, true, true, , , , ,",
      },
      // templateId: {
      //   type: Schema.Types.ObjectId,
      //   ref: 'templates',
      //   comment:
      //     'Template, p, false, false, false, null, null, true, true, templates, templates, one-to-one, name,',
      // },
      templateId: { type: String, required: false },
      subject: {
        type: String,
        required: true,
        comment:
          "Subject, inputTextarea, false, true, true, true, true, true, true, , , , ,",
      },
      content: {
        type: String,
        comment:
          "Content, inputTextarea, false, false, false, null, null, true, true, , , , ,",
      },
      jobId: {
        type: Number,
        comment:
          "Job Id, p_number, false, false, false, null, null, true, true, , , , ,",
      },
      errors: {
        type: String,
        comment:
          "Errors, inputTextarea, false, false, false, null, null, true, true, , , , ,",
      },
      end: {
        type: Date,
        comment:
          "End, p_calendar, false, true, true, true, true, true, true, , , , ,",
      },

      createdBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
      updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: false },
    },
    {
      timestamps: true,
    },
  );

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
