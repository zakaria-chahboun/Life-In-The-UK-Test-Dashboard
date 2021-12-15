<script>
  import "bulma/css/bulma.css";
  import { slide } from "svelte/transition";
  import AddData from "./AddData.svelte";
  import { supabase } from "./supabase";

  let body = AddData; // by default;

  // Login

  let email;
  let password;
  let isLoading = false;
  async function login() {
    isLoading = true;
    const { error } = await supabase.auth.signIn({ email, password });
    isLoading = false;
    if (error) {
      alert(error.message);
    } else {
      location.reload();
    }
  }
</script>

<!-- nav bar -->
<nav class="navbar is-dark" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img
        src="/bambo meeting logo - zaki.png"
        alt="Logo"
        width="112"
        height="28"
      />
    </a>
  </div>
  <div class="navbar-menu">
    <div class="navbar-start" style="flex-grow: 1; justify-content: center;">
      <a href="#" class="navbar-item"
        >{supabase.auth.user() ? supabase.auth.user().email : ""}</a
      >
    </div>
  </div>
</nav>

<!-- Sidebar And Body -->
<section class="main-content columns is-fullheight" style="min-height:100%">
  <!-- Siebare -->
  <aside class="menu column is-2 has-background-dark">
    <p class="mb-6" />
    <p class="menu-label has-text-white-ter">Managment</p>
    <ul class="menu-list">
      {#if !supabase.auth.user()}
        <li>
          <button
            on:click={login}
            class="button is-primary is-fullwidth"
            class:is-loading={isLoading}
          >
            Login
          </button>
        </li>
        <li>
          <div class="field">
            <div class="control">
              <input
                bind:value={email}
                type="text"
                class="input"
                placeholder="email"
                autocomplete="email"
              />
            </div>
            <div class="control">
              <input
                bind:value={password}
                type="password"
                class="input"
                placeholder="password"
                autocomplete="current-password"
              />
            </div>
          </div>
        </li>
      {:else}
        <li>
          <button
            on:click={async () => {
              isLoading = true;
              await supabase.auth.signOut();
              isLoading = false;
              location.reload();
            }}
            class="button is-danger is-fullwidth"
            class:is-loading={isLoading}
          >
            Logout
          </button>
        </li>
      {/if}
      <li>
        <a
          href="##"
          class="has-text-white-ter"
          on:click={() => (body = AddData)}
        >
          <span class="icon"> <i class="fa fa-plus" /> </span>
          Adding Tests & Questions
        </a>
      </li>
    </ul>
  </aside>
  <!-- Body -->
  <div class="container column is-10">
    <div class="section">
      {#key body}
        <div transition:slide>
          <svelte:component this={body} />
        </div>
      {/key}
    </div>
  </div>
</section>
