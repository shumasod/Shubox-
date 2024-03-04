<!-- resources/views/welcome.blade.php -->

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <title>Account Management</title>
</head>
<body class="bg-gray-200">
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Account Management</h1>

        <button class="bg-blue-500 text-white py-2 px-4 rounded" onclick="createAccount()">Create Account</button>
        <button class="bg-red-500 text-white py-2 px-4 rounded" onclick="deleteAccount()">Delete Account</button>

        <table class="mt-4">
            <!-- ここにアカウントリストを表示するHTMLを追加 -->
        </table>
    </div>

    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
