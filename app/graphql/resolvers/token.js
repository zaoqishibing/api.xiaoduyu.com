
import { Token } from '../../modelsa';

let query = {},
    mutation = {},
    resolvers = {};

import JWT from '../../common/jwt';
import To from '../../common/to';
import CreateError from './errors';


mutation.exchangeNewToken = async (root, args, context, schema) => {

  const { user, role, ip, jwtTokenSecret } = context;

  let err, result, query, token = args.token;

  let decoded = JWT.decode(token, jwtTokenSecret);

  // 解析错误
  if (!decoded || !decoded.user_id) {
    throw CreateError({ message: '无效的token，token无法解析' });
  }

  // 查询token是否存在
  [ err, result ] = await To(Token.findOne({
    query: { user_id: decoded.user_id, token },
    options: { populate: [{ path: 'user_id' }] }
  }));

  // 一个token最多兑换3次
  if (result && result.exchange_count <= 2) {

    [ err ] = await To(Token.update({
      query: { _id: result._id },
      update: { exchange_count: result.exchange_count+1 }
    }));

    if (err) throw CreateError({ message: err });

    let newToken = JWT.encode(jwtTokenSecret, result.user_id._id, result.user_id.accessToken, ip);

    return {
      access_token: newToken.access_token,
      expires: newToken.expires
    }

  } else {

    // 如果是重复兑换token超过次数，清空该用户的所有token，强制重新登陆
    await To(Token.remove({ query: { user_id: decoded.user_id } }));
    throw CreateError({ message: '无效的token，请重新登陆' });
  }

}

exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;
