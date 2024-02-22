<!-- resources/views/users.blade.php -->

@extends('layouts.app')

@section('content')
    <div class="container mx-auto my-8">
        <button class="bg-blue-500 text-white py-2 px-4 rounded" onclick="createAccount()">アカウント作成</button>
        <button class="bg-red-500 text-white py-2 px-4 rounded" onclick="deleteAccount()">アカウント削除</button>
    </div>
@endsection

@section('scripts')
    <script>
        function createAccount() {
            // アカウント作成のためのJavaScriptロジックを実装
        }

        function deleteAccount() {
            // アカウント削除のためのJavaScriptロジックを実装
        }
    </script>
@endsection
