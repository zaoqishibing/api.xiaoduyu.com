import { Goals } from '../../modelsa'

// tools
import To from '../../common/to'
import CreateError from './errors'
// import Querys from '../querys'
// import Updates from '../updates'
// import Saves from '../saves'


import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
import goals from '../../modelsa/goals';
let [query, mutation, resolvers] = [{}, {}, {}];

/*
const s = async () => {
  let [ err, res ] = await To(Topic.find({ query:{}, select:{} }));
  console.log(err);
  console.log(res);
}

s();
*/

query.goalses = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args
  let select = {}, err, res, query = {}, options = {}, goalsList;
  // let { query, options } = Querys({ args, model: 'topic', role });

  [err, query] = getQuery({ args, model: 'goals', role });
  [err, options] = getOption({ args, model: 'goals', role });

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item => select[item.name.value] = 1);

  // === 设置一些默认值

  if (!Reflect.has(options, 'sort')) {
    options.sort = {
      sort: -1
    }
  }

  [err, goalsList] = await To(Goals.find({ query, select, options }));

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  // if (goalsList) {

  //   goalsList = JSON.parse(JSON.stringify(goalsList));

  //   // 如果是登陆用户，显示是否关注了该话题
  //   if (user && goalsList && Reflect.has(select, 'follow')) {
  //       goalsList.map(node => {
  //       node.follow = user.follow_topic.indexOf(node._id) != -1 ? true : false
  //     })
  //   }

  // } else {
  //   goalsList = [];
  // }

  return goalsList
}


query.countGoalses = async (root, args, context, schema) => {

  const { user, role } = context
  let err, select = {}, query, options, count;
  // let { query, options } = Querys({ args, model: 'topic', role })

  [err, query] = getQuery({ args, model: 'goals', role });
  [err, options] = getOption({ args, model: 'goals', role });

  //===

  [err, count] = await To(Goals.count({ query }))

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  return { count }
}

mutation.addGoals = async (root, args, context, schema) => {

  const { user, role, ip } = context;

  if (!ip) throw CreateError({ message: '无效的ip' });
  let err, result, save;
  [err, save] = getSaveFields({ args, model: 'goals', role });

  if (err) throw CreateError({ message: err });

  if (!user) {
    throw CreateError({
      message: '游客无权限，请登录后再试',
      data: {}
    });
  }


  // 判断是否禁言
  if (user && user.banned_to_post &&
    new Date(user.banned_to_post).getTime() > new Date().getTime()
  ) {
    let countdown = Countdown(new Date(), user.banned_to_post);
    throw CreateError({
      message: '您被禁言，{days}天{hours}小时{mintues}分钟后解除禁言',
      data: { error_data: countdown }
    });
  }

  if (!save.name || !save.time_number || !save.money) {

    let message = '名字不能为空'

    if (!save.name) {
      message = '目标名称不能为空'
    } else if (!save.time_number) {
      message = '目标天数不能为空'
    } else if (!save.money) {
      message = '挑战金额不能为空'
    }

    throw CreateError({
      message,
      data: {}
    });
  };


// 目标唯一性？？？？
  // [err, result] = await To(goals.findOne({ query: { name: save.name } }))

  // if (err) {
  //   throw CreateError({
  //     message: '查询异常',
  //     data: { errorInfo: err.message }
  //   });
  // }

  // if (result) {
  //   throw CreateError({
  //     message: save.name+' 名称已存在',
  //     data: {}
  //   });
  // }



  
  // if (!save.avatar) delete save.avatar
  // if (!save.parent_id) delete save.parent_id;

  // console.log(save);

    // title
    save.name = xss(save.name, {
      whiteList: {},
      stripIgnoreTag: true,
      onTagAttr: (tag, name, value, isWhiteAttr) => ''
    })

    if (!save.name || save.name.replace(/(^\s*)|(\s*$)/g, "") == '') {
      throw CreateError({ message: '目标名称不能为空' });
    } else if (save.name.length > 120) {
      throw CreateError({ message: '目标名称不能大于120个字符' });
    }


    // 增加其他参数
    save.user_id = user._id;

  [err, result] = await To(Goals.save({ data: save }))

  if (err) {
    throw CreateError({
      message: '储存失败',
      data: { errorInfo: err.message }
    });
  }

  return { success: true }
}

mutation.updateGoals = async (root, args, context, schema) => {

  const { user, role } = context;
  let err, query, update, topic, result;

  [err, query] = getUpdateQuery({ args, model: 'goals', role });
  [err, update] = getUpdateContent({ args, model: 'goals', role });

  // if (!user || role != 'admin') {
  //   throw CreateError({
  //     message: '无权限',
  //     data: {}
  //   });
  // }

  // --------------------------------------

  [err, topic] = await To(Goals.findOne({ query: { _id: query._id } }))

  if (err) {
    throw CreateError({
      message: '_id 查询失败',
      data: { errorInfo: err.message || '' }
    });
  }

  if (!topic) {
    throw CreateError({
      message: '_id 不存在',
      data: {}
    });
  }

  // 判断是否存在这个话题
  if (topic.name != update.name) {

    [err, result] = await To(Goals.findOne({ query: { name: update.name } }))

    if (err) {
      throw CreateError({
        message: 'name 查询失败',
        data: { errorInfo: err.message || '' }
      });
    }

    if (result) {
      throw CreateError({
        message: '_id 已存在',
        data: {}
      });
    }

  }





  [err] = await To(Goals.update({ query, update }))

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message || '' }
    });
  }

  return { success: true }
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
