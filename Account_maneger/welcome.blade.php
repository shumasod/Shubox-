<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Account management system for managing user accounts">
    <title>Account Management System</title>
    <link href="{{ mix('css/app.css') }}" rel="stylesheet">
</head>
<body class="bg-gray-100 font-sans">
    <div class="container mx-auto p-6">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Account Management System</h1>
        </header>
        
        <main>
            <div class="mb-6 flex space-x-4">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300" onclick="createAccount()">
                    Create Account
                </button>
                <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300" onclick="deleteAccount()">
                    Delete Account
                </button>
            </div>

            <div class="bg-white shadow-md rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead>
                        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">ID</th>
                            <th class="py-3 px-6 text-left">Name</th>
                            <th class="py-3 px-6 text-left">Email</th>
                            <th class="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 text-sm font-light" id="accountList">
                        <!-- アカウントリストがJavaScriptによって動的に挿入されます -->
                    </tbody>
                </table>
            </div>
        </main>
    </div>

    <script src="{{ mix('js/app.js') }}"></script>
    <script>
        function createAccount() {
            // アカウント作成のロジックをここに実装
            console.log('Create account function called');
        }

        function deleteAccount() {
            // アカウント削除のロジックをここに実装
            console.log('Delete account function called');
        }

        // アカウントリストを取得して表示する関数
        function fetchAndDisplayAccounts() {
            // ここでAPIからアカウントリストを取得し、テーブルに表示するロジックを実装
            console.log('Fetching and displaying accounts');
        }

        // ページ読み込み時にアカウントリストを表示
        document.addEventListener('DOMContentLoaded', fetchAndDisplayAccounts);
    </script>
</body>
</html>
