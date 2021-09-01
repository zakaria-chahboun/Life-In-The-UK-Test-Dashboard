<script>
  import {
    Field,
    Input,
    Tag,
    Taglist,
    Button,
    Notification,
    Message,
    Progress,
  } from "svelma";
  import { onMount } from "svelte";
  import { supabase } from "./supabase.js";

  // local variables
  let tag;
  let tags = [];
  let notification = {
    showUp: false,
    message: "",
    type: "is-warning",
  };

  // ui/ux
  let isLoading = false; // for push
  let isLoadingTags = false; // for load

  // Process tags, and  push it to firebase
  async function addTag() {
    // ux
    isLoading = true;
    // remove white spaces, tabs ..
    tag = tag.trim();
    // we don't want empty data
    if (tag === "") {
      isLoading = false;
      return;
    }
    // we don't want duplicated data
    else if (tags.includes(tag)) {
      isLoading = false;
      return;
    }
    // if there is many tags in input (sport,manga ..) add them all 👍
    else if (tag.split(" ").length > 1) {
      tag = tag
        .split(" ")
        .map((e) => e.trim())
        .filter((e) => !tags.includes(e)); // avoid duplication tags in this case too 👍
      tags = [...tags, ...tag];
    }
    // just one tag in input
    else {
      tags = [...tags, tag];
    }
    // -- finally push to firebase
    try {
      // to insert one or array of tags at same time!
      const data = Array.isArray(tag)
        ? tag.map((e) => ({ tag_id: e }))
        : { tag_id: tag };

      await supabase.from("tag").insert(data);
    } catch (error) {
      loadTags(); // load the old tags from db
      setnotification({ message: error });
    } finally {
      // ux
      tag = ""; // reset
      isLoading = false;
    }
  }
  // Detele tags from ui & firebase
  async function deleteTag(index) {
    const selected_tag = tags[index];
    isLoadingTags = true;
    tags.splice(index, 1);
    tags = tags;
    // -- finally push to supabase
    try {
      await supabase.from("tag").delete().eq("tag_id", selected_tag);
    } catch (error) {
      loadTags(); // load the old tags from db
      setnotification({ message: error });
    } finally {
      // ux
      isLoadingTags = false;
    }
  }

  // Show notifications
  function setnotification({ message, type = "is-warning", timeout = 4000 }) {
    notification.showUp = true; // show it
    notification.message = message;
    notification.type = type;

    setTimeout(() => {
      notification.showUp = false; // close it
      notification.message = ""; // clear
    }, timeout);
  }

  // Load tags from firebase
  async function loadTags() {
    isLoadingTags = true; // ux 😉
    try {
      const { data, error } = await supabase.from("tag").select("tag_id");
      isLoadingTags = false; // ux 😉
      // check if 'tags' array exist in db
      tags = data.map((e) => e.tag_id);
    } catch (error) {
      setnotification({
        message: error,
        type: "is-danger",
      });
      isLoadingTags = false; // ux 😉
    }
  }

  // First
  onMount(async () => {
    loadTags();
  });
</script>

<!-- Add tag field -->
<label class="label">Push tags in database!</label>
<Field>
  <Input
    expanded
    placeholder="Insert 1 tag name like (sport) or multi-tags like (sport history animal ..) 🧒"
    bind:value={tag}
    on:keypress={(event) => {
      if (event && event.key === "Enter") addTag();
    }}
    icon="fire"
  />
  <p class="control">
    <Button type="is-dark" on:click={addTag} loading={isLoading}>Push!</Button>
  </p>
</Field>

<!-- Hiding area; Notification for success of error -->
<Notification
  icon={true}
  type={notification.type}
  bind:active={notification.showUp}
>
  {notification.message}
</Notification>

<!-- Display tags -->
<Taglist>
  {#each tags as item, i}
    <Tag closable type="is-dark" size="is-large" on:close={(e) => deleteTag(i)}>
      {item}
    </Tag>
  {/each}
</Taglist>

<!-- Case: No tags in databse -->
{#if isLoadingTags}
  <Progress />
{:else if tags.length == 0}
  <Message title="Sorry">No Data In Firebase 😭</Message>
{/if}
