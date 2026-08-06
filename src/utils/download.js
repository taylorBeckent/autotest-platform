

import { USER_TOKEN } from '../models/login';
import axios from 'axios';
import { message, Button, notification } from 'antd';

function getFileName(res) {
  const existingFilename = res.headers['filename'];
  if (existingFilename) {
    return decodeURI(existingFilename);
  }
  const disposition = res.headers['content-disposition'];
  let fileName = '';
  if (disposition) {
    const filenameRegex = /filename[^;=\n]*=((['"].*?\2|[^;\n]*))/;
    const matches = filenameRegex.exec(disposition);
    if (matches !== null && matches[1]) {
      fileName = matches[1].replace(/['"]/g, '') || '';
    }
    if (fileName !== '') {
      return decodeURIComponent(fileName.replace(/^UTF-8/i, ''));
    }
    const utf8Match = disposition.match(/filename[^;=\n]*=['"]?([^"'\n;]*)/i);
    if (utf8Match && utf8Match[1]) {
      return decodeURIComponent(utf8Match[1]);
    }
  }
};


function getFileName1(res) {
  const existingFilename = res.headers['filename'];
  if (existingFilename) {
    return decodeURI(existingFilename);
  }
  const disposition = res.headers['content-disposition'];
  let fileName = '';
  if (disposition) {
    // const filenameRegex = /filename[^;=\n]*=((['"].*?\2|[^;\n]*))/;
    // const matches = filenameRegex.exec(disposition);
    // if (matches !== null && matches[1]) {
    //   fileName = matches[1].replace(/['"]/g, '') || '';
    // }
    const arr = disposition.split('=');
    const str = arr[1].substr(1, arr[1].length - 2);
    return str;
  }
}

function getFildNameReplaceZip(res) {
  const existingFilename = res.headers['filename'];
  if (existingFilename) {
    return decodeURI(existingFilename);
  }
  const disposition = res.headers['content-disposition'];
  let fileName = '';
  if (disposition) {
    const arr = disposition.split('=');
    let str = arr[1].indexOf("''") ? arr[1].split("''")[1] : arr[1];
    fileName = decodeURIComponent(str);
  }
  return fileName;
}

function getExcel(url, params) {
  axios.get(url, {
    params,
    responseType: 'blob', // 表明返回服务器返回的数据类型
    headers: {
      Accept: 'application/json',
    },
  }).then(res => {
    let r = new FileReader()
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.retCd && errorInfos?.retCd !== '000000') {
          message.error(errorInfos?.retMsg)
        }
      } catch (error) { }
    }
    r.readAsText(res.data)
    const content = res;
    const fileName = getFileName(res);
    const blob = new Blob([content.data], {
      type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
    });
    if ('download' in document.createElement('a')) {
      // 非IE浏览器下载
      const elink = document.createElement('a');
      elink.download = fileName;
      elink.style.display = 'none';
      elink.target = '_blank';
      elink.href = URL.createObjectURL(blob);
      document.body.appendChild(elink);
      elink.click();
      // URL.revokeObjectURL(elink.href);
      document.body.removeChild(elink);
    } else {
      // IE10+下载
      navigator.msSaveBlob(blob, fileName);
      window.location.reload();
    }
  });
}

function getExcel1(url, params) {
  const token = sessionStorage.getItem(USER_TOKEN);
  axios.get(url, {
    params,
    responseType: 'blob', // 表明返回服务器返回的数据类型
    headers: {
      Authorization: token,
      Accept: 'application/json',
    },
    timeout: 1000 * 1000
  }).then(res => {
    let r = new FileReader()
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.retCd !== '000000') {
          message.error(errorInfos?.retMsg)
        }
      } catch (error) {
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }

    r.readAsText(res.data)
    const content = res;
    const fileName = getFileName(res);
    const blob = new Blob([content.data], {
      type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
    });
  });
};

function getExcelNew(url, params) {
  axios({
    method: 'Get',
    url,
    data: params,
    headers: {
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.retCd !== '000000') {
          message.error(errorInfos?.retMsg)
        } else if (errorInfos?.retCd == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
  });
}


function postGetExcel(url, params) {
  const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result);
        if (errorInfos?.code !== '000000') {
          message.error(errorInfos?.message)
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
  }).catch(error => {
    message.error(`${error.response?.status}   ${error.response?.statusText}`)
  })
};

function postGetExcel1(url, params) {
  // const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      // Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.retCd !== '000000') {
          message.error(errorInfos?.retMsg)
        } else if (errorInfos?.retCd == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
  });
}
function postGetExcel12(url, params) {
  // const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      // Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.code !== '000000') {
          message.error(errorInfos?.message)
        } else if (errorInfos?.code == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
  });
}

function postGetExcel2(url, params) {
  const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.retCd !== '000000') {
          message.error(errorInfos?.retMsg)
        } else if (errorInfos?.retCd == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
  });
}
function postGetExcel4(url, params) {
  const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.code !== '000000') {
          message.error(errorInfos?.data)
        } else if (errorInfos?.code == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
  });
}

function postGetExcelSync(url, params, callback) {
  const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      Authorization: token,
      Accept: 'application/json',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOm51bGwsImFsaWFzIjpudWxsLCJlbWFpbCI6bnVsbCwicGhvbmUiOm51bGwsImF2YXRhciI6bnVsbCwic3RhdGUiOjAsImlzX2FjdGl2ZSI6bnVsbCwiaXNfc3VwZXJ1c2VyIjp0cnVlLCJsYXN0X2xvZ2luIjpudWxsLCJhY2Nlc3NfdG9rZW4iOm51bGwsImV4cCI6MTgxNzQzMzM5NCwidG9rZW5fdmVyc2lvbiI6MH0.k6ue_ZpEvsaDx9LrBHjDTaSpzS0dfGPsZif3r4ArK2Y'
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.code !== '000000') {
          message.error(errorInfos?.message)
          callback('failed')
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
        callback('success')
      }
    }
  }).catch(error => {
    message.error(`${error.response?.status}   ${error.response?.statusText}`);
    callback('failed');
  })
};

//.测试数据下载
function postGetExcel3(url, params) {
  // const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      // Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.retCd !== '000000') {
          message.error(errorInfos?.retMsg)
        } else if (errorInfos?.retCd == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName1(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
  });
}
//.存量数据领用
function postGetExcel5(url, params, callback) {
  // const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      // Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    console.log('res:', res);
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.retCd !== '000000') {
          message.error(errorInfos?.retMsg)
        } else if (errorInfos?.retCd == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }

      } catch (error) {
        const content = res;
        const fileName = getFileName1(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
    callback()
  });
}

//.状态字
function postGetExcel6(url, params, callback) {
  // const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      // Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.code !== '000000') {
          message.error(errorInfos?.message)
        } else if (errorInfos?.code == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }

      } catch (error) {
        const content = res;
        const fileName = getFileName1(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
    callback()
  });
}

//.征信
function postGetExcel7(url, params, callback) {
  axios({
    method: 'POST',
    url,
    data: params,
    headers: { Accept: 'application/json' },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.retCd !== '000000') {
          message.error(errorInfos?.retMsg)
        } else if (errorInfos?.retCd == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName1(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }

      }
    }
    callback()
  }).catch(error => {
    callback()
  });
}

function downloadFile(fileName, file) {
  const blob = new Blob([file], {
    type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
  });
  if ('download' in document.createElement('a')) {
    // 非IE浏览器下载
    const elink = document.createElement('a');
    elink.download = fileName;
    elink.style.display = 'none';
    elink.target = '_blank';
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    // URL.revokeObjectURL(elink.href);
    document.body.removeChild(elink);
  } else {
    // IE10+下载
    navigator.msSaveBlob(blob, fileName);
    window.location.reload();
  }
}

function downloadAccountDetail(url, params) {
  const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result);
        if (errorInfos?.code !== '000000') {
          message.error(errorInfos?.message)
        }
      } catch (error) {
        const content = res;
        const fileName = getFileName(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
  }).catch(error => {
    message.error(`${error.response?.status}   ${error.response?.statusText}`)
  })
};

function postGetJSON(url, params) {
  const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const responseInfo = JSON.parse(r.result);
        if (responseInfo?.code && responseInfo?.code !== '000000') {
          message.error(responseInfo?.message);
          return;
        }
        const fileName = getFileName(res);
        const jsonString = JSON.stringify(responseInfo, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = url;
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      } catch (error) {
        console.log(error);
      }

    }
  }).catch(error => {
    message.error(`${error.response?.status}   ${error.response?.statusText}`)
  })
};

//. 字段替换
function downloadReplaceZip(url, params, callback) {
  // const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      // Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    console.log(res);
    let r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => {
      try {
        const errorInfos = JSON.parse(r.result)
        if (errorInfos?.code !== '000000') {
          message.error(errorInfos?.message)
        } else if (errorInfos?.code == '000000' && !errorInfos?.data) {
          message.error('操作失败，暂无符合查询条件的数据')
        }

      } catch (error) {
        const content = res;
        const fileName = getFildNameReplaceZip(res);
        const blob = new Blob([content.data], {
          type: 'application/vnd.openxmlformarts-officedocument.spreadsheetml.sheet;charset=utf-8',
        });
        if ('download' in document.createElement('a')) {
          // 非IE浏览器下载
          const elink = document.createElement('a');
          elink.download = fileName;
          elink.style.display = 'none';
          elink.target = '_blank';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          // URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
          window.location.reload();
        }
      }
    }
    callback()
  });
}


function postGetPdf(url, params) {
  const token = sessionStorage.getItem(USER_TOKEN);
  axios({
    method: 'POST',
    url,
    data: params,
    headers: {
      Authorization: token,
      Accept: 'application/json',
    },
    responseType: 'blob' // 表明返回服务器返回的数据类型
  }).then(res => {
    const filePaths =  params.filePath?.split("/");
    const fileName = filePaths[filePaths.length-1];
    const blob = res.data;
    if ('download' in document.createElement('a')) {
      // 非IE浏览器下载
      const elink = document.createElement('a');
      elink.download = fileName;
      elink.style.display = 'none';
      elink.target = '_blank';
      elink.href = URL.createObjectURL(blob);
      document.body.appendChild(elink);
      elink.click();
      // URL.revokeObjectURL(elink.href);
      document.body.removeChild(elink);
    } else {
      // IE10+下载
      navigator.msSaveBlob(blob, fileName);
      window.location.reload();
    }
  }).catch(error => {
    message.error(`${error.response?.status}   ${error.response?.statusText}`)
  })
};

export default {
  getExcel,
  getExcel1,
  postGetExcel,
  postGetExcel1,
  postGetExcel12,
  postGetExcel2,
  postGetExcel3,
  postGetExcel4,
  postGetExcel5,
  postGetExcel6,
  postGetExcel7,
  postGetExcelSync,
  downloadFile,
  downloadAccountDetail,
  postGetJSON,
  getExcelNew,
  downloadReplaceZip,
  postGetPdf
}
