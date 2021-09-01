<script>
  import { supabase } from "./supabase.js";
  import { onMount } from "svelte";

  onMount(async () => {
    const { data, error } = await supabase.rpc("create_question", {
      t_id:1,
      q_title: "Title 2",
      q_hint: 'hint 2',
      q_correction: 'correction 2',
      q_point: 1,
      answers: [{answer_title:"answer 1",is_correct:true},{answer_title:"answer 2",is_correct:false}],
      tags:["animal","sport"]
    });
    console.log(data.question_id);
    console.log(error);
  });
  // create_question(t_id int, q_title varchar, q_hint varchar, q_correction varchar, q_point int, answers answer_type[], tags varchar[])
</script>
