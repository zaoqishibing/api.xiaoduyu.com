// 查询
const query = {
  // 筛选条件
  filters: {
    _id: data => {
      let _data = data + '';
      let value = _data.indexOf(',') != -1 ? { '$in': _data.split(',') } : _data;
      return {
        name: '_id', value,
        type: 'ID', desc: '目标ID'
      }
    },
    user_id: data => {
      let _data = data + '';
      let value = _data.indexOf(',') != -1 ? { '$in': _data.split(',') } : _data;
      return {
        name: 'user_id', value,
        type: 'ID', desc: '用户ID'
      }
    },
    topic_id: data => {
      let _data = data + '';
      let value = _data.indexOf(',') != -1 ? { '$in': _data.split(',') } : _data;
      return {
        name: 'topic_id', value,
        type: 'ID', desc: '话题ID'
      }
    },
    name: data => {

      let s = (data + '').split(' ');

      return {
        name: 'title',
        value: { $regex: RegExp("(" + s.join('|') + ")", "i") },
        type: 'String', desc: '目标名称'
      }
    },
    completed: data => ({
      name: 'deleted', value: data,
      type: 'Boolean', desc: '是否完成'
    }),
    // 因为int类型长度大于11位，graphql 会认为格式不是int
    more_money: data => ({
      name: 'money', value: { '$gte': data },
      type: 'Int', desc: '大于等于金额'
    }),
    less_money: data => ({
      name: 'money', value: { '$lte': data },
      type: 'Int', desc: '小于等于金额'
    }),
      // 因为int类型长度大于11位，graphql 会认为格式不是int
    start_create_at: data => ({
      name: 'create_at', value: { '$gte': data },
      type: 'String', desc:'开始日期'
    }),
    end_create_at: data => ({
      name: 'create_at', value: { '$lte': data },
      type: 'String', desc:'结束日期'
    }),
    // method: data => ({
    //   name: '', value: '',
    //   type: 'String', desc: '模式(user_follow)'
    // })
  },
  // 排序，page size，page number
  options: {
    page_number: data => ({
      name: 'skip', value: data - 1 >= 0 ? data - 1 : 0,
      type: 'Int', desc: '第几页'
    }),

    page_size: data => ({
      name: 'limit', value: data,
      type: 'Int', desc: '每页数量'
    }),

    sort_by: data => {
      let value = {};
      (data + '').split(',').map(item => {
        if (item) value[item] = -1;
      });
      return ({
        name: 'sort', value,
        type: 'String', desc: '排序方式: create_at,money,deadline等'
      })
    }
  }
}

// 储存
const save = {
  name: data => ({
    name: 'name', value: data, type: 'String!', desc:'名称'
  }),
  time_number: data => ({
    name: 'time_number', value: data, type: 'String!', desc:'时长或者数量'
  }),
  days_of_perweek: data => ({
    name: 'days_of_perweek', value: data, type: '[Int]!', desc:'每周打卡天数设置'
  }),
  topic_id: data => ({
    name: 'topic_id', value: data, type: 'ID', desc:'话题'
  }),
  device_id: data => ({
    name: 'device_id', value: data, type: 'Int', desc:'设备'
  }),
  days_of_number: data => ({
    name: 'days_of_number', value: data, type: 'Int!', desc:'目标天数'
  }),
  picture_of_punch: data => ({
    name: 'picture_of_punch', value: data, type: 'Int!', desc:'图片要求'
  }),
  important_things: data => ({
    name: 'important_things', value: data, type: 'String', desc:'目标物体'
  }),
  money: data => ({
    name: 'money', value: data, type: 'Int!', desc:'押金金额'
  })
}


// 更新
const update = {
  // 筛选参数
  filters: {
    _id: data => ({
      name: '_id',
      value: data,
      type: 'ID!',
      desc: 'ID'
    })
  },
  // 更新内容
  content: {
    name: data => ({
      name: 'name',
      value: data,
      type: 'String!',
      desc: '目标名称'
    }),
    name: data => ({
      name: 'name', value: data, type: 'String!', desc:'名称'
    }),
    time_number: data => ({
      name: 'time_number', value: data, type: 'String!', desc:'时长或者数量'
    }),
    days_of_perweek: data => ({
      name: 'days_of_perweek', value: data, type: '[Int]!', desc:'每周打卡天数设置'
    }),
    topic_id: data => ({
      name: 'topic_id', value: data, type: 'ID!', desc:'话题'
    }),
    device_id: data => ({
      name: 'device_id', value: data, type: 'Int', desc:'设备'
    }),
    days_of_number: data => ({
      name: 'days_of_number', value: data, type: 'Int', desc:'目标天数'
    }),
    picture_of_punch: data => ({
      name: 'picture_of_punch', value: data, type: 'Int', desc:'图片要求'
    }),
    important_things: data => ({
      name: 'important_things', value: data, type: 'String', desc:'目标物体'
    }),
    money: data => ({
      name: 'money', value: data, type: 'Int', desc:'押金金额'
    })
  }
}

export default {
  query,
  save,
  update
}