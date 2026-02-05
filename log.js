class Logger {
  static LogLevel = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
  };

  constructor(options = {}) {
    this.logLevel = options.logLevel || Logger.LogLevel.INFO;
    this.prefix = options.prefix || '';
    this.enableConsole = options.enableConsole !== false;
    this.customHandlers = [];
  }

  addHandler(handler) {
    this.customHandlers.push(handler);
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level}: ${this.prefix}${message}`;
  }

  log(level, message) {
    const formattedMessage = this.formatMessage(level, message);

    // Console出力
    if (this.enableConsole) {
      switch (level) {
        case Logger.LogLevel.INFO:
          console.log(formattedMessage);
          break;
        case Logger.LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case Logger.LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }

    // カスタムハンドラー実行
    this.customHandlers.forEach(handler => handler(level, formattedMessage));
  }

  info(message) {
    this.log(Logger.LogLevel.INFO, message);
  }

  warn(message) {
    this.log(Logger.LogLevel.WARN, message);
  }

  error(message) {
    this.log(Logger.LogLevel.ERROR, message);
  }
}

// 使用例
const logger = new Logger({
  prefix: '[App] ',
  enableConsole: true
});

// ファイル保存ハンドラー (Node.js環境の場合)
if (typeof require !== 'undefined') {
  const fs = require('fs');
  logger.addHandler((level, message) => {
    fs.appendFileSync('app.log', message + '\n');
  });
}

// 使用例
logger.info('アプリケーション開始');
logger.warn('メモリ使用量警告');
logger.error('エラーが発生しました');
