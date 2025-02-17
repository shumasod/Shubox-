class BankTransferProcessor {
  constructor() {
    this.tasks = [];
    this.status = {
      isProcessing: false,
      lastProcessedAt: null,
      errors: []
    };
  }

  // 処理を登録
  addTask(taskName, taskFunction) {
    this.tasks.push({
      name: taskName,
      execute: taskFunction,
      status: 'pending'
    });
  }

  // 全ての処理を実行
  async processAll(transferData) {
    if (this.status.isProcessing) {
      throw new Error('別の処理が実行中です');
    }

    this.status.isProcessing = true;
    this.status.errors = [];

    try {
      for (const task of this.tasks) {
        console.log(`タスク実行中: ${task.name}`);
        task.status = 'processing';
        
        try {
          await task.execute(transferData);
          task.status = 'completed';
        } catch (error) {
          task.status = 'failed';
          this.status.errors.push({
            taskName: task.name,
            error: error.message
          });
          throw new Error(`${task.name}の実行中にエラーが発生しました: ${error.message}`);
        }
      }

      this.status.lastProcessedAt = new Date();
      return {
        success: true,
        message: '全ての処理が完了しました',
        completedAt: this.status.lastProcessedAt
      };

    } finally {
      this.status.isProcessing = false;
    }
  }

  // 処理状態の取得
  getStatus() {
    return {
      ...this.status,
      tasks: this.tasks.map(task => ({
        name: task.name,
        status: task.status
      }))
    };
  }
}

// 使用例
const processor = new BankTransferProcessor();

// 必要な処理を登録
processor.addTask('入金確認', async (data) => {
  // 入金確認のロジック
  await validatePayment(data);
});

processor.addTask('在庫確認・更新', async (data) => {
  // 在庫確認と更新のロジック
  await updateInventory(data);
});

processor.addTask('配送手配', async (data) => {
  // 配送手配のロジック
  await arrangeDelivery(data);
});

processor.addTask('顧客通知', async (data) => {
  // 顧客への通知処理
  await notifyCustomer(data);
});

// 実行用のボタンコンポーネント
const BankTransferButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null);

  const handleClick = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const result = await processor.processAll({
        transferId: 'xxxxx',
        amount: 10000,
        customerId: 'customer123'
      });
      setStatus(result);
    } catch (error) {
      setStatus({
        success: false,
        message: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isProcessing}
      className="p-4 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
    >
      {isProcessing ? '処理中...' : '振込確認処理開始'}
    </button>
  );
};

export { BankTransferProcessor, BankTransferButton };