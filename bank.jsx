// BankTransferProcessor.js
/**
 * @typedef {Object} Task
 * @property {string} name - タスクの名前
 * @property {Function} execute - タスク実行関数
 * @property {string} status - タスクのステータス
 * @property {number} priority - タスクの優先順位（低いほど先に実行）
 * @property {string[]} dependencies - 依存するタスク名の配列
 * @property {Object} config - タスク固有の設定
 */

/**
 * @typedef {Object} ProcessorConfig
 * @property {boolean} stopOnError - エラー発生時に処理を停止するか
 * @property {boolean} enableParallel - 並列処理を有効にするか
 * @property {number} maxRetries - 最大リトライ回数
 * @property {number} retryDelay - リトライ間の待機時間（ミリ秒）
 * @property {Function} logger - ロギング関数
 * @property {Object} hooks - 各種イベントフック
 */

/**
 * バンク転送処理を管理する拡張性の高いプロセッサクラス
 */
class BankTransferProcessor {
  /**
   * @param {ProcessorConfig} config - プロセッサの設定
   */
  constructor(config = {}) {
    this.tasks = [];
    this.status = {
      isProcessing: false,
      lastProcessedAt: null,
      errors: [],
      processingTime: 0
    };
    
    // デフォルト設定とマージ
    this.config = {
      stopOnError: true,
      enableParallel: false,
      maxRetries: 3,
      retryDelay: 1000,
      logger: console.log,
      hooks: {},
      ...config
    };
    
    // イベントリスナー
    this.eventListeners = {
      taskStart: [],
      taskComplete: [],
      taskFail: [],
      processStart: [],
      processComplete: [],
      processFail: []
    };
    
    // プラグイン
    this.plugins = [];
  }

  /**
   * イベントリスナーを登録
   * @param {string} eventName - イベント名
   * @param {Function} listener - リスナー関数
   * @returns {BankTransferProcessor} - チェーン呼び出し用
   */
  on(eventName, listener) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].push(listener);
    }
    return this;
  }

  /**
   * イベントを発火
   * @param {string} eventName - イベント名
   * @param {Object} data - イベントデータ
   * @private
   */
  _emit(eventName, data) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach(listener => listener(data));
    }
    
    // フックがある場合は実行
    if (this.config.hooks[eventName]) {
      this.config.hooks[eventName](data);
    }
  }

  /**
   * プラグインを追加
   * @param {Object} plugin - プラグインオブジェクト
   * @returns {BankTransferProcessor} - チェーン呼び出し用
   */
  use(plugin) {
    if (typeof plugin.install === 'function') {
      plugin.install(this);
    }
    this.plugins.push(plugin);
    return this;
  }

  /**
   * 処理を登録
   * @param {string} taskName - タスク名
   * @param {Function} taskFunction - タスク実行関数
   * @param {Object} options - タスクオプション
   * @returns {BankTransferProcessor} - チェーン呼び出し用
   */
  addTask(taskName, taskFunction, options = {}) {
    // タスクの重複チェック
    const existingTask = this.tasks.find(task => task.name === taskName);
    if (existingTask) {
      throw new Error(`タスク名'${taskName}'は既に登録されています`);
    }
    
    this.tasks.push({
      name: taskName,
      execute: taskFunction,
      status: 'pending',
      retryCount: 0,
      startTime: null,
      endTime: null,
      error: null,
      result: null,
      priority: options.priority || 10,
      dependencies: options.dependencies || [],
      config: options.config || {}
    });
    
    // 優先順位でソート
    this.tasks.sort((a, b) => a.priority - b.priority);
    
    return this;
  }
  
  /**
   * タスクを削除
   * @param {string} taskName - 削除するタスク名
   * @returns {boolean} - 削除成功の場合true
   */
  removeTask(taskName) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.name !== taskName);
    return this.tasks.length !== initialLength;
  }

  /**
   * タスクを実行
   * @param {Object} task - 実行するタスク
   * @param {Object} transferData - 転送データ
   * @returns {Promise<any>} - タスクの実行結果
   * @private
   */
  async _executeTask(task, transferData) {
    task.status = 'processing';
    task.startTime = Date.now();
    
    this._emit('taskStart', { task, transferData });
    this.config.logger(`タスク実行中: ${task.name}`);
    
    try {
      const result = await task.execute(transferData, {
        logger: this.config.logger,
        config: task.config
      });
      
      task.status = 'completed';
      task.endTime = Date.now();
      task.result = result;
      
      this._emit('taskComplete', { task, result, transferData });
      this.config.logger(`タスク完了: ${task.name}`);
      
      return result;
    } catch (error) {
      task.error = error;
      
      // リトライロジック
      if (task.retryCount < this.config.maxRetries) {
        task.status = 'retrying';
        task.retryCount++;
        
        this.config.logger(`タスクリトライ中: ${task.name} (${task.retryCount}/${this.config.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this._executeTask(task, transferData);
      }
      
      task.status = 'failed';
      task.endTime = Date.now();
      
      this.status.errors.push({
        taskName: task.name,
        error: error.message,
        timestamp: new Date()
      });
      
      this._emit('taskFail', { task, error, transferData });
      this.config.logger(`タスク失敗: ${task.name} - ${error.message}`);
      
      if (this.config.stopOnError) {
        throw new Error(`${task.name}の実行中にエラーが発生しました: ${error.message}`);
      }
      
      return null;
    }
  }

  /**
   * 全てのタスクを依存関係に基づいてグループ化
   * @returns {Task[][]} - 実行グループごとのタスク配列
   * @private
   */
  _organizeTaskGroups() {
    const taskMap = new Map();
    this.tasks.forEach(task => taskMap.set(task.name, task));
    
    const groups = [];
    const visited = new Set();
    const visiting = new Set();
    
    // 循環依存関係の検出とグループ化を行う深さ優先探索
    const visit = (taskName, group = []) => {
      if (visited.has(taskName)) return;
      if (visiting.has(taskName)) {
        throw new Error(`循環依存関係が検出されました: ${taskName}`);
      }
      
      visiting.add(taskName);
      const task = taskMap.get(taskName);
      
      for (const depName of task.dependencies) {
        if (!taskMap.has(depName)) {
          throw new Error(`依存タスク'${depName}'が見つかりません`);
        }
        visit(depName, group);
      }
      
      visiting.delete(taskName);
      visited.add(taskName);
      
      if (!group.includes(task)) {
        group.push(task);
      }
      
      return group;
    };
    
    // 全タスクをグループ化
    for (const task of this.tasks) {
      if (!visited.has(task.name)) {
        const group = visit(task.name, []);
        if (group && group.length > 0) {
          groups.push(group);
        }
      }
    }
    
    return groups;
  }
  
  /**
   * 並列処理モードでタスクグループを実行
   * @param {Task[]} taskGroup - 実行するタスクグループ
   * @param {Object} transferData - 転送データ
   * @returns {Promise<any[]>} - 実行結果の配列
   * @private
   */
  async _executeParallel(taskGroup, transferData) {
    return Promise.all(taskGroup.map(task => this._executeTask(task, transferData)));
  }
  
  /**
   * 直列処理モードでタスクグループを実行
   * @param {Task[]} taskGroup - 実行するタスクグループ
   * @param {Object} transferData - 転送データ
   * @returns {Promise<any[]>} - 実行結果の配列
   * @private
   */
  async _executeSequential(taskGroup, transferData) {
    const results = [];
    for (const task of taskGroup) {
      results.push(await this._executeTask(task, transferData));
    }
    return results;
  }

  /**
   * 全ての処理を実行
   * @param {Object} transferData - 転送データ
   * @param {Object} options - 実行オプション
   * @returns {Promise<Object>} - 実行結果
   */
  async processAll(transferData, options = {}) {
    if (this.status.isProcessing) {
      throw new Error('別の処理が実行中です');
    }
    
    const startTime = Date.now();
    this.status.isProcessing = true;
    this.status.errors = [];
    
    // オプションのマージ
    const runOptions = {
      ...this.config,
      ...options
    };
    
    // 開始イベント発火
    this._emit('processStart', { transferData, options: runOptions });
    
    try {
      // 依存関係に基づいてタスクをグループ化
      const taskGroups = this._organizeTaskGroups();
      
      // 各グループを順番に処理
      for (const group of taskGroups) {
        if (runOptions.enableParallel) {
          // 並列処理
          await this._executeParallel(group, transferData);
        } else {
          // 直列処理
          await this._executeSequential(group, transferData);
        }
      }
      
      const endTime = Date.now();
      this.status.lastProcessedAt = new Date();
      this.status.processingTime = endTime - startTime;
      
      const result = {
        success: true,
        message: '全ての処理が完了しました',
        completedAt: this.status.lastProcessedAt,
        processingTime: this.status.processingTime,
        tasks: this.tasks.map(task => ({
          name: task.name,
          status: task.status,
          duration: task.endTime ? task.endTime - task.startTime : null
        }))
      };
      
      // 完了イベント発火
      this._emit('processComplete', result);
      
      return result;
    } catch (error) {
      const endTime = Date.now();
      this.status.processingTime = endTime - startTime;
      
      const result = {
        success: false,
        message: error.message,
        errors: this.status.errors,
        processingTime: this.status.processingTime,
        tasks: this.tasks.map(task => ({
          name: task.name,
          status: task.status,
          error: task.error ? task.error.message : null
        }))
      };
      
      // 失敗イベント発火
      this._emit('processFail', { error, result });
      
      throw error;
    } finally {
      this.status.isProcessing = false;
    }
  }

  /**
   * 処理状態の取得
   * @param {boolean} detailed - 詳細情報を含めるか
   * @returns {Object} - 現在のステータス
   */
  getStatus(detailed = false) {
    const baseStatus = {
      ...this.status,
      tasks: this.tasks.map(task => ({
        name: task.name,
        status: task.status,
        retryCount: task.retryCount
      }))
    };
    
    if (detailed) {
      baseStatus.tasks = this.tasks.map(task => ({
        name: task.name,
        status: task.status,
        priority: task.priority,
        dependencies: task.dependencies,
        retryCount: task.retryCount,
        startTime: task.startTime,
        endTime: task.endTime,
        duration: task.endTime && task.startTime ? task.endTime - task.startTime : null,
        error: task.error ? task.error.message : null,
        result: task.result
      }));
    }
    
    return baseStatus;
  }
  
  /**
   * 全てのタスクをリセット
   * @returns {BankTransferProcessor} - チェーン呼び出し用
   */
  reset() {
    this.tasks.forEach(task => {
      task.status = 'pending';
      task.retryCount = 0;
      task.startTime = null;
      task.endTime = null;
      task.error = null;
      task.result = null;
    });
    
    this.status.errors = [];
    this.status.lastProcessedAt = null;
    this.status.processingTime = 0;
    
    return this;
  }
}

// プラグインの例: ロギングプラグイン
const LoggingPlugin = {
  install(processor) {
    const originalLogger = processor.config.logger;
    
    // ロガーを拡張
    processor.config.logger = (message) => {
      const timestamp = new Date().toISOString();
      originalLogger(`[${timestamp}] ${message}`);
    };
    
    // イベントリスナーを追加
    processor.on('taskStart', ({ task }) => {
      processor.config.logger(`LoggingPlugin: タスク開始 - ${task.name}`);
    });
    
    processor.on('taskComplete', ({ task, result }) => {
      processor.config.logger(`LoggingPlugin: タスク完了 - ${task.name}, 結果: ${JSON.stringify(result)}`);
    });
  }
};

// メトリクスプラグインの例
const MetricsPlugin = {
  install(processor) {
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      totalTime: 0,
      taskTimes: {}
    };
    
    processor.on('processStart', () => {
      this.metrics.totalTasks = processor.tasks.length;
      this.metrics.completedTasks = 0;
      this.metrics.failedTasks = 0;
      this.metrics.taskTimes = {};
    });
    
    processor.on('taskComplete', ({ task }) => {
      this.metrics.completedTasks++;
      this.metrics.taskTimes[task.name] = task.endTime - task.startTime;
    });
    
    processor.on('taskFail', ({ task }) => {
      this.metrics.failedTasks++;
    });
    
    processor.on('processComplete', ({ processingTime }) => {
      this.metrics.totalTime = processingTime;
      console.log('処理メトリクス:', this.metrics);
    });
    
    // メトリクス取得メソッドを追加
    processor.getMetrics = () => this.metrics;
  }
};

// React コンポーネント
import React, { useState, useEffect } from 'react';

const BankTransferButton = ({ processor, transferData, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // タスク進捗の監視
  useEffect(() => {
    const handleTaskComplete = ({ task }) => {
      const totalTasks = processor.tasks.length;
      const completedTasks = processor.tasks.filter(t => t.status === 'completed').length;
      setProgress(Math.round((completedTasks / totalTasks) * 100));
    };
    
    processor.on('taskComplete', handleTaskComplete);
    
    return () => {
      // イベントリスナーのクリーンアップ
      processor.eventListeners.taskComplete = 
        processor.eventListeners.taskComplete.filter(fn => fn !== handleTaskComplete);
    };
  }, [processor]);
  
  const handleClick = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const result = await processor.processAll(transferData, {
        // オプションを上書き可能
        stopOnError: true,
        enableParallel: false
      });
      
      setStatus(result);
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      setStatus({
        success: false,
        message: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    processor.reset();
    setStatus(null);
    setProgress(0);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <button 
        onClick={handleClick}
        disabled={isProcessing}
        className="p-4 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {isProcessing ? '処理中...' : '振込確認処理開始'}
      </button>
      
      {isProcessing && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
          <div className="text-xs text-center mt-1">{progress}% 完了</div>
        </div>
      )}
      
      {status && (
        <div className={`p-4 rounded-lg ${status.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="font-bold">{status.success ? '成功' : 'エラー'}</p>
          <p>{status.message}</p>
          {status.processingTime && (
            <p className="text-sm text-gray-600">処理時間: {status.processingTime}ms</p>
          )}
          
          {status.tasks && (
            <div className="mt-2">
              <p className="font-bold text-sm">タスク状態:</p>
              <ul className="text-sm">
                {status.tasks.map(task => (
                  <li key={task.name} className="flex justify-between">
                    <span>{task.name}</span>
                    <span className={
                      task.status === 'completed' ? 'text-green-600' : 
                      task.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                    }>
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button 
            onClick={handleReset}
            className="mt-3 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            リセット
          </button>
        </div>
      )}
    </div>
  );
};

// 使用例
const createBankTransferProcessor = () => {
  // プロセッサのインスタンス化
  const processor = new BankTransferProcessor({
    stopOnError: true,
    enableParallel: false,
    maxRetries: 2,
    retryDelay: 1000,
    hooks: {
      processComplete: (result) => {
        // 処理完了時のグローバルフック
        console.log('すべての処理が完了しました', result);
      }
    }
  });
  
  // プラグインの適用
  processor.use(LoggingPlugin);
  processor.use(MetricsPlugin);
  
  // タスクの追加
  processor.addTask('入金確認', async (data, { logger }) => {
    logger('入金確認を実行中...');
    await validatePayment(data);
    return { verified: true, timestamp: new Date() };
  }, { 
    priority: 1, // 最優先で実行
    dependencies: [] // 依存なし
  });
  
  processor.addTask('在庫確認・更新', async (data, { logger }) => {
    logger('在庫確認・更新を実行中...');
    await updateInventory(data);
    return { updated: true, items: ['item1', 'item2'] };
  }, { 
    priority: 2,
    dependencies: ['入金確認'] // 入金確認後に実行
  });
  
  processor.addTask('配送手配', async (data, { logger }) => {
    logger('配送手配を実行中...');
    await arrangeDelivery(data);
    return { scheduled: true, estimatedDate: '2023-04-01' };
  }, { 
    priority: 3,
    dependencies: ['在庫確認・更新'] // 在庫確認・更新後に実行
  });
  
  processor.addTask('顧客通知', async (data, { logger }) => {
    logger('顧客通知を実行中...');
    await notifyCustomer(data);
    return { notified: true, method: 'email' };
  }, { 
    priority: 4,
    dependencies: ['配送手配'] // 配送手配後に実行
  });
  
  return processor;
};

// 関数のスタブ（実際の実装はここでは省略）
const validatePayment = async (data) => {
  // 支払い検証ロジック
  await new Promise(resolve => setTimeout(resolve, 500));
};

const updateInventory = async (data) => {
  // 在庫更新ロジック
  await new Promise(resolve => setTimeout(resolve, 700));
};

const arrangeDelivery = async (data) => {
  // 配送手配ロジック
  await new Promise(resolve => setTimeout(resolve, 600));
};

const notifyCustomer = async (data) => {
  // 顧客通知ロジック
  await new Promise(resolve => setTimeout(resolve, 400));
};

export { 
  BankTransferProcessor,
  BankTransferButton,
  createBankTransferProcessor,
  LoggingPlugin,
  MetricsPlugin
};
