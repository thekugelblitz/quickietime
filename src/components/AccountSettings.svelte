<script lang="ts">
  import { api } from '@/lib/client';

  let confirmation = $state('');
  let error = $state('');
  let busy = $state(false);

  async function handleLogout() {
    try {
      await api('auth/logout', {}, 'POST');
      window.location.assign('/');
    } catch {
      error = 'Could not sign out. Try again.';
    }
  }

  async function handleDelete() {
    busy = true;
    error = '';
    try {
      await api('account', { confirm: confirmation }, 'DELETE');
      window.location.assign('/');
    } catch (e) {
      error = (e as Error).message;
      busy = false;
    }
  }
</script>

<h2>Export your work</h2>
<p>Download your account details, complete history, favorites and projects as JSON.</p>
<a class="primary-button inline-flex items-center" href="/api/export?format=json" download>
  Download account export
</a>

<h2>Sign out</h2>
<button type="button" class="tool-use" onclick={handleLogout}>
  Sign out of this browser
</button>

<h2>Delete your account</h2>
<p>
  This permanently deletes your saved generations, projects, favorites and active sessions. Export your work first.
  Server backups may retain a copy until their retention period ends.
</p>
<form
  class="auth-form"
  onsubmit={(e) => {
    e.preventDefault();
    handleDelete();
  }}
>
  <label>
    Type DELETE to confirm
    <input bind:value={confirmation} required pattern="DELETE" />
  </label>
  <button type="submit" disabled={busy || confirmation !== 'DELETE'} class="tool-use">
    {busy ? 'Deleting…' : 'Permanently delete account'}
  </button>
</form>

{#if error}
  <p role="alert" class="error">{error}</p>
{/if}
