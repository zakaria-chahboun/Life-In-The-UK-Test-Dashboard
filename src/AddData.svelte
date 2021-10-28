<script>
  import {
    Field,
    Input,
    Switch,
    Tag,
    Taglist,
    Button,
    Icon,
    Select,
    Notification,
    Modal,
  } from "svelma";
  import { supabase } from "./supabase.js";

  // -- Question table --
  let question = {
    question_title: "",
    question_hint: "",
    question_correction: "",
    question_point: 1,
  };

  // -- Test  --
  let test = {
    test_title: "",
    test_description: "",
    status_id: "public",
    score_to_pass: 35,
    difficulty_id: "easy",
    category_id: "",
  };

  // Answers
  let answers = [];

  // tags
  let tags = [];

  // -- Local Variables --
  let tmp_test_id = ""; // for binding
  let tmp_test_category = {
    category_id: "",
    category_name: "",
  }; // for binding
  let tmp_status = false; // for binding

  let tmp_answer = {
    answer_title: "",
    is_correct: false,
    question,
  };

  let isLoadingTest = false; // ui/ux
  let isLoadingCategory = false; // ui/ux
  let isLoadingQuestion = false; // ui/ux
  let isLoadingTestParent = false; // ui/ux
  let isLoadingGenerateID = false; // ui/ux
  let isLoadingTags = false; // ui/ux
  let isModalActive = false; // ui/ux
  let notificationTest = {
    showUp: false,
    message: "",
    type: "is-warning",
  };
  let notificationQuestion = {
    showUp: false,
    message: "",
    type: "is-warning",
  };

  // To load ids from db
  let promiseLoadTestIDs = loadTestIDs(); // for {await} svelte
  let tagsFromDB = [];

  // ____________ Client Data handling _____________________

  function deleteTag(index) {
    tags.splice(index, 1);
    tags = tags;
  }
  function addAnswer() {
    if (tmp_answer.answer_title == "") return;
    answers.push({
      answer_title: tmp_answer.answer_title,
      is_correct: tmp_answer.is_correct,
    });
    answers = answers;
    // clear data
    tmp_answer.answer_title = "";
    tmp_answer.is_correct = false;
  }
  function deleteAnswer(index) {
    answers.splice(index, 1);
    answers = answers;
  }
  // __ notifictions of questions : for sending success or erros messages
  function setNotificationQuestion({
    message,
    type = "is-warning",
    timeout = 4000,
  }) {
    notificationQuestion.showUp = true; // show it
    notificationQuestion.message = message;
    notificationQuestion.type = type;

    setTimeout(() => {
      notificationQuestion.showUp = false; // close it
      notificationQuestion.message = ""; // clear
    }, timeout);
  }
  // __ notifictions of test : for sending success or erros messages
  function setNotificationTest({
    message,
    type = "is-warning",
    timeout = 4000,
  }) {
    notificationTest.showUp = true; // show it
    notificationTest.message = message;
    notificationTest.type = type;

    setTimeout(() => {
      notificationTest.showUp = false; // close it
      notificationTest.message = ""; // clear
    }, timeout);
  }
  function resetFields({ type }) {
    if (type == "tests") {
      test.test_title = "";
      test.test_description = "";
      test.status_id = "public";
      test.score_to_pass = 35;
      test.difficulty_id = "easy";
      test.category_id = "";

      tmp_status = false;
    } else if (type == "questions") {
      question.question_title = "";
      question.question_hint = "";
      question.question_correction = "";
      question.question_point = 1;

      answers = [];
      tags = [];

      tmp_test_id = "";
      tmp_answer.answer_title = "";
      tmp_answer.is_correct = false;
      tmp_answer.question = "";
    }
  }

  // ____________ Supabase Data Handling ____________
  // for generate a unique test name 1,2,3 etc..
  async function generateCorrectTestTitle(category_id, category_name) {
    isLoadingGenerateID = true; // ux
    try {
      // get test count from db
      let { data, error } = await supabase
        .from("test")
        .select("test_title")
        .eq("category_id", category_id)
        .order("order_test_title", { ascending: false });

      if (error) throw error.message;

      // generate the Title template: example "Life in the UK Chapter" or "Life in the UK Exam"
      category_name =
        category_name.charAt(0).toUpperCase() + category_name.slice(1); //  uppercase the first letter
      let template = `Life in the UK ${category_name.replace(/s$/g, "")}`; // Make plural word singluar (only for words that end with an s)
      // check if no tests doc!
      if (data.length === 0) {
        isLoadingGenerateID = !true; // ux
        test.test_title = `${template} 1`;
        return;
      }

      let lastIDIndex = parseInt(data[0].test_title.replace(/\D/g, "")); // extract number from text, then convert it to Integer
      let length = data.length;

      // case 1: the last index of the tests is > than the length of ids 🙄
      if (lastIDIndex > length) {
        isLoadingGenerateID = !true; // ux
        test.test_title = `${template} ${lastIDIndex + 1}`;
        return;
      }
      // case 2: the last index of the tests is < than the length of ids 🙄
      else if (lastIDIndex < length) {
        isLoadingGenerateID = !true; // ux
        test.test_title = `${template} ${length + 1}`;
        return;
      }
      // defalut return 😎
      isLoadingGenerateID = !true; // ux
      test.test_title = `${template} ${lastIDIndex + 1}`;
      return;
    } catch (error) {
      setNotificationTest({
        message: error,
      });
    }
  }
  // add test row to sql db
  async function addTest() {
    isLoadingTest = true; // ux
    try {
      // check format:
      let collector = [];
      if (test.test_title === "") {
        collector.push("title");
      }
      if (test.test_description === "") {
        collector.push("description");
      }
      if (test.score_to_pass === "") {
        collector.push("score to pass");
      }
      if (tmp_test_category.category_id === "") {
        collector.push("category");
      }
      // dynamic responce text 🤭
      if (collector.length > 0) {
        let message = `The ${collector} ${
          collector.length > 1 ? "are" : "is"
        } empty 🙄!`;

        setNotificationTest({
          message,
        });
        isLoadingTest = false; // ux
        return;
      }
      // the score_to_pass must be positive non-zero
      test.score_to_pass = parseInt(test.score_to_pass);
      if (test.score_to_pass <= 0) {
        setNotificationTest({
          message: `score-to-pass must be > 0 🤦‍♂`,
        });
        isLoadingTest = false; // ux
        return;
      }

      test.status_id = tmp_status ? "private" : "public";
      test.category_id = tmp_test_category.category_id;

      // set data in db
      let { error } = await supabase.from("test").insert(test);
      if (error) throw error.message;
      // send message to the author 🤗 ux
      setNotificationTest({
        message: `the '${test.test_title}' is successfully added!`,
        type: "is-success",
      });
      isLoadingTest = false; // ux
      resetFields({ type: "tests" }); // reset all test fields 😉 ux
    } catch (error) {
      setNotificationTest({
        message: error,
        type: "is-danger",
      });
      isLoadingTest = false; // ux
    }
  }

  async function addQuestion() {
    isLoadingQuestion = true; //ux
    try {
      // check format:
      let collector = [];
      if (question.question_title === "") {
        collector.push("question");
      }
      if (question.question_hint === "") {
        collector.push("hint");
      }
      if (question.question_correction === "") {
        collector.push("correction");
      }
      // Tags in this case optional
      /*
      if (tags.length === 0) {
        collector.push("tags");
      }
      */
      if (answers.length === 0) {
        collector.push("answers");
      }
      if (tmp_test_id === "") {
        collector.push("test parent");
      }
      // dynamic responce text 🤭
      if (collector.length > 0) {
        let message = `The ${collector} ${
          collector.length > 1 ? "are" : "is"
        } empty 🙄!`;
        setNotificationQuestion({
          message,
        });
        isLoadingQuestion = false; // ux
        return;
      }
      if (parseInt(question.question_point) <= 0) {
        setNotificationQuestion({
          message: `point must be > 0 🤦‍♂`,
        });
        isLoadingQuestion = false; // ux
        return;
      }
      if (answers.length < 2) {
        setNotificationQuestion({
          message: `at least you have to put 2 answers 🤦‍♂`,
        });
        isLoadingQuestion = false; // ux
        return;
      }
      let counter = 0;
      for (const e of answers) {
        if (e.is_correct == true) counter++;
      }
      if (counter == 0) {
        setNotificationQuestion({
          message: `at least you have to put 1 correct answer 🤦‍♂`,
        });
        isLoadingQuestion = false; // ux
        return;
      }

      // call sql function from db
      const { data, error } = await supabase.rpc("create_question", {
        t_id: tmp_test_id,
        q_title: question.question_title,
        q_hint: question.question_hint,
        q_correction: question.question_correction,
        q_point: question.question_point,
        answers,
        tags,
      });

      if (error) throw error.message;

      // send message to the author 🤗 ux
      setNotificationQuestion({
        message: `the question_id '${data.question_id}' is successfully added!`,
        type: "is-success",
      });
      isLoadingQuestion = false; // ux
      resetFields({ type: "questions" }); // reset all questions fields 😉 ux
    } catch (error) {
      setNotificationQuestion({
        message: error,
        type: "is-danger",
      });
      isLoadingQuestion = false; // ux
    }
  }

  // Load tests ids from supabase
  async function loadTestIDs() {
    isLoadingTestParent = true; // ux 😉
    try {
      const { data, error } = await supabase
        .from("test")
        .select("test_id, test_title")
        .order("order_test_title", { ascending: false });
      if (error) throw error.message;
      isLoadingTestParent = false; // ux 😉
      return data;
    } catch (error) {
      setNotificationQuestion({
        message: error,
        type: "is-danger",
      });
      isLoadingTestParent = false; // ux 😉
    }
  }
  // Load tags from supabase
  async function loadTags({ showModal = false }) {
    isLoadingTags = true; // ux 😉
    try {
      const { data, error } = await supabase.from("tag").select("tag_id");
      if (error) throw error.message;

      isLoadingTags = false; // ux 😉
      if (showModal) isModalActive = true; // ux 😉
      tagsFromDB = data.map((e) => e.tag_id);
      tagsFromDB.sort();
    } catch (error) {
      setNotificationQuestion({
        message: error,
        type: "is-danger",
      });
      isLoadingTags = false; // ux 😉
      isModalActive = false; // ux
    }
  }
  // Load categories from supabase
  async function loadCategories() {
    isLoadingCategory = true; // ux 😉
    try {
      const { data, error } = await supabase.from("category").select("*");
      if (error) throw error.message;
      isLoadingCategory = false; // ux 😉
      return data;
    } catch (error) {
      setNotificationTest({
        message: error,
        type: "is-danger",
      });
      isLoadingCategory = false; // ux 😉
    }
  }

  $: console.log(tmp_test_category);
</script>

<!-- Modal: Select Tags -->
<Modal bind:active={isModalActive}>
  <div class="modal-background" />
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Select Tags</p>
    </header>
    <section class="modal-card-body">
      <!-- Content ... -->
      <div class="columns is-multiline">
        {#each tagsFromDB as tag}
          <div class="column is-6">
            <label class="checkbox">
              <input type="checkbox" bind:group={tags} value={tag} />
              {tag}
            </label>
          </div>
        {:else}No tags in database!{/each}
      </div>
    </section>
    <footer class="modal-card-foot">
      <Button type="is-dark" on:click={() => (isModalActive = false)}>
        Okay
      </Button>
      <Button
        on:click={() => {
          tags = [];
        }}
      >
        Reset
      </Button>
      <p>
        You're select {tags.length}
        {tags.length === 1 ? "tag" : "tags"}
      </p>
    </footer>
  </div>
</Modal>

<!-- body -->
<div class="tile">
  <!-- ** section 1: Tests ** -->
  <div class="tile is-vertical mx-4 notification">
    <!-- Category -->
    <label for="" class="label">Category</label>
    <Field>
      <Select
        placeholder="chose category"
        bind:selected={tmp_test_category}
        expanded
        loading={isLoadingCategory}
      >
        {#await loadCategories() then data}
          {#each data as item}
            <option
              class="is-capitalized"
              value={{
                category_id: item.category_id,
                category_name: item.category_name,
              }}>{item.category_name}</option
            >
          {/each}
        {/await}
        <option
          value={{
            category_id: null,
            category_name: null,
          }}>Null</option
        >
      </Select>
    </Field>
    <!-- Generate Unique Title -->
    <Button
      type="is-dark block"
      on:click={generateCorrectTestTitle(
        tmp_test_category.category_id,
        tmp_test_category.category_name
      )}
      loading={isLoadingGenerateID}
      disabled={!tmp_test_category.category_id}
    >
      Generate Unique Title!
    </Button>

    <!-- Title -->
    <Field label="test title">
      <Input
        placeholder="add a title of test here 🤪"
        bind:value={test.test_title}
        icon="dove"
      />
    </Field>
    <!-- Description -->
    <Field label="test description">
      <Input
        placeholder="add a description of test here, don't write so mush 🙄"
        type="textarea"
        bind:value={test.test_description}
        maxlength="1000"
      />
    </Field>
    <!-- Difficuly -->
    <Field label="difficulty">
      <div class="columns is-multiline">
        {#await supabase.from("difficulty").select("difficulty_id")}
          Loading difficulty ...
        {:then { data }}
          {#each data as d}
            <div class="column">
              <label for={d.difficulty_id}>{d.difficulty_id}</label>
              <input
                id={d.difficulty_id}
                type="radio"
                name="difficulty"
                bind:group={test.difficulty_id}
                value={d.difficulty_id}
              />
            </div>
          {:else}No difficulty in database!{/each}
        {/await}
      </div>
    </Field>
    <!-- Score To Pass -->
    <Field label="Score To Pass">
      <Input
        placeholder="add a number value > 0 🐿"
        type="number"
        bind:value={test.score_to_pass}
        max="1000"
        min="1"
      />
    </Field>
    <!-- Status? isPrivate? -->
    <div class="field">
      <Switch bind:checked={tmp_status}>is private 🤴?</Switch>
    </div>
    <!-- Upload a Test -->
    <Button
      type="is-dark is-fullwidth"
      on:click={(e) => addTest()}
      loading={isLoadingTest}
      expanded
    >
      <Icon icon="plus" />
    </Button>
    <!-- Hiding area; Notification for success of error -->
    <Notification
      icon={true}
      type={notificationTest.type}
      bind:active={notificationTest.showUp}
    >
      {notificationTest.message}
    </Notification>
  </div>

  <!-- ** section 2: question ** -->
  <div class="tile is-vertical mr-4 notification">
    <!-- question title -->
    <Field label="question">
      <Input
        placeholder="add a question title here, be criative 😎"
        bind:value={question.question_title}
        icon="dragon"
      />
    </Field>
    <!-- question hint -->
    <Field label="hint">
      <Input
        placeholder="add a hint (to help user) here, 👌"
        type="text"
        bind:value={question.question_hint}
        maxlength="1000"
      />
    </Field>
    <!-- question point -->
    <Field label="Point">
      <Input
        placeholder="add a point here, 👌"
        type="number"
        bind:value={question.question_point}
      />
    </Field>
    <!-- question correction -->
    <Field label="correction">
      <Input
        placeholder="add a question correction (the real answer) here, 👌"
        type="textarea"
        bind:value={question.question_correction}
        maxlength="1000"
        size="is-small"
      />
    </Field>
    <!-- add tags -->
    <label class="label">add tags (optional)</label>
    <Button
      expanded
      type="is-dark"
      on:click={() => loadTags({ showModal: true })}
      loading={isLoadingTags}
    >
      <Icon icon="fire" />
    </Button>
    <div class="notification">
      <!-- display tags -->
      <Taglist>
        {#each tags as item, i}
          <Tag closable type="is-dark" on:close={(e) => deleteTag(i)}
            >{item}</Tag
          >
        {:else}
          No tags selected 😭!
        {/each}
      </Taglist>
    </div>
    <!-- add answers -->
    <label class="label">add answers</label>
    <Field>
      <Input
        expanded
        bind:value={tmp_answer.answer_title}
        placeholder="Add an anwser here .. 🥰"
        icon="fish"
      />
      <p class="control">
        <Select placeholder="is correct?" bind:selected={tmp_answer.is_correct}>
          <option value={true}>correct</option>
          <option value={false}>wrong</option>
        </Select>
      </p>
      <p class="control">
        <Button type="is-dark" on:click={(e) => addAnswer()}>
          <Icon icon="plus" />
        </Button>
      </p>
    </Field>
    <!-- display answers -->
    {#each answers as { answer_title, is_correct }, i}
      <Field>
        <p class="control">
          <Button type="is-static">{i + 1}</Button>
        </p>
        <Input expanded readonly value={answer_title} />
        <p class="control">
          <Input readonly value={is_correct ? "correct 👍" : "wrong 👎"} />
        </p>
        <p class="control">
          <Button type="is-danger" on:click={() => deleteAnswer(i)}>
            <Icon icon="trash-alt" />
          </Button>
        </p>
      </Field>
    {:else}
      <div class="notification">No answers in this question 😭!</div>
    {/each}

    <!-- Test parent (from db) -->
    <label class="label">add test parent</label>
    <Field>
      <Select
        placeholder="chose one"
        bind:selected={tmp_test_id}
        expanded
        loading={isLoadingTestParent}
      >
        {#await promiseLoadTestIDs then data}
          {#each data as item}
            <option value={item.test_id}>{item.test_title}</option>
          {/each}
        {/await}
      </Select>
      <p class="control">
        <Button
          type="is-dark"
          on:click={(e) => (promiseLoadTestIDs = loadTestIDs())}
        >
          <Icon icon="fire" />
        </Button>
      </p>
    </Field>
    <!-- Upload a question -->
    <Button
      type="is-dark is-fullwidth"
      on:click={(e) => addQuestion()}
      loading={isLoadingQuestion}
      expanded
    >
      <Icon icon="plus" />
    </Button>
    <!-- Hiding area; Notification for success of error -->
    <Notification
      icon={true}
      type={notificationQuestion.type}
      bind:active={notificationQuestion.showUp}
    >
      {notificationQuestion.message}
    </Notification>
  </div>
</div>
