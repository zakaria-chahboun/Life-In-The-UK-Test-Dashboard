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
    Notification
  } from "svelma";
  import { firestore } from "./firebase.js";

  // -- Questions Section --
  let questions = {
    index: "",
    question: "",
    description: "",
    tags: ["manga", "anime"],
    answers: []
  };

  // -- Tests Section --
  let tests = {
    testTitle: "",
    testSubtitle: "",
    isAuth: false
  };
  let testID; // for set a named test id (test_1 , test_2 ..)
  let questionsID; // subcollection

  // -- Local Variables --
  let tag;
  let answer = {
    answer: "",
    isCorrect: false
  };
  let testParent;
  let isLoadingTest = false; // ui/ux
  let isLoadingQuestion = false; // ui/ux
  let isLoadingTestParent = false; // ui/ux
  let isLoadingGenerateID = false; // ui/ux
  let notificationTest = {
    showUp: false,
    message: "",
    type: "is-warning"
  };
  let notificationQuestion = {
    showUp: false,
    message: "",
    type: "is-warning"
  };

  // ____________ Client Data handling _____________________
  function addTag(event) {
    // adding tags by Enter event :)
    if (event && event.key === "Enter") {
      // remove white spaces, tabs ..
      tag = tag.trim();
      // we don't want empty data
      if (tag === "") {
        return;
      }
      // we don't want duplicated data
      else if (questions.tags.includes(tag)) {
        return;
      }
      // if there is many tags in input (sport,manga ..) add them all 👍
      else if (tag.split(",").length > 1) {
        tag = tag.split(",").map(e => e.trim());
        questions.tags = [...questions.tags, ...tag];
        tag = ""; // reset
      } else {
        questions.tags = [...questions.tags, tag];
        tag = ""; // reset
      }
    }
  }
  function deleteTag(index) {
    questions.tags.splice(index, 1);
    questions.tags = questions.tags;
  }
  function addAnswer() {
    questions.answers.push({
      answer: answer.answer,
      isCorrect: answer.isCorrect
    });
    questions.answers = questions.answers;
  }
  function deleteAnswer(index) {
    questions.answers.splice(index, 1);
    questions.answers = questions.answers;
  }
  // __ notifictions of questions : for sending success or erros messages
  function setNotificationQuestion({
    message,
    type = "is-warning",
    timeout = 4000
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
    timeout = 4000
  }) {
    notificationTest.showUp = true; // show it
    notificationTest.message = message;
    notificationTest.type = type;

    setTimeout(() => {
      notificationTest.showUp = false; // close it
      notificationTest.message = ""; // clear
    }, timeout);
  }
  function resetTestFields() {}
  function resetQuestionFields() {}

  // ____________ Firebase Data Handling ____________
  // for generate a test id (with a name like: test_3)
  async function generateTestNamedID() {
    isLoadingGenerateID = true; // ux
    try {
      // get tests from db
      const testsCollection = await firestore.collection("tests").get();
      // extract ids 🥑 >> filter start with 'test_' 👌 >> sotring! 🥰
      const ids = testsCollection.docs
        .map(e => e.id)
        .filter(e => e.startsWith("test_"))
        .sort();

      // check if no tests doc!
      if (ids.length === 0) {
        isLoadingGenerateID = !true; // ux
        testID = `test_1`;
        return;
      }

      let lastIDIndex = parseInt(ids[ids.length - 1].slice(5));
      let length = ids.length;

      // case 1: the last index of the tests is > than the length of ids 🙄
      if (lastIDIndex > length) {
        isLoadingGenerateID = !true; // ux
        testID = `test_${lastIDIndex + 1}`;
        return;
      }
      // case 2: the last index of the tests is < than the length of ids 🙄
      else if (lastIDIndex < length) {
        isLoadingGenerateID = !true; // ux
        testID = `test_${length + 1}`;
        return;
      }
      // defalut return 😎
      isLoadingGenerateID = !true; // ux
      testID = `test_${lastIDIndex + 1}`;
      return;
    } catch (error) {
      setNotificationTest({
        message: error
      });
    }
  }
  // add test doc in db
  async function addTest() {
    isLoadingTest = true; // ux
    try {
      // check format:
      let collector = [];
      if (testID === "") {
        collector.push("ID");
      }
      if (tests.testTitle === "") {
        collector.push("title");
      }
      if (tests.testSubtitle === "") {
        collector.push("subtitle");
      }
      // dynamic responce text 🤭
      if (collector.length > 0) {
        let message = `The ${collector} ${
          collector.length > 1 ? "are" : "is"
        } empty 🙄!`;
        setNotificationTest({
          message
        });
        isLoadingTest = false; // ux
        return;
      }
      // set data in db
      const testsCollection = await firestore
        .collection("tests")
        .doc(testID)
        .set(tests);
      // send message to the author 🤗 ux
      setNotificationTest({
        message: `the ${testID} is successfully added!`,
        type: "is-success"
      });
      isLoadingTest = false; // ux
      testID = ""; // rest
    } catch (error) {
      setNotificationTest({
        message: error
      });
    }
  }

  function addQuestion() {
    isLoadingQuestion = true;
  }

  function generateQuestionIndex() {}

  function generateTestQuestionIndex() {}

  function addQuestionsToTest() {}
</script>

<!-- body -->
<div class="tile">

  <!-- ** section 1: Tests ** -->
  <div class="tile is-vertical mx-4 notification">
    <!-- Test ID -->
    <label class="label">test id</label>
    <Field>
      <Input
        placeholder="a named id like (test_1) 🥑"
        bind:value={testID}
        icon="fire"
        expanded
        readonly />
      <p class="control">
        <Button
          type="is-dark"
          on:click={generateTestNamedID}
          loading={isLoadingGenerateID}>
          Generate!
        </Button>
      </p>
    </Field>
    <!-- Title -->
    <Field label="test title">
      <Input
        placeholder="add a title of test here 🤪"
        bind:value={tests.testTitle}
        icon="dove" />
    </Field>
    <!-- Subtitle -->
    <Field label="test subtitle">
      <Input
        placeholder="add a subtitle of test here, don't write so mush 🙄"
        type="textarea"
        bind:value={tests.testSubtitle}
        maxlength="80" />
    </Field>
    <!-- isAuth? -->
    <div class="field">
      <Switch bind:checked={tests.isAuth}>is authenticated 🤴?</Switch>
    </div>
    <!-- Upload a Test -->
    <Button
      type="is-dark is-fullwidth"
      on:click={e => addTest()}
      loading={isLoadingTest}
      expanded>
      <Icon icon="plus" />
    </Button>
    <!-- Hiding area; Notification for success of error -->
    <Notification
      icon={true}
      type={notificationTest.type}
      bind:active={notificationTest.showUp}>
      {notificationTest.message}
    </Notification>
  </div>

  <!-- ** section 2: Questions ** -->
  <div class="tile is-vertical mr-4 notification">
    <!-- question text -->
    <Field label="question">
      <Input
        placeholder="add a question text here, be criative 😎"
        bind:value={questions.question}
        icon="dragon" />
    </Field>
    <!-- description -->
    <Field label="description">
      <Input
        placeholder="add a question description (the real answer) here, 👌"
        type="textarea"
        bind:value={questions.description}
        maxlength="300" />
    </Field>
    <!-- add tags -->
    <Field label="add tags">
      <Input
        bind:value={tag}
        on:keydown={event => addTag(event)}
        placeholder="Add tag here, then press 'Enter' key 💜"
        icon="horse" />
    </Field>
    <!-- display tags -->
    <Taglist>
      {#each questions.tags as item, i}
        <Tag closable type="is-dark" on:close={e => deleteTag(i)}>{item}</Tag>
      {/each}
    </Taglist>
    <!-- add answers -->
    <label class="label">add answers</label>
    <Field>
      <Input
        expanded
        bind:value={answer.answer}
        on:keydown={event => addTag(event)}
        placeholder="Add an anwser here .. 🥰"
        icon="fish" />
      <p class="control">
        <Select placeholder="is correct?" bind:selected={answer.isCorrect}>
          <option value={true}>correct</option>
          <option value={false}>wrong</option>
        </Select>
      </p>
      <p class="control">
        <Button type="is-dark" on:click={e => addAnswer()}>
          <Icon icon="plus" />
        </Button>
      </p>
    </Field>
    <!-- display answers -->
    {#each questions.answers as { answer, isCorrect }, i}
      <Field>
        <p class="control">
          <Button type="is-static">{i + 1}</Button>
        </p>
        <Input expanded readonly value={answer} />
        <p class="control">
          <Input readonly value={isCorrect ? 'correct 👍' : 'wrong 👎'} />
        </p>
        <p class="control">
          <Button type="is-danger" on:click={() => deleteAnswer(i)}>
            <Icon icon="trash-alt" />
          </Button>
        </p>
      </Field>
    {/each}
    <!-- Test parent (from db) -->
    <Field label="add test parent">
      <Select
        placeholder="chose one"
        bind:selected={testParent}
        expanded
        loading={isLoadingTestParent}>
        <option value={true}>test1</option>
        <option value={true}>test2</option>
      </Select>
    </Field>
    <!-- Upload a question -->
    <Button
      type="is-dark is-fullwidth"
      on:click={e => addQuestion()}
      loading={isLoadingQuestion}
      expanded>
      <Icon icon="plus" />
    </Button>
  </div>

</div>
