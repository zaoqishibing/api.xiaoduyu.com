import { Posts, User, Follow, Like, Goal, Feed } from '../../modelsa';

import CreateError from './errors';
import To from '../../common/to';

import { getQuery, getOption, getUpdateQuery, getUpdateContent, getSaveFields } from '../config';
import xss from 'xss';

let [ query, mutation, resolvers ] = [{},{},{}];


// 查询
query.posts = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args

  let select = {}, err, postList, followList, likeList, ids, query, options;

  [ err, query ] = getQuery({ args, model:'posts', role });
  [ err, options ] = getOption({ args, model:'posts', role });

  // 未登陆用户，不能使用method方式查询
  if (!user && method) {
    throw CreateError({ message: '请求被拒绝' })
  }

  // 每页数量
  let limit = options.limit;

  // select，这里取得本次请求要返回的字段
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)


  // 联查条件
  if (!options.populate) options.populate = []

  // 增加屏蔽条件
  // 1、如果是登陆状态，那么增加屏蔽条件
  // 2、如果通过posts id查询，那么不增加屏蔽条件

  if (user) {
    // 如果没有指定post的id，并且用户有屏蔽帖子，则设置id不在屏蔽帖子之内
    if (!query._id && user.block_posts_count > 0) {
      // mongose中 $nin 不在多个值范围内
      query._id = { '$nin': user.block_posts }
    }

    // 这里的user.block_people_count 是客户端带着token，每次请求中间件（graphql/index.js），查询了user信息赋值给user对象的
    // 屏蔽指定的用户
    if (!query.user_id && user.block_people_count > 0) {
      query.user_id = { '$nin': user.block_people }
    }

  }


  // 用户关注,1、被关注用户的帖子 2、被关注话题的帖子 3、被直接关注的帖子
  if (user && method == 'user_follow') {
    //  $or　　　　或关系
    let newQuery = { '$or': [] }
    // 删除指定
    if (query.user_id) delete query.user_id;
    if (query.topic_id) delete query.topic_id;
    if (query.goal_id) delete query.goal_id;
    if (query.posts_id) delete query.posts_id;
    if (query._id) delete query._id;
    // 先查询用户自己的id？？
    newQuery['$or'].push(Object.assign({}, query, {
      user_id: user._id,
      deleted: false
    }, {}));

    // 用户
    if (user.follow_people.length > 0) {

      newQuery['$or'].push(Object.assign({}, query, {
        user_id: {
          '$in': user.follow_people,
          // 过滤屏蔽用户
          '$nin': user.block_people
        },
        deleted: false
      }, {}))
    }

    // 目标
    if (user.follow_goal.length > 0) {
      newQuery['$or'].push(Object.assign({}, query, {
        goal_id: {'$in': user.follow_goal },
        deleted: false,
        weaken: false
      }, {}))
    }

    // 帖子
    if (user.follow_posts.length > 0) {
      newQuery['$or'].push(Object.assign({}, query, {
        posts_id: {
          '$in': user.follow_posts,
          // 过滤屏蔽的帖子
          '$nin': user.block_posts
        },
        deleted: false
      }, {}))
    }

    query = newQuery;
  }

  // 联查帖子作者的相关信息
  if (select.user_id) {
    options.populate.push({
      path: 'user_id',
      select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 }
    })
  }

   // 联查帖子的评论
  if (select.comment) {
    options.populate.push({
      path: 'comment',
      // 附加查询条件
      match: {
        $or: [
          { deleted: false, weaken: false, like_count: { $gte: 2 } },
          { deleted: false, weaken: false, reply_count: { $gte: 1 } }
        ]
      },
      // 设置返回字段
      select: {
        '_id': 1, 'content_html': 1, 'create_at': 1, 'reply_count': 1,
        'like_count': 1, 'user_id': 1, 'posts_id': 1
      },
      options: { limit: 1 }
    })
  }

  // 联查帖子的目标
  if (select.goal_id) {
    options.populate.push({
      path: 'goal_id',
      select: { '_id': 1, 'name': 1 }
    })
  }

  // 如果是user_follow模式，但是用户什么也没关注
  if (query['$or'] && query['$or'].length == 0) {
    postList = [];
  } else {
    // 否则进行查询，postList 设置为默认为空数组
    [ err, postList = [] ] = await To(Posts.find({ query, select, options }));
  }

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    })
  }


  // 如果列表存在且要求返回评论，则联查评论人信息
  if (select.comment && postList.length > 0) {

    options = [
      {
        path: 'comment.user_id',
        model: 'User',
        select: { '_id': 1, 'avatar': 1, 'nickname': 1, 'brief': 1 }
      }
    ];

    [ err, postList ] = await To(Posts.populate({ collections: postList, options }));

    if (err) {
      throw CreateError({
        message: '查询失败',
        data: { errorInfo: err.message }
      });
    }

  }


  // 如果未登陆，或者已经登录但是列表为空，直接返回
  if (!user || postList.length == 0) return postList;

  // find follow status，如果用户关注了该帖子，则item.follow为true
  ids = [];

  postList.map(item=>ids.push(item._id));

  [ err, followList ] = await To(Follow.find({
    query: { user_id: user._id, posts_id: { "$in": ids }, deleted: false },
    select: { posts_id: 1 }
  }));


  ids = {};

  followList.map(item=>ids[item.posts_id] = 1);
  postList.map(item => item.follow = ids[item._id] ? true : false);


  // find like status，如果用户喜欢了该帖子，则item.like为true
  ids = [];

  postList.map(item=>ids.push(item._id));

  [ err, likeList ] = await To(Like.find({
    query: { user_id: user._id, type: 'posts', target_id: { "$in": ids }, deleted: false },
    select: { _id: 0, target_id: 1 }
  }));

  ids = {};

  likeList.map(item=>ids[item.target_id] = 1);
  postList.map(item => item.like = ids[item._id] ? true : false);

  // 更新最近查询关注的帖子？？？
  if (user && method == 'user_follow' && limit != 1) {

    await User.update({
      query: { _id: user._id },
      update: { last_find_posts_at: new Date() }
    });

  }

  return postList
}


// 获取累计数
query.countPosts = async (root, args, context, schema) => {

  const { user, role } = context
  const { method } = args

  // let select = {}, err, count, query;

  let [select, err, count, query] = [{}, null, null, null];

  // let { query } = Querys({ args, model:'posts', role });

  [ err, query ] = getQuery({ args, model:'posts', role });

  if (err) {
    throw CreateError({ message: err })
  }

  // 未登陆用户，不能使用method方式查询
  if (!user && method) {
    throw CreateError({ message: '请求被拒绝' })
  }

  // select
  schema.fieldNodes[0].selectionSet.selections.map(item=>select[item.name.value] = 1)

  /**
   * 增加屏蔽条件
   *
   * 如果是登陆状态，那么增加屏蔽条件
   * 如果通过posts查询，那么不增加屏蔽条件
   */
   if (user) {

     if (!query._id && user.block_posts_count > 0) {
       query._id = { '$nin': user.block_posts }
     }

     if (!query.user_id && user.block_people_count > 0) {
       query.user_id = { '$nin': user.block_people }
     }

   }

  // 用户关注
  if (user && method == 'user_follow') {

    let newQuery = { '$or': [] }

    if (query.user_id) delete query.user_id;
    if (query.goal_id) delete query.goal_id;
    if (query.posts_id) delete query.posts_id;
    if (query._id) delete query._id;

    newQuery['$or'].push(Object.assign({}, query, {
      user_id: user._id,
      deleted: false
    }, {}));

    // 用户
    if (user.follow_people.length > 0) {
      newQuery['$or'].push(Object.assign({}, query, {
        user_id: {
          '$in': user.follow_people,
          // 过滤屏蔽用户
          '$nin': user.block_people
        },
        deleted: false
      }, {}))
    }

    // 话题
    if (user.follow_goal.length > 0) {
      newQuery['$or'].push(Object.assign({}, query, {
        goal_id: {'$in': user.follow_goal },
        deleted: false,
        weaken: false
      }, {}))
    }

    // 帖子
    if (user.follow_posts.length > 0) {
      newQuery['$or'].push(Object.assign({}, query, {
        posts_id: {
          '$in': user.follow_posts,
          // 过滤屏蔽的帖子
          '$nin': user.block_posts
        },
        deleted: false
      }, {}))
    }

    query = newQuery;
  }

  [ err, count ] = await To(Posts.count({ query }))

  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    })
  }

  return {
    count
  }
}

function Countdown(nowDate, endDate) {

  var lastDate = Math.ceil(new Date(endDate).getTime()/1000)
  var now = Math.ceil(new Date(nowDate).getTime()/1000)
  var timeCount = lastDate - now
  var days = parseInt( timeCount / (3600*24) )
  var hours = parseInt( (timeCount - (3600*24*days)) / 3600 )
  var mintues = parseInt( (timeCount - (3600*24*days) - (hours*3600)) / 60)
  var seconds = timeCount - (3600*24*days) - (3600*hours) - (60*mintues)

  return {
    days: days,
    hours: hours,
    mintues: mintues,
    seconds: seconds
  }

}

mutation.addPosts = async (root, args, context, schema) => {

  const { user, role, ip  } = context;
  let err, // 错误
      result, // 结果
      fields; // 字段

  if (!user) throw CreateError({ message: '请求被拒绝' });

  [ err, fields ] = getSaveFields({ args, model:'posts', role });

  if (err) throw CreateError({ message: err });

  // 开始逻辑
  let { title, content, content_html, goal_id, device_id = 1, type = 1 } = fields;

  if (!ip) throw CreateError({ message: '无效的ip' });
  if (type > 1) throw CreateError({ message: 'type 无效' });

    // goal判断
    [ err, result ] = await To(Goal.findOne({
      query: { _id: goal_id }
    }));
  
    if (err) {
      throw CreateError({
        message: '查询失败',
        data: { errorInfo: err.message }
      })
    }
  
    if (!result) {
      throw CreateError({
        message: 'goal_id 不存在'
      })
    }

  // 判断是否禁言
  if (user && user.banned_to_post &&
    new Date(user.banned_to_post).getTime() > new Date().getTime()
  ) {
    let countdown = Countdown(new Date(), user.banned_to_post);
    throw CreateError({
      message: '您被限制功能，{days}天{hours}小时{mintues}分钟后解除',
      data: { error_data: countdown }
    });
  }

  /*
  // 一天仅能发布一次
  let date = new Date();
  [ err, result ] = await To(Posts.findOne({
    query: {
      user_id: user._id,
      create_at: {
        '$gte': new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
      }
    }
  }));

  if (err) {
    throw CreateError({
      message: '添加失败',
      data: { errorInfo: err.message }
    })
  }

  if (result) {
    throw CreateError({
      message: '一天仅能发布一次'
    })
  }
  */

  // title
  title = xss(title, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: (tag, name, value, isWhiteAttr) => ''
  })

  if (!title || title.replace(/(^\s*)|(\s*$)/g, "") == '') {
    throw CreateError({ message: '标题不能为空' });
  } else if (title.length > 120) {
    throw CreateError({ message: '标题不能大于120个字符' });
  }

  // content
  content = xss(content, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: (tag, name, value, isWhiteAttr) => ''
  });

  content_html = xss(content_html, {
    whiteList: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt'],
      p: [], div: [], br: [], blockquote: [], li: [], ol: [], ul: [],
      strong: [], em: [], u: [], pre: [], b: [], h1: [], h2: [], h3: [],
      h4: [], h5: [], h6: [], h7: []
    },
    stripIgnoreTag: true,
    onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
      if (tag == 'div' && name.substr(0, 5) === 'data-') {
        // 通过内置的escapeAttrValue函数来对属性值进行转义
        return name + '="' + xss.escapeAttrValue(value) + '"';
      }
    }
  });



  // 储存
  [ err, result ] = await To(Posts.save({
    data: {
      user_id: user._id,
      title,
      content,
      content_html,
      goal_id,
      ip,
      device: device_id,
      type,
      last_comment_at: new Date().getTime()
    }
  }));

  // 更新
  await To(Goal.update({
    query: { _id: goal_id },
    update: { $inc: { 'current_days_count': 1 } }
  }));

  await To(User.update({
    query: { _id: user._id },
    update: { $inc: { 'posts_count': 1 } }
  }));

  if (err) {
    throw CreateError({
      message: '储存失败',
      data: { errorInfo: err.message }
    })
  }

  // 触发新posts事件，通知客户端主动拉取
  result.create_at = new Date(result.create_at).getTime();
  global.io.sockets.emit('new-posts', result.create_at - 1);

  return {
    success: true,
    _id: result._id
  }
}


// 更新
mutation.updatePosts = async (root, args, context, schema) => {

  const { user, role } = context;

  // 必须登陆用户才有权限
  if (!user) throw CreateError({ message: '请求被拒绝' });

  let [err, query, content, result] = [];

  // 获取查询条件
  [ err, query ] = getUpdateQuery({ args, model:'posts', role });
  if (err) throw CreateError({ message: err });

  // 获取更新内容
  [ err, content ] = getUpdateContent({ args, model:'posts', role });
  if (err) throw CreateError({ message: err });

  // 判断帖子是否存在
  [ err, result ] = await To(Posts.findOne({ query }));
  if (err) {
    throw CreateError({
      message: '查询失败',
      data: { errorInfo: err.message }
    });
  }

  if (!result) throw CreateError({ message: '帖子不存在' });

  // 是否有权限修改
  if (role != 'admin' && user._id + '' != result.user_id + '') {
    throw CreateError({ message: '无权修改' });
  }

  // 更新
  [ err, result ] = await To(Posts.update({ query, update: content }));

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    });
  }

  if (Reflect.has(content, 'deleted')) {

    // 更新feed中相关posts的delete状态
    let err, feedList;

    [ err, feedList ] = await To(Feed.find({
      query: { posts_id: query._id }
    }));

    let ids = [];

    feedList.map(feed=>ids.push(feed._id));

    [ err ] = await To(Feed.update({
      query: { _id: { '$in': ids } },
      update: { deleted: content.deleted },
      options: { multi: true }
    }));

    if (err) {
      throw CreateError({
        message: 'Feed 更新失败',
        data: { errorInfo: err.message }
      });
    }

  }

  return { success: true }
}


mutation.viewPosts = async (root, args, context, schema) => {

  const { posts_id } = args;

  let query = {
    _id: posts_id
  }

  let [ err, result ] = await To(Posts.update({
    query,
    update: { $inc: { view_count: 1 } }
  }));

  if (err) {
    throw CreateError({
      message: '更新失败',
      data: { errorInfo: err.message }
    });

    return { success: false }
  }

  return {
    success: true
  }
}

exports.query = query
exports.mutation = mutation
exports.resolvers = resolvers
