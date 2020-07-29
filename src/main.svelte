<script>
  import "bulma/css/bulma.css";
  import AddData from "./AddData.svelte";
</script>

<!-- nav bar -->
<nav class="navbar is-dark mb-6" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img
        src="/bambo meeting logo - zaki.png"
        alt="Logo"
        width="112"
        height="28" />
    </a>
    <a class="navbar-item" href="#">Adding Data</a>
  </div>
</nav>

<AddData />
