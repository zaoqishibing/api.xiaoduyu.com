import { Goals } from '../schemas'
import baseMethod from './base-method'

//生成一个document

// let apple = new Goals({
// 	// category:'apple',
// 	name:'吃apple',
// 	time_number:'半小时',
// 	days_of_perweek:[1,2,3],
// 	days_of_number:7,
// 	picture_of_punch:1,
// 	important_things:"苹果",
// 	money:30
// });
// //存放数据
// apple.save((err,apple)=>{
// 	if(err) return console.log(err);
// 	// apple.eat();
// 	//查找数据
// 	Goals.find({name:'吃apple'},(err,data)=>{
// 		console.log(data);
// 	})
// });
export default new baseMethod(Goals)