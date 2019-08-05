
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const GoalsSchema = new Schema({
  // 创建人
  user_id: { type: ObjectId, ref: 'User' },
  // 话题
  topic_id: { type: ObjectId, ref: 'Topic'},
  // 名称
  name: { type: String, default: ''},
  // 时长或者数量
  time_number: { type: String, default: '' },
  // 每周打卡天数设置
  days_of_perweek: { type: String, default: "1,2,3,4,5" },
  // 目标天数
  days_of_number: { type: Number, default: 7 },
  // 目标截止日期
  endtime: { type: Date, default: Date.now },
  // 目标start日期
  starttime: { type: Date, default: Date.now },
  // 图片要求 0-不要求 1-现场拍照 2-上传截图
  picture_of_punch: { type: Number, default: 0 },
  // 图片包含的目标物体
  important_things:{type: String, default: ''},
  // 当前打卡天数
  current_days_count: { type: Number, default: 0 },
  // 押金金额
  money: { type: Number, default: 1 },
  // 是否完成
  completed:{type: Boolean, default: false},
  // 排序
  sort: { type: Number, default: 0 },
  // 创建日期
  create_at: { type: Date, default: Date.now }, 
  // // 删除标记
  // deleted: { type: Boolean, default: false },
  // // 推荐
  // recommend: { type: Boolean, default: false },
  // // 削弱，将不出现在首页
  // weaken: { type: Boolean, default: false },
  // 语言 0 -> 中
  language: { type: Number, default: 0 }
});

mongoose.model('Goals', GoalsSchema);
