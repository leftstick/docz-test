import React from "react";
import PropTypes from "prop-types";
import download from "downloadjs";

import { ajax } from "./helper/xhr";

class RfReceiver extends React.Component {
  _fireOriginalClick = e => {
    const { children } = this.props;
    const childCallback = children.props.onClick;
    if (childCallback) {
      childCallback(e);
    }
  };

  _onClick = e => {
    const { url, fileMIMEType, fileName, headers } = this.props;
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this._fireOriginalClick(e);

    ajax({
      url: isString(url) ? url : url(),
      method: "GET",
      responseType: "blob",
      headers: headers || {}
    }).then(response => {
      download(response, getFileName(fileName, url), fileMIMEType);
    });
  };

  render() {
    const { children } = this.props;
    const child = React.Children.only(children);
    const newChild = React.cloneElement(child, {
      onClick: this._onClick
    });
    return newChild;
  }
}

RfReceiver.propTypes = {
  children: PropTypes.any,
  url: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  headers: PropTypes.object,
  fileName: PropTypes.string,
  fileMIMEType: PropTypes.string
};

RfReceiver.defaultProps = {
  headers: {},
  fileMIMEType: "application/octet-stream"
};

export default RfReceiver;

function getFileName(fileName, url) {
  if (fileName) {
    return fileName;
  }
  if (!url) {
    return "";
  }
  const splitWithSlash = url.split("/");
  const lastPiece = splitWithSlash.pop();
  if (!lastPiece) {
    return "";
  }
  return lastPiece.split("?")[0] || "downloaded";
}

function isString(url) {
  return Object.prototype.toString.call(url) === "[object String]";
}
