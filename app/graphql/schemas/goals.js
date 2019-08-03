
// import Query from '../querys'
// import Saves from '../saves'
// import Updates from '../updates'
//
// const { querySchema } = Query({ model: 'topic' })
// const { saveSchema } = Saves({ model: 'topic' })
// const { updateSchema } = Updates({ model: 'topic' })

import { getQuerySchema, getUpdateSchema, getSaveSchema } from '../config';

exports.Schema = `


# 目标
type Goals {
  _id: String
  name: String
  picture_of_punch: Int
  current_days_count: Int
  days_of_number: Int
  sort: Int
  user_id：Int
  money：Int
  create_at: String
  language: Int
  recommend: Boolean
  user_id: String
}


# 目标计数
type countGoalses {
  count: Int
}

# 添加目标
type addGoals {
  # 结果
  success: Boolean
  # posts id
  _id: ID
}

# 更新目标
type updateGoals {
  success: Boolean
}
`

exports.Query = `

# 查询目标
goalses(${getQuerySchema('goals')}): [Goals]

# 目标计数
countGoalses(${getQuerySchema('goals')}): countGoalses

`

exports.Mutation = `
# 添加目标
addGoals(${getSaveSchema('goals')}): addGoals
# 更新目标
updateGoals(${getUpdateSchema('goals')}): updateGoals

`
