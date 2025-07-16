export const httpErrors = {
  //user
  USER_IS_NOT_EXSITED: {
    message: 'User không tồn tại.',
    code: 'USER_00000',
  },
  EMAIL_EXSITED: {
    message: 'Email đã tồn tại.',
    code: 'USER_00001',
  },
  PASSWORD_HAS_SPACE: {
    message: 'Password không được chứa dấu space.',
    code: 'USER_00002',
  },
  WRONG_PASSWORD: {
    message: 'Sai password.',
    code: 'USER_00003',
  },
  //role
  ROLE_IS_NOT_EXSITED: {
    message: 'Role không tồn tại.',
    code: 'ROLE_00000',
  },
  ROLE_IS_USED: {
    message: 'Role đã sử dụng không được xóa.',
    code: 'ROLE_00001',
  },
  // gsm
  GSM_IS_NOT_EXSITED: {
    message: 'Gsm không tồn tại.',
    code: 'GSM_00000',
  },
  //send sms
  SMS_SEND_EXSITED: {
    message: 'File sms này đã tồn tại.',
    code: 'SMSSEND_00000',
  },
  SMS_FILE_NOT_FOUND: {
    message: 'File sms này không tồn tại.',
    code: 'SMSSEND_00001',
  },
  SMS_SEND_BATCH_ERROR: {
    message: 'Lỗi khi gửi sms batch.',
    code: 'SMSSEND_00002',
  },

  //run setup
  RUN_SETUP: {
    message: 'khong the run setup do dang chay',
    code: 'GSM_00001',
  },

  //blocked sim
  BLOCKED_SIM_IS_NOT_EXSITED: {
    message: 'Blocked sim không tồn tại.',
    code: 'BLOCKEDSIM_00001',
  },

  SIM_NOT_FOUND: {
    message: 'Sim not found.',
    code: 'SIM_00001',
  },

  //mode
  MODE_NOT_FOUND: {
    message: 'Mode không tồn tại.',
    code: 'MODE_00001',
  },

  //
  CANNOT_FORWARD_SMS: {
    message: 'Cannot foward sms.',
    code: 'FORWARDSMS_00001',
  },

  //some thing went wrong
  SOMETHING_WENT_WRONG: {
    message: 'Something went wrong.',
    code: 'SOMETHING_WENT_WRONG_00000',
  },
};
