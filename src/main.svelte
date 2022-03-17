<script>
  import "bulma/css/bulma.css";
  import { supabase } from "./supabase";
  import { slide } from "svelte/transition";
  import AddData from "./AddData.svelte";
  import Blog from "./Blog.svelte";
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
      <ul class="menu-list">
        <!-- tests and questions -->
        <li>
          <a
            href="##"
            class="has-text-white-ter has-text-weight-semibold is-capitalized"
            on:click={() => (body = AddData)}
          >
            <span class="icon"> <i class="fa fa-plus" /> </span>
            tests and questions
          </a>
        </li>
        <!-- blog -->
        <li>
          <a
            href="##"
            class="has-text-white-ter has-text-weight-semibold is-capitalized"
            on:click={() => (body = Blog)}
          >
            <span class="icon"> <i class="fa fa-align-center" /> </span>
            blog post
          </a>
        </li>
      </ul>
    </aside>
    <!-- Body -->
    <div class="column is-10">
      <div
        class="section"
        class:notification={body == Blog}
        class:is-info={body == Blog}
        class:is-light={body == Blog}
      >
        {#key body}
          <div transition:slide>
            <svelte:component this={body} />
          </div>
        {/key}
      </div>
    </div>
  </section>
{/if}
