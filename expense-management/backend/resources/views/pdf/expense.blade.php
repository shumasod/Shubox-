<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; font-size: 12px; color: #111; margin: 0; padding: 24px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .meta { color: #555; font-size: 11px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #4f46e5; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
  .right { text-align: right; }
  .total { font-weight: bold; font-size: 13px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 13px; font-weight: bold; border-bottom: 2px solid #4f46e5; margin-bottom: 8px; padding-bottom: 4px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; }
  .badge-approved { background: #d1fae5; color: #065f46; }
  .badge-rejected { background: #fee2e2; color: #991b1b; }
  .badge-pending { background: #fef3c7; color: #92400e; }
</style>
</head>
<body>
<h1>{{ $expense->title }}</h1>
<div class="meta">
  第号: {{ $expense->expense_number }} &nbsp;|
  申請者: {{ $expense->applicant?->name }} &nbsp;|
  申請日: {{ $expense->created_at?->format('Y/m/d') }} &nbsp;|
  ステータス:
  <span class="badge badge-{{ str_replace(['submitted','approved','rejected','draft','paid'], ['pending','approved','rejected','pending','approved'], $expense->status) }}">
    {{ $expense->status }}
  </span>
</div>

<div class="section">
  <div class="section-title">明細</div>
  <table>
    <thead><tr><th>販売店 / 内容</th><th>カテゴリ</th><th>日付</th><th class="right">金額</th></tr></thead>
    <tbody>
      @foreach ($expense->items as $item)
      <tr>
        <td>{{ $item->description }}</td>
        <td>{{ $item->category?->name ?? '-' }}</td>
        <td>{{ $item->incurred_at?->format('Y/m/d') }}</td>
        <td class="right">&yen;{{ number_format($item->amount) }}</td>
      </tr>
      @endforeach
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="right total">合計</td>
        <td class="right total">&yen;{{ number_format($expense->total_amount) }}</td>
      </tr>
    </tfoot>
  </table>
</div>

@if ($expense->approvalRecords->isNotEmpty())
<div class="section">
  <div class="section-title">承認履歴</div>
  <table>
    <thead><tr><th>承認者</th><th>アクション</th><th>日時</th><th>コメント</th></tr></thead>
    <tbody>
      @foreach ($expense->approvalRecords as $record)
      <tr>
        <td>{{ $record->approver?->name }}</td>
        <td>{{ $record->action }}</td>
        <td>{{ $record->created_at?->format('Y/m/d H:i') }}</td>
        <td>{{ $record->comment ?? '-' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>
@endif

<div class="meta" style="margin-top:40px; border-top:1px solid #e5e7eb; padding-top:8px;">
  出力日時: {{ now()->format('Y/m/d H:i:s') }}
</div>
</body>
</html>
