/**
 * @typedef {Object} Options - options for initializing ajax
 * @property {string} url - url indicates the file
 * @property {string} method - http method for ajax
 * @property {string} responseType - responseType for ajax
 * @property {{[key: string]: value}} headers - specific headers
 */

/**
 *
 * @param {Options} options
 */
export function ajax(options) {
  const opts = getOptions(options)

  const xhr = new XMLHttpRequest()

  return new Promise((resolve, reject) => {
    let resolved = false

    const { method, url, async, headers, responseType, timeout } = opts

    xhr.open(method, url, !!async)

    const timer = setTimeout(() => {
      if (resolved) {
        return
      }

      try {
        xhr.timeout = true
        xhr.status = 0
        xhr.abort()
      } catch (error) {}

      reject(xhr)
    }, timeout)

    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key])
    })

    if (responseType) {
      xhr.responseType = responseType
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const parse = req => req.response || req.responseText

        resolved = true
        clearTimeout(timer)

        if (isHTTPStatusValid(xhr.status)) {
          resolve(parse(xhr))
        } else {
          reject(xhr)
        }
      }
    }

    xhr.onerror = () => {
      resolved = true
      clearTimeout(timer)
      reject(xhr)
    }

    xhr.onabort = () => {
      resolved = true
      clearTimeout(timer)
      reject(xhr)
    }

    xhr.send()
  })
}

/**
 *
 * @param {Options} opts
 */
function getOptions(opts) {
  const { method, url, responseType, headers } = opts || {}
  return {
    method: method || 'GET',
    url,
    async: true,
    timeout: 1000 * 60 * 30,
    responseType,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      ...(headers || {})
    }
  }
}

function isHTTPStatusValid(status) {
  return (status >= 200 && status < 300) || status === 304
}
