/* ************************************ */
/* Define helper functions */
/* ************************************ */
function assessPerformance() {
  /* Function to calculate the "credit_var", which is a boolean used to
  credit individual experiments in expfactory.
   */
  var experiment_data = jsPsych.data.getTrialsOfType('single-stim-button');
  var missed_count = 0;
  var trial_count = 0;
  var rt_array = [];
  var rt = 0;
  var avg_rt = -1;
  //record choices participants made
  for (var i = 0; i < experiment_data.length; i++) {
    trial_count += 1
    rt = experiment_data[i].rt
    if (rt == -1) {
      missed_count += 1
    } else {
      rt_array.push(rt)
    }
  }
  //calculate average rt
  if (rt_array.length !== 0) {
    avg_rt = math.median(rt_array)
  } else {
    avg_rt = -1
  }
  credit_var = (avg_rt > 100)
  jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
}

var getStim = function() {
  var ref_board = makeBoard('your_board', curr_placement, 'ref')
  var target_board = makeBoard('peg_board', problems[problem_i])
  var canvas = '<div class = tol_canvas><div class="tol_vertical_line"></div></div>'
  var hold_box;
  if (held_ball !== 0) {
    ball = colors[held_ball - 1]
    hold_box = '<div class = tol_hand_box><div class = "tol_hand_ball tol_' + ball +
      '"><div class = tol_ball_label>' + ball[0] +
      '</div></div></div><div class = tol_hand_label><strong>In mano</strong></div>'
  } else {
    hold_box =
      '<div class = tol_hand_box></div><div class = tol_hand_label><strong>In mano</strong></div>'
  }
  return canvas + ref_board + target_board + hold_box
}

var getPractice = function() {
  var ref_board = makeBoard('your_board', curr_placement, 'ref')
  var target_board = makeBoard('peg_board', example_problem3)
  var canvas = '<div class = tol_canvas><div class="tol_vertical_line"></div></div>'
  var hold_box;
  if (held_ball !== 0) {
    ball = colors[held_ball - 1]
    hold_box = '<div class = tol_hand_box><div class = "tol_hand_ball tol_' + ball +
      '"><div class = tol_ball_label>' + ball[0] +
      '</div></div></div><div class = tol_hand_label><strong>In mano</strong></div>'
  } else {
    hold_box =
      '<div class = tol_hand_box></div><div class = tol_hand_label><strong>In mano</strong></div>'
  }
  return canvas + ref_board + target_board + hold_box
}

var getFB = function() {
  var data = jsPsych.data.getLastTrialData()
  var target = data.target
  var isequal = true
  correct = false
  for (var i = 0; i < target.length; i++) {
    isequal = arraysEqual(target[i], data.current_position[i])
    if (isequal === false) {
      break;
    }
  }
  var feedback;
  if (isequal === true) {
    feedback = "Corretto!"
    correct = true
    var cresp = Number(sessionStorage.getItem('TOL'));
    cresp++;
    sessionStorage.setItem('TOL', cresp);
  } else {
    feedback = "Il tempo è scaduto, non hai indovinato."
  }
  var ref_board = makeBoard('your_board', curr_placement)
  var target_board = makeBoard('peg_board', target)
  var canvas = '<div class = tol_canvas><div class="tol_vertical_line"></div></div>'
  var feedback_box = '<div class = tol_feedbackbox><p class = center-text>' + feedback +
    '</p></div>'
  return canvas + ref_board + target_board + feedback_box
}


var getTime = function() {
  if ((time_per_trial - time_elapsed) > 0) {
    return time_per_trial - time_elapsed
  } else {
    return 1
  }

}

var getText = function() {
  return "<div class = centerbox><p class = center-block-text>Stai per iniziare l'esercizio numero " + (problem_i + 2) +
    '. Premi <strong>la barra spaziatrice</strong> per iniziare.</p></div>'
}

var pegClick = function(peg_id) {
  var choice = Number(peg_id.slice(-1)) - 1
  var peg = curr_placement[choice]
  var ball_location = 0
  if (held_ball === 0) {
    for (var i = peg.length - 1; i >= 0; i--) {
      if (peg[i] !== 0) {
        held_ball = peg[i]
        peg[i] = 0
        num_moves += 1
        break;
      }
    }
  } else {
    var open_spot = peg.indexOf(0)
    if (open_spot != -1) {
      peg[open_spot] = held_ball
      held_ball = 0
    }
  }
}

var makeBoard = function(container, ball_placement, board_type) {
  var board = '<div class = tol_' + container + '><div class = tol_base></div>'
  if (container == 'your_board') {
    board += '<div class = tol_board_label><strong>Tu</strong></div>'
  } else {
    board += '<div class = tol_board_label><strong>Obbietivo</strong></div>'
  }
  for (var p = 0; p < 3; p++) {
    board += '<div id = tol_peg_' + (p + 1) + '><div class = tol_peg></div></div>' //place peg
      //place balls
    if (board_type == 'ref') {
      if (ball_placement[p][0] === 0 & held_ball === 0) {
        board += '<div id = tol_peg_' + (p + 1) + ' onclick = "pegClick(this.id)">'
      } else if (ball_placement[p].slice(-1)[0] !== 0 & held_ball !== 0) {
        board += '<div id = tol_peg_' + (p + 1) + ' onclick = "pegClick(this.id)">'
      } else {
        board += '<div class = special id = tol_peg_' + (p + 1) + ' onclick = "pegClick(this.id)">'
      }
    } else {
      board += '<div id = tol_peg_' + (p + 1) + ' >'
    }
    var peg = ball_placement[p]
    for (var b = 0; b < peg.length; b++) {
      if (peg[b] !== 0) {
        ball = colors[peg[b] - 1]
        board += '<div class = "tol_ball tol_' + ball + '"><div class = tol_ball_label>' +
          '</div></div>'
      }
    }
    board += '</div>'
  }
  board += '</div>'
  return board
}

var arraysEqual = function(arr1, arr2) {
  if (arr1.length !== arr2.length)
    return false;
  for (var i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i])
      return false;
  }
  return true;
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true

// task specific variables
var correct = false
var exp_stage = 'practice'
var colors = ['Green', 'Red', 'Blue']
var problem_i = 0
var time_per_trial = 20000 //time per trial in seconds
var time_elapsed = 0 //tracks time for a problem
var num_moves = 0 //tracks number of moves for a problem
  /*keeps track of peg board (where balls are). Lowest ball is the first value for each peg.
  So the initial_placement has the 1st ball and 2nd ball on the first peg and the third ball on the 2nd peg.
  */
  // make your board
var curr_placement = [
  [1, 2, 0],
  [3, 0],
  [0]
]
var example_problem1 = [
  [1, 2, 0],
  [0, 0],
  [3]
]
var example_problem2 = [
  [1, 0, 0],
  [3, 0],
  [2]
]
var example_problem3 = [
  [1, 0, 0],
  [3, 2],
  [0]
]
var ref_board = makeBoard('your_board', curr_placement)
var problems = [
  [
    [0, 0, 0],
    [3, 1],
    [2]
  ],
  [
    [1, 0, 0],
    [2, 0],
    [3]
  ],
  [
    [1, 3, 0],
    [2, 0],
    [0]
  ],
  [
    [1, 0, 0],
    [2, 3],
    [0]
  ]/*,
  [
    [2, 1, 0],
    [3, 0],
    [0]
  ],
  [
    [3, 0, 0],
    [2, 1],
    [0]
  ],
  [
    [2, 3, 0],
    [0, 0],
    [1]
  ],
  [
    [0, 0, 0],
    [2, 3],
    [1]
  ],
  [
    [2, 1, 3],
    [0, 0],
    [0]
  ],
  [
    [2, 3, 1],
    [0, 0],
    [0]
  ],
  [
    [3, 1, 0],
    [2, 0],
    [0]
  ],
  [
    [3, 0, 0],
    [2, 0],
    [1]
  ]*/
]
var answers = [2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5]
var held_ball = 0

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */


/* define static blocks */
var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "end",
    exp_id: 'tower_of_london'
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = center-block-text>Hai completato gli esercizi!</p><p class = center-block-text>Premi <strong>la barra spaziatrice</strong> per continuare.</p></div>',
  cont_key: [32],
  timing_post_trial: 0,
  on_finish: assessPerformance
};


/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = tol_topbox><p class = block-text>Sullo schermo apparirà una configurazione che lei dovrà raggiungere spostando le sfere fra i vari pioli. </p></div>' +
    ref_board + makeBoard('peg_board', example_problem1) +
    '<div class = tol_bottombox><p class = block-text>Per spostare una sfera, dovrà cliccare prima sulla sfera che vuole spostare e poi sul piolo su cui vuole spostarla.</p></div>',
    '<div class = tol_topbox><p class = block-text>Attenzione: per spostare una sfera che si trova sotto un’altra è necessario spostare prima la sfera posta superiormente.</p></div>' +
    ref_board + makeBoard('peg_board', example_problem2) + '<div class = tol_bottombox></div>',
    '<div class = tol_topbox><p class = block-text> Partendo quindi dalla configurazione a sinistra, lei dovrà raggiungere la configurazione di destra spostando le sfere fra i vari pioli rispettando le regole degli spostamenti.</p></div>'+
    ref_board + makeBoard('peg_board', example_problem1) + '<div class = tol_bottombox></div>',
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var instruction_node = {
  timeline: [instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.length; i++) {
      if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
        rt = data[i].rt
        sumInstructTime = sumInstructTime + rt
      }
    }
  }
}


var start_test_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "instruction"
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = block-text>Sta per iniziare il primo esercizio. Ci saranno in totale ' +
    problems.length + ' esercizi da svolgere. Premi <strong>la barra spaziatrice</strong> per iniziare.</p></div>',
  cont_key: [32],
  timing_post_trial: 1000,
  on_finish: function() {
    exp_stage = 'test'
    held_ball = 0
    time_elapsed = 0
    num_moves = 0;
    curr_placement = [
      [1, 2, 0],
      [3, 0],
      [0]
    ]
  }
};

var advance_problem_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "advance",
    exp_stage: 'test'
  },
  timing_response: 180000,
  text: getText,
  cont_key: [32],
  on_finish: function() {
    held_ball = 0
    time_elapsed = 0
    problem_i += 1;
    num_moves = 0;
    curr_placement = [
      [1, 2, 0],
      [3, 0],
      [0]
    ]
  }
}

var practice_tohand = {
  type: 'single-stim-button',
  stimulus: getPractice,
  button_class: 'special',
  is_html: true,
  data: {
    trial_id: "to_hand",
    exp_stage: 'practice'
  },
  timing_stim: getTime,
  timing_response: getTime,
  timing_post_trial: 0,
  on_finish: function(data) {
    if (data.mouse_click != -1) {
      time_elapsed += data.rt
    } else {
      time_elapsed += getTime()
    }
    jsPsych.data.addDataToLastTrial({
      'current_position': jQuery.extend(true, [], curr_placement),
      'num_moves_made': num_moves,
      'target': example_problem3,
      'min_moves': 1,
      'problem_id': 'practice'
    })
  }
}

var practice_toboard = {
  type: 'single-stim-button',
  stimulus: getPractice,
  button_class: 'special',
  is_html: true,
  data: {
    trial_id: "to_board",
    exp_stage: 'practice'
  },
  timing_stim: getTime,
  timing_response: getTime,
  timing_post_trial: 0,
  on_finish: function(data) {
    if (data.mouse_click != -1) {
      time_elapsed += data.rt
    } else {
      time_elapsed += getTime()
    }
    jsPsych.data.addDataToLastTrial({
      'current_position': jQuery.extend(true, [], curr_placement),
      'num_moves_made': num_moves,
      'target': example_problem3,
      'min_moves': 1,
      'problem_id': 'practice'
    })
  }
}

var test_tohand = {
  type: 'single-stim-button',
  stimulus: getStim,
  button_class: 'special',
  is_html: true,
  data: {
    trial_id: "to_hand",
    exp_stage: 'test'
  },
  timing_stim: getTime,
  timing_response: getTime,
  timing_post_trial: 0,
  on_finish: function(data) {
    if (data.mouse_click != -1) {
      time_elapsed += data.rt
    } else {
      time_elapsed += getTime()
    }
    jsPsych.data.addDataToLastTrial({
      'current_position': jQuery.extend(true, [], curr_placement),
      'num_moves_made': num_moves,
      'target': problems[problem_i],
      'min_moves': answers[problem_i],
      'problem_id': problem_i
    })
  }
}

var test_toboard = {
  type: 'single-stim-button',
  stimulus: getStim,
  button_class: 'special',
  is_html: true,
  data: {
    trial_id: "to_board",
    exp_stage: 'test'
  },
  timing_stim: getTime,
  timing_response: getTime,
  timing_post_trial: 0,
  on_finish: function(data) {
    if (data.mouse_click != -1) {
      time_elapsed += data.rt
    } else {
      time_elapsed += getTime()
    }
    jsPsych.data.addDataToLastTrial({
      'current_position': jQuery.extend(true, [], curr_placement),
      'num_moves_made': num_moves,
      'target': problems[problem_i],
      'min_moves': answers[problem_i],
      'problem_id': problem_i
    })
  }
}

var feedback_block = {
  type: 'poldrack-single-stim',
  stimulus: getFB,
  choices: 'none',
  is_html: true,
  data: {
    trial_id: 'feedback'
  },
  timing_stim: 2000,
  timing_response: 2000,
  timing_post_trial: 500,
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      'exp_stage': exp_stage,
      'problem_time': time_elapsed,
      'correct': correct
    })
  },
}

var practice_node = {
  timeline: [practice_tohand, practice_toboard],
  loop_function: function(data) {
    if (time_elapsed >= time_per_trial) {
      return false
    }
    data = data[1]
    var target = data.target
    var isequal = true
    for (var i = 0; i < target.length; i++) {
      isequal = arraysEqual(target[i], data.current_position[i])
      if (isequal === false) {
        break;
      }
    }
    return !isequal
  },
  timing_post_trial: 1000
}

var problem_node = {
  timeline: [test_tohand, test_toboard],
  loop_function: function(data) {
    if (time_elapsed >= time_per_trial) {
      return false
    }
    data = data[1]
    var target = data.target
    var isequal = true
    for (var i = 0; i < target.length; i++) {
      isequal = arraysEqual(target[i], data.current_position[i])
      if (isequal === false) {
        break;
      }
    }
    return !isequal
  },
  timing_post_trial: 1000
}

/* create experiment definition array */
var tower_of_london_experiment = [];
tower_of_london_experiment.push(instruction_node);
tower_of_london_experiment.push(practice_node);
tower_of_london_experiment.push(feedback_block)
tower_of_london_experiment.push(start_test_block);
for (var i = 0; i < problems.length; i++) {
  tower_of_london_experiment.push(problem_node);
  tower_of_london_experiment.push(feedback_block)
  if (i != problems.length-1) {
    tower_of_london_experiment.push(advance_problem_block)
  }
}
tower_of_london_experiment.push(end_block);
