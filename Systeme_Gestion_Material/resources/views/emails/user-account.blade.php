<!-- resources/views/emails/user-account.blade.php -->

@component('mail::message')
# Account Created Successfully

Hello {{ $user->name }},

An account has been created for you.

Here are your login details:
- **Email:** {{ $user->email }}
- **Password:** {{ $password }}

@component('mail::button', ['url' => url('/login')])
Login to Your Account
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent