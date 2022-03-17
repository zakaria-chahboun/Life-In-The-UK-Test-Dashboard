<script>
  import "bulma/css/bulma.css";
  import { supabase } from "./supabase";
  import { slide } from "svelte/transition";
  import AddData from "./AddData.svelte";
  import Login from "./Login.svelte";

  let body = AddData; // by default;

  // logout
  let isLoading = false;
</script>

{#if !supabase.auth.user()}
  <Login />
{:else}
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
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <button
            on:click={async () => {
              isLoading = true;
              await supabase.auth.signOut();
              isLoading = false;
              location.reload();
            }}
            class="button is-light is-small is-danger"
            class:is-loading={isLoading}
          >
            Log out
          </button>
        </div>
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
{/if}
