<script>
  import { supabase } from "./supabase";

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

<section class="hero has-background-light is-fullheight">
  <div class="hero-body">
    <div class="container">
      <p
        class="has-text-centered is-size-5 has-text-weight-semibold is-capitalized block"
      >
        lifeintheukcitizenshiptest.co.uk
      </p>
      <div class="columns is-centered">
        <div class="column is-5-tablet is-4-desktop is-3-widescreen">
          <div class="box">
            <figure class="image is-128x128 container">
              <img src="/favicon.svg" alt="icon logo" />
            </figure>
            <p
              class="has-text-centered is-size-5 has-text-weight-semibold is-uppercase"
            >
              dashboard
            </p>
            <div class="field">
              <label for="" class="label">Email</label>
              <div class="control has-icons-left">
                <input
                  bind:value={email}
                  type="email"
                  class="input"
                  required
                  autocomplete="on"
                />
                <span class="icon is-small is-left">
                  <i class="fa fa-envelope" />
                </span>
              </div>
            </div>
            <div class="field">
              <label for="" class="label">Password</label>
              <div class="control has-icons-left">
                <input
                  bind:value={password}
                  type="password"
                  class="input"
                  required
                />
                <span class="icon is-small is-left">
                  <i class="fa fa-lock" />
                </span>
              </div>
            </div>
            <div class="field">
              <button
                on:click={login}
                class="button is-info"
                class:is-loading={isLoading}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
