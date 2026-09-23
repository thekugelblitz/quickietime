<script lang="ts">
  import { api } from '@/lib/client';

  let email = $state('');
  let code = $state('');
  let sent = $state(false);
  let busy = $state(false);
  let error = $state('');

  function getReturnTo(): string {
    if (typeof window === 'undefined') return '/?resume=1';
    return new URLSearchParams(window.location.search).get('return_to') || '/?resume=1';
  }

  function handleGoogleSignIn() {
    window.location.assign(`/api/auth/google?return_to=${encodeURIComponent(getReturnTo())}`);
  }

  async function submit() {
    busy = true;
    error = '';
    try {
      if (sent) {
        const result = await api<{ redirect: string }>('auth/verify', {
          email,
          code,
          returnTo: getReturnTo(),
        });
        window.location.assign(result.redirect);
      } else {
        await api('auth/request', { email });
        sent = true;
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<div class="auth-form-wrap">
  {#if !sent}
    <button
      type="button"
      onclick={handleGoogleSignIn}
      class="google-btn"
      id="google-signin-btn"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
    <div class="auth-divider">or continue with email</div>
  {/if}

  <form
    class="auth-form"
    onsubmit={(e) => {
      e.preventDefault();
      submit();
    }}
  >
    <label>
      Email address
      <input
        type="email"
        autocomplete="email"
        bind:value={email}
        required
        disabled={sent || busy}
      />
    </label>

    {#if sent}
      <p>A six-digit code has been sent to your email. It expires in 10 minutes.</p>
      <label>
        Verification code
        <input
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern="[0-9]{6}"
          maxlength="6"
          bind:value={code}
          required
          autofocus
        />
      </label>
    {/if}

    {#if error}
      <p role="alert" class="error">{error}</p>
    {/if}

    <button class="primary-button w-full justify-center" type="submit" disabled={busy}>
      {busy ? 'One moment…' : sent ? 'Verify & sign in' : 'Email me a code'}
    </button>

    {#if sent}
      <button
        type="button"
        onclick={() => {
          sent = false;
          code = '';
          error = '';
        }}
      >
        Change email or request another code
      </button>
    {/if}

    <p class="setting-hint">
      New here? Verification creates your free account. By continuing, you agree to our{' '}
      <a href="/terms">Terms</a> and acknowledge our <a href="/privacy">Privacy policy</a>.
    </p>
  </form>
</div>
