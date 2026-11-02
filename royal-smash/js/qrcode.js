/**
 * Pure JavaScript QR Code Generator (Zero Dependencies)
 * Generates standard QR Codes to HTML5 Canvas or SVG.
 * Based on the public domain QR Code Specification by Kazuhiko Arase.
 */
(function(window) {
  'use strict';

  // QR Code Constants
  var QRMode = { MODE_NUMBER: 1, MODE_ALPHA_NUM: 2, MODE_8BIT_BYTE: 4, MODE_KANJI: 8 };
  var QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
  var QRMaskPattern = {
    PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3,
    PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7
  };

  // Galois Field Math
  var QRMath = {
    glog: function(n) {
      if (n < 1) throw new Error("glog(" + n + ")");
      return QRMath.LOG_TABLE[n];
    },
    gexp: function(n) {
      while (n < 0) n += 255;
      while (n >= 256) n -= 255;
      return QRMath.EXP_TABLE[n];
    },
    EXP_TABLE: new Array(256),
    LOG_TABLE: new Array(256)
  };

  for (var i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
  for (var i = 8; i < 256; i++) {
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
  }
  for (var i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;

  function QRPolynomial(num, shift) {
    if (num.length === undefined) throw new Error(num.length + "/" + shift);
    var offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (var i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
  }

  QRPolynomial.prototype = {
    get: function(index) { return this.num[index]; },
    getLength: function() { return this.num.length; },
    multiply: function(e) {
      var num = new Array(this.getLength() + e.getLength() - 1);
      for (var i = 0; i < this.getLength(); i++) {
        for (var j = 0; j < e.getLength(); j++) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
        }
      }
      return new QRPolynomial(num, 0);
    },
    mod: function(e) {
      if (this.getLength() - e.getLength() < 0) return this;
      var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
      var num = new Array(this.getLength());
      for (var i = 0; i < this.getLength(); i++) num[i] = this.get(i);
      for (var i = 0; i < e.getLength(); i++) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
      }
      return new QRPolynomial(num, 0).mod(e);
    }
  };

  function QRRSBlock(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }

  QRRSBlock.RS_BLOCK_TABLE = [
    // L, M, Q, H for version 1 to 14
    [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
    [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
    [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
    [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
    [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
    [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
    [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
    [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
    [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],
    [4, 81, 65], [1, 72, 46, 4, 73, 47], [4, 47, 21, 4, 48, 22], [4, 47, 13, 8, 48, 14],
    [2, 92, 74, 2, 93, 75], [6, 73, 47, 2, 74, 48], [4, 45, 17, 6, 46, 18], [8, 45, 13, 4, 46, 14],
    [4, 107, 87], [8, 75, 49, 1, 76, 50], [8, 47, 19, 4, 48, 20], [10, 46, 15, 2, 47, 16],
    [3, 115, 95, 1, 116, 96], [4, 75, 47, 5, 76, 48], [11, 46, 17, 5, 47, 18], [3, 45, 13, 11, 46, 14]
  ];

  QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
    var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
    if (rsBlock === undefined) throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
    var length = rsBlock.length / 3;
    var list = [];
    for (var i = 0; i < length; i++) {
      var count = rsBlock[i * 3 + 0];
      var totalCount = rsBlock[i * 3 + 1];
      var dataCount = rsBlock[i * 3 + 2];
      for (var j = 0; j < count; j++) list.push(new QRRSBlock(totalCount, dataCount));
    }
    return list;
  };

  QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
    switch (errorCorrectLevel) {
      case QRErrorCorrectLevel.L: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectLevel.M: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectLevel.Q: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectLevel.H: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default: return undefined;
    }
  };

  function QRBitBuffer() {
    this.buffer = [];
    this.length = 0;
  }

  QRBitBuffer.prototype = {
    get: function(index) {
      var bufIndex = Math.floor(index / 8);
      return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1;
    },
    put: function(num, length) {
      for (var i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    },
    getLengthInBits: function() { return this.length; },
    putBit: function(bit) {
      var bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) this.buffer.push(0);
      if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
      this.length++;
    }
  };

  function QR8bitByte(data) {
    this.mode = QRMode.MODE_8BIT_BYTE;
    this.data = data;
    this.parsedData = [];
    for (var i = 0, l = this.data.length; i < l; i++) {
      var byteArray = [];
      var code = this.data.charCodeAt(i);
      if (code > 0x10000) {
        byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
        byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
        byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
        byteArray[3] = 0x80 | (code & 0x3F);
      } else if (code > 0x800) {
        byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
        byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
        byteArray[2] = 0x80 | (code & 0x3F);
      } else if (code > 0x80) {
        byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
        byteArray[1] = 0x80 | (code & 0x3F);
      } else {
        byteArray[0] = code;
      }
      this.parsedData.push(byteArray);
    }
    this.parsedData = Array.prototype.concat.apply([], this.parsedData);
    if (this.parsedData.length !== this.data.length) {
      this.parsedData.unshift(191);
      this.parsedData.unshift(187);
      this.parsedData.unshift(239);
    }
  }

  QR8bitByte.prototype = {
    getLength: function() { return this.parsedData.length; },
    write: function(buffer) {
      for (var i = 0, l = this.parsedData.length; i < l; i++) {
        buffer.put(this.parsedData[i], 8);
      }
    }
  };

  function QRCodeModel(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }

  QRCodeModel.prototype = {
    addData: function(data) {
      var newData = new QR8bitByte(data);
      this.dataList.push(newData);
      this.dataCache = null;
    },
    isDark: function(row, col) {
      if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
        throw new Error(row + "," + col);
      }
      return this.modules[row][col];
    },
    getModuleCount: function() { return this.moduleCount; },
    make: function() {
      if (this.typeNumber < 1) {
        var typeNumber = 1;
        for (typeNumber = 1; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);
          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
          var length = 0;
          for (var i = 0; i < this.dataList.length; i++) {
            var data = this.dataList[i];
            length += 4;
            length += 8; // 8-bit byte mode char count indicator length for V1-9
            length += data.getLength() * 8;
          }
          if (length <= totalDataCount * 8) break;
        }
        this.typeNumber = Math.min(typeNumber, 10);
      }
      this.makeImpl(false, this.getBestMaskPattern());
    },
    makeImpl: function(test, maskPattern) {
      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = new Array(this.moduleCount);
      for (var row = 0; row < this.moduleCount; row++) {
        this.modules[row] = new Array(this.moduleCount);
        for (var col = 0; col < this.moduleCount; col++) this.modules[row][col] = null;
      }
      this.setupPositionProbePattern(0, 0);
      this.setupPositionProbePattern(this.moduleCount - 7, 0);
      this.setupPositionProbePattern(0, this.moduleCount - 7);
      this.setupPositionAdjustPattern();
      this.setupTimingPattern();
      this.setupTypeInfo(test, maskPattern);
      if (this.typeNumber >= 7) this.setupTypeNumber(test);
      if (this.dataCache === null) this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
      this.mapData(this.dataCache, maskPattern);
    },
    setupPositionProbePattern: function(row, col) {
      for (var r = -1; r <= 7; r++) {
        if (row + r <= -1 || this.moduleCount <= row + r) continue;
        for (var c = -1; c <= 7; c++) {
          if (col + c <= -1 || this.moduleCount <= col + c) continue;
          if ((0 <= r && r <= 6 && (c === 0 || c === 6)) || (0 <= c && c <= 6 && (r === 0 || r === 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
            this.modules[row + r][col + c] = true;
          } else {
            this.modules[row + r][col + c] = false;
          }
        }
      }
    },
    getBestMaskPattern: function() { return 0; },
    setupTimingPattern: function() {
      for (var r = 8; r < this.moduleCount - 8; r++) {
        if (this.modules[r][6] !== null) continue;
        this.modules[r][6] = (r % 2 === 0);
      }
      for (var c = 8; c < this.moduleCount - 8; c++) {
        if (this.modules[6][c] !== null) continue;
        this.modules[6][c] = (c % 2 === 0);
      }
    },
    setupPositionAdjustPattern: function() {
      var pos = [6, 22, 26, 30, 34][this.typeNumber - 1] || [];
      if (typeof pos === 'number') pos = [6, pos];
      for (var i = 0; i < pos.length; i++) {
        for (var j = 0; j < pos.length; j++) {
          var row = pos[i], col = pos[j];
          if (this.modules[row][col] !== null) continue;
          for (var r = -2; r <= 2; r++) {
            for (var c = -2; c <= 2; c++) {
              if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                this.modules[row + r][col + c] = true;
              } else {
                this.modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    },
    setupTypeInfo: function(test, maskPattern) {
      var data = (this.errorCorrectLevel << 3) | maskPattern;
      var bits = QRCodeModel.getBCHTypeInfo(data);
      for (var i = 0; i < 15; i++) {
        var mod = (!test && ((bits >> i) & 1) === 1);
        if (i < 6) this.modules[i][8] = mod;
        else if (i < 8) this.modules[i + 1][8] = mod;
        else this.modules[this.moduleCount - 15 + i][8] = mod;

        if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod;
        else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod;
        else this.modules[8][15 - i - 1] = mod;
      }
      this.modules[this.moduleCount - 8][8] = !test;
    },
    setupTypeNumber: function(test) {},
    mapData: function(data, maskPattern) {
      var inc = -1, row = this.moduleCount - 1, bitIndex = 7, byteIndex = 0;
      for (var col = this.moduleCount - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (var c = 0; c < 2; c++) {
            if (this.modules[row][col - c] === null) {
              var dark = false;
              if (byteIndex < data.length) dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
              var mask = ((row + col - c) % 2 === 0);
              if (mask) dark = !dark;
              this.modules[row][col - c] = dark;
              bitIndex--;
              if (bitIndex === -1) { byteIndex++; bitIndex = 7; }
            }
          }
          row += inc;
          if (row < 0 || this.moduleCount <= row) { row -= inc; inc = -inc; break; }
        }
      }
    }
  };

  QRCodeModel.createData = function(typeNumber, errorCorrectLevel, dataList) {
    var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
    var buffer = new QRBitBuffer();
    for (var i = 0; i < dataList.length; i++) {
      var data = dataList[i];
      buffer.put(data.mode, 4);
      buffer.put(data.getLength(), 8);
      data.write(buffer);
    }
    var totalDataCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount;
    if (buffer.getLengthInBits() > totalDataCount * 8) throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + (totalDataCount * 8) + ")");
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4);
    while (buffer.getLengthInBits() % 8 !== 0) buffer.putBit(false);
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0xEC, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }
    return QRCodeModel.createBytes(buffer, rsBlocks);
  };

  QRCodeModel.createBytes = function(buffer, rsBlocks) {
    var offset = 0, maxDcCount = 0, maxEcCount = 0;
    var dcdata = new Array(rsBlocks.length), ecdata = new Array(rsBlocks.length);
    for (var r = 0; r < rsBlocks.length; r++) {
      var dcCount = rsBlocks[r].dataCount, ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (var i = 0; i < dcdata[r].length; i++) dcdata[r][i] = 0xFF & buffer.buffer[i + offset];
      offset += dcCount;
      var rsPoly = new QRPolynomial([1], 0);
      for (var i = 0; i < ecCount; i++) rsPoly = rsPoly.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
      var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      var modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (var i = 0; i < ecdata[r].length; i++) {
        var modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
      }
    }
    var totalCodeCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount;
    var data = new Array(totalCodeCount), index = 0;
    for (var i = 0; i < maxDcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) data[index++] = dcdata[r][i];
      }
    }
    for (var i = 0; i < maxEcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) data[index++] = ecdata[r][i];
      }
    }
    return data;
  };

  QRCodeModel.getBCHTypeInfo = function(data) {
    var d = data << 10;
    while (QRCodeModel.getBCHDigit(d) - QRCodeModel.getBCHDigit(1335) >= 0) {
      d ^= (1335 << (QRCodeModel.getBCHDigit(d) - QRCodeModel.getBCHDigit(1335)));
    }
    return ((data << 10) | d) ^ 21522;
  };

  QRCodeModel.getBCHDigit = function(data) {
    var digit = 0;
    while (data !== 0) { digit++; data >>>= 1; }
    return digit;
  };

  // High-Level Helper to render into HTML Element or Canvas
  function QRCode(element, options) {
    if (typeof options === 'string') options = { text: options };
    options = options || {};
    var lvl = (options.correctLevel !== undefined && options.correctLevel !== null) ? options.correctLevel : QRErrorCorrectLevel.M;
    this.options = {
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: lvl,
      ...options
    };
    this.options.correctLevel = lvl;
    if (typeof element === 'string') element = document.getElementById(element);
    this.element = element;
    if (this.options.text) this.makeCode(this.options.text);
  }

  QRCode.prototype.makeCode = function(text) {
    try {
      var lvl = (this.options.correctLevel !== undefined && this.options.correctLevel !== null) ? this.options.correctLevel : QRErrorCorrectLevel.M;
      var qr = new QRCodeModel(-1, lvl);
      qr.addData(text);
      qr.make();

      var count = qr.getModuleCount();
      var marginModules = 4; // ISO/IEC 18004 Quiet Zone standard
      var totalModules = count + marginModules * 2;
      var targetWidth = this.options.width || 220;
      var targetHeight = this.options.height || 220;
      var baseDim = Math.min(targetWidth, targetHeight);
      var moduleSize = Math.max(2, Math.floor(baseDim / totalModules));
      var actualCanvasDim = totalModules * moduleSize;

      var canvas = document.createElement('canvas');
      canvas.width = actualCanvasDim;
      canvas.height = actualCanvasDim;
      canvas.style.width = targetWidth + 'px';
      canvas.style.height = targetHeight + 'px';
      canvas.style.imageRendering = 'pixelated';

      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = this.options.colorLight || '#ffffff';
      ctx.fillRect(0, 0, actualCanvasDim, actualCanvasDim);

      ctx.fillStyle = this.options.colorDark || '#000000';
      for (var row = 0; row < count; row++) {
        for (var col = 0; col < count; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              (col + marginModules) * moduleSize,
              (row + marginModules) * moduleSize,
              moduleSize,
              moduleSize
            );
          }
        }
      }

      if (this.element) {
        this.element.innerHTML = '';
        this.element.appendChild(canvas);
      }
      return canvas;
    } catch(err) {
      console.error('QRCode makeCode error:', err);
      // Fallback: simple text/SVG error display or fallback image
      if (this.element) {
        var fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = this.options.width || 170;
        fallbackCanvas.height = this.options.height || 170;
        var fctx = fallbackCanvas.getContext('2d');
        fctx.fillStyle = '#ffffff';
        fctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
        fctx.fillStyle = '#0f172a';
        fctx.font = '12px sans-serif';
        fctx.textAlign = 'center';
        fctx.fillText('QR Code', fallbackCanvas.width / 2, fallbackCanvas.height / 2 - 10);
        fctx.font = '10px monospace';
        fctx.fillText(text.slice(0, 24), fallbackCanvas.width / 2, fallbackCanvas.height / 2 + 10);
        this.element.innerHTML = '';
        this.element.appendChild(fallbackCanvas);
      }
      return null;
    }
  };

  QRCode.CorrectLevel = QRErrorCorrectLevel;
  window.QRCode = QRCode;
})(window);
