const mongoose = require('mongoose');
const { getMeta, preSave } = require('../helpers');

const InventoryLogSchema = new mongoose.Schema({
  type: String,
  num: Number,
  user: String,
  goodName: String,

  meta: getMeta(),
});

// 注册一些前置的事情，在save之前，做presave的事情！
InventoryLogSchema.pre('save', preSave);

mongoose.model('InventoryLog', InventoryLogSchema);
