const GeTui = require('./SDK/geitui');
const Target = require('./SDK/geitui/getui/Target');

class PUSH {
  constructor() {
    this.AppID = 'txNadX2iNP7pah5Nn6joc5';
    this.AppSecret = '6UGNyfOEf96D9XAOGfuWT3';
    this.AppKey = '25li1AgaWg8AEQHXtc1hX8';
    this.MasterSecret = '4TBABQ352R8O34v1LlSAH3';

    this.gt = new GeTui('https://api.getui.com/apiex.htm', this.AppKey, this.MasterSecret);
  }
  /**
   * 对正处于推送状态，或者未接收的消息停止下发（list或app任务）
   * @param {String} taskid	任务id(格式OSL-yyMM_XXXXXX)
   */
  stoptask(taskId) {
    return new Promise(async (resolve, reject) => {
      this.gt.stop(taskId, this.callback);
    });
  }
  /**
   * 对单个用户推送消息
   * @param {object} message 消息体
   * @param {object} target 推送目标
   * @param {*} requestId
   */
  pushMessageToSingle(clientID) {
    const target = new Target({
      appId: this.AppID,
      clientId: clientID,
    });
    const message = new SingleMessage({
      isOffline: true,                        // 是否离线
      offlineExpireTime: 3600 * 12 * 1000,    // 离线时间
      data: TransmissionTemplateDemo(),       // 设置推送消息类型
      pushNetWorkType: 0                      // 是否wifi ，0不限，1wifi
    });

    return new Promise(async (resolve, reject) => {
      this.gt.pushMessageToSingle(message, target, function callback(err, res) {
        if (err) {
          reject();
          // Error	请求信息填写有误
          // action_error	未找到对应的action动作
          // appkey_error	Appkey填写错误
          // domain_error	填写的域名错误或者无法解析
          // sign_error	Appkey与ClientId不匹配，鉴权失败
          // AppidNoMatchAppKey	appid和鉴权的appkey不匹配
          // PushMsgToListOrAppTimesOverLimit	群推次数超过最大值
          // PushTotalNumOverLimit	推送个数总数超过最大值
          // AppIdNoUsers	该AppId下的用户总数为0
          // SendError	消息推送发送错误
          // SynSendError	报文发送错误
          // flow_exceeded	接口消息推送流量已超限
          // TargetListIsNullOrSizeIs0	推送target列表为空
          // PushTotalNumOverLimit	推送消息个数总数超限
          // TokenMD5NoUsers	target列表没有有效的clientID
          // NullMsgCommon	未找到contentId对应的任务
          // TaskIdHasBeanCanceled	任务已经被取消
          // AppidError	clientid绑定的appid与推送的appid不符
          // successed_ignore	无效用户，消息丢弃
          // TokenMD5Error	clientID填写有误
          // SendError	消息发送错误
          // AppidNoAppSecret	appid未找到对应的appSecret
          // OtherError	未知错误，无法判定错误类型
          switch (err) {
            case 'Error':

              break;

            default:
              break;
          }
        } else {
          resolve();
          // 正确返回	返回码	结果说明
          // successed_online	用户在线，消息在线下发
          // successed_offline	用户离线，消息存入离线系统
          // Ok	发送成功
          // details	返回用户状态的详细信息
          // contentId	任务ID（当result值为ok时，有此字段）
          // msgTotal	有效下发数
          // msgProcess	消息回执总数
        }
      });
    });
  }
}

module.exports = new PUSH();