
import mongoose from 'mongoose';
import { db_url } from '../../config';


// if (config.debug) {
// 	mongoose.set('debug', true);
// }

/*
mongoose.Promise = global.Promise;
mongoose.connect(config.db_url, {}, function (error) {
	if (error) {
		console.error('connect to %s error: ', config.db_url, error.message);
		process.exit(1);
	}
});
*/

// mongoose.Promise = global.Promise;

mongoose.connect(db_url, {
  // useMongoClient: true,
});

// promise.then(function(db) {
	// console.log('123123');
// })

// mongoose.createConnection(config.db_url, { useMongoClient: false }, function (error) {
// 	if (error) {
// 		console.error('connect to %s error: ', config.db_url, error.message);
// 		process.exit(1);
// 	}
// });

require('./user');
require('./account');
require('./oauth');
require('./comment');
require('./like');
require('./notification');
require('./user-notification');
require('./captcha');
require('./posts');
require('./topic');
require('./follow');
require('./token');
require('./phone');
require('./report');
require('./block');
require('./goals');

// //定义一个schema
// let Schema = mongoose.Schema({
// 	category:String,
// 	name:String
// });
// Schema.methods.eat = function(){
// 	console.log("I've eatten one "+this.name);
// }
// //继承一个schema
// let Model = mongoose.model("fruit",Schema);
// //生成一个document
// let apple = new Model({
// 	category:'apple',
// 	name:'apple'
// });
// //存放数据
// apple.save((err,apple)=>{
// 	if(err) return console.log(err);
// 	apple.eat();
// 	//查找数据
// 	Model.find({name:'apple'},(err,data)=>{
// 		console.log(data);
// 	})
// });



// 在这里，我们创建model，它在数据库中的名字根据传给 mongoose.model 的第一个参数决定，
// mongoose 会将名词变为复数，在这里，collection 的名字会是复数形式。
exports.User = mongoose.model('User');
exports.Account = mongoose.model('Account');
exports.Oauth = mongoose.model('Oauth');
exports.Captcha = mongoose.model('Captcha');
exports.Token = mongoose.model('Token');
exports.Phone = mongoose.model('Phone');
exports.Report = mongoose.model('Report');
exports.Posts = mongoose.model('Posts');
exports.Comment = mongoose.model('Comment');
exports.Topic = mongoose.model('Topic');
exports.Follow = mongoose.model('Follow');
exports.Like = mongoose.model('Like');
exports.Notification = mongoose.model('Notification');
exports.UserNotification = mongoose.model('UserNotification');
exports.Block = mongoose.model('Block');
exports.Goals = mongoose.model('Goals');

