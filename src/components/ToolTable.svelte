<script lang="ts">
  import { toolCatalog, type Tool } from '@/lib/config';

  let { selected = 'tagline', onselect } = $props<{
    selected?: Tool;
    onselect?: (id: Tool) => void;
  }>();
</script>

<section class="tool-directory" aria-label="Writing tools">
  <div class="directory-heading">
    <h2>Pick your Quickie.</h2>
    <p>Every tool. One credit. No big production.</p>
  </div>
  <table>
    <thead>
      <tr>
        <th scope="col">Tool</th>
        <th scope="col">What it does</th>
        <th scope="col">Get started</th>
      </tr>
    </thead>
    <tbody>
      {#each toolCatalog as t (t.id)}
        <tr data-selected={selected === t.id}>
          <td>
            <button type="button" aria-pressed={selected === t.id} onclick={() => onselect?.(t.id)}>
              {t.name}
            </button>
          </td>
          <td>
            {t.description}
            <a class="tool-guide" href={`/tools/${t.id}`}>Tips & examples</a>
          </td>
          <td>
            <button type="button" class="tool-use" onclick={() => onselect?.(t.id)}>
              {selected === t.id ? 'Selected' : 'Use tool'}
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>
