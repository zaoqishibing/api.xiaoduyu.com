import Posts from './posts';
import Topic from './topic';
import User from './user';
import Goals from './goals';
import Comment from './comment';
import UserNotification from './user-notification';
import Notification from './notification';
import Captcha from './captcha';
import Account from './account';
import Qiniu from './qiniu';
import Block from './block';
import Countries from './countries';
import Follow from './follow';
import Like from './like';
import Password from './password';
import Phone from './phone';
import Forgot from './forgot';
import Oauth from './oauth';
import Report from './report';
import UnlockToken from './unlock-token';
import Token from './token';
import Feed from './feed';

const typeDefs = [ `

  ${Posts.Schema}
  ${Topic.Schema}
  ${User.Schema}
  ${Goals.Schema}
  ${Comment.Schema}
  ${UserNotification.Schema}
  ${Notification.Schema}
  ${Captcha.Schema}
  ${Account.Schema}
  ${Qiniu.Schema}
  ${Block.Schema}
  ${Countries.Schema}
  ${Follow.Schema}
  ${Like.Schema}
  ${Password.Schema}
  ${Phone.Schema}
  ${Forgot.Schema}
  ${Oauth.Schema}
  ${Report.Schema}
  ${UnlockToken.Schema}
  ${Token.Schema}
  ${Feed.Schema}

  # 查询
  type Query {
    ${Posts.Query}
    ${Topic.Query}
    ${User.Query}
    ${Goals.Query}
    ${Comment.Query}
    ${UserNotification.Query}
    ${Notification.Query}
    ${Captcha.Query}
    ${Account.Query}
    ${Qiniu.Query}
    ${Block.Query}
    ${Countries.Query}
    ${Follow.Query}
    ${Like.Query}
    ${Password.Query}
    ${Phone.Query}
    ${Forgot.Query}
    ${Oauth.Query}
    ${Report.Query}
    ${UnlockToken.Query}
    ${Token.Query}
    ${Feed.Query}
  }

  # 增、删、改
  type Mutation {
    ${Posts.Mutation}
    ${Topic.Mutation}
    ${User.Mutation}
    ${Goals.Mutation}
    ${Comment.Mutation}
    ${UserNotification.Mutation}
    ${Notification.Mutation}
    ${Captcha.Mutation}
    ${Account.Mutation}
    ${Qiniu.Mutation}
    ${Block.Mutation}
    ${Countries.Mutation}
    ${Follow.Mutation}
    ${Like.Mutation}
    ${Password.Mutation}
    ${Phone.Mutation}
    ${Forgot.Mutation}
    ${Oauth.Mutation}
    ${Report.Mutation}
    ${UnlockToken.Mutation}
    ${Token.Mutation}
    ${Feed.Mutation}
  }

  schema {
    mutation: Mutation
    query: Query
  }

`];

export default typeDefs;
