const input_zone = document.getElementById("input-zone");
const subst_zone = document.getElementById("subst-zone");
const MAX_EPSILON = 40;
const MIN_DELTA = 300;
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");

let substitutions = [];

if (!parse_substitutions(localStorage.getItem("substitutions") || "")) {
  localStorage.setItem("substitutions", "");
};

let first_keydown = 0;
let keys_down = {};
let last_keyup = 0;
let prob_combinaison = false;

function all_keys_up() {
  for (let key in keys_down) {
    if (keys_down[key]) return false;
  }
  return true;
}

input_zone.onkeydown = (evt) => {
  if (evt.ctrlKey || evt.altKey || input_zone.selectionStart != input_zone.selectionEnd) return true;
  if (!ALPHABET.includes(evt.key)) {
    for (let substitution of substitutions) {
      if (set_eq(substitution[0], [evt.key])) {
        insert(substitution[1]);
        return false;
      }
    }
    return true;
  }

  if (all_keys_up()) {
    first_keydown = new Date().getTime();
  }

  keys_down[evt.key] = new Date().getTime();
  let epsilon = new Date().getTime() - first_keydown;
  let delta = new Date().getTime() - last_keyup;

  console.log(epsilon, delta, evt.key);

  if ((first_keydown == 0 || epsilon > MAX_EPSILON || delta < MIN_DELTA) && !prob_combinaison) {
    prob_combinaison = false;
    return true;
  } else {
    prob_combinaison = true;
    return false;
  }
}

function insert(str) {
  console.log(str);
  let start = input_zone.value.slice(0, input_zone.selectionStart);
  let end = input_zone.value.slice(input_zone.selectionEnd);
  input_zone.value = start + str + end;
  input_zone.selectionEnd = input_zone.selectionStart = start.length + str.length;
}

function set_eq(a, b) {
  if (a.length !== b.length) return false;
  for (let key of a) {
    if (!b.includes(key)) return false;
  }
  return true;
}

let substituted_timeout = false;

input_zone.onkeyup = (evt) => {
  let substituted = false;
  if (prob_combinaison) {
    prob_combinaison = false;
    let keys = Reflect.ownKeys(keys_down).filter(x => keys_down[x]);

    for (let substitution of substitutions) {
      if (set_eq(substitution[0], keys)) {
        insert(substitution[1]);
        substituted = true;
        break;
      }
    }

    if (!substituted) {
      insert([...keys.sort((a, b) => keys_down[a] - keys_down[b])].join(""));
    } else {
      substituted_timeout = true;
    }
  }

  if (keys_down[evt.key]) keys_down[evt.key] = false;
  if (keys_down[evt.key.toUpperCase()]) keys_down[evt.key.toUpperCase()] = false;
  if (!substituted_timeout) {
    if (ALPHABET.includes(evt.key)) last_keyup = new Date().getTime();
    first_keydown = 0; // get it back to 0
  }
  if (substituted_timeout && all_keys_up()) substituted_timeout = false;
}

function parse_substitutions(raw) {
  let n_substitutions = [];
  for (let line of raw.split("\n")) {
    if (!line) continue;
    let split = line.split(":");
    if (split.length !== 2) return false;
    n_substitutions.push(split);
  }
  substitutions = n_substitutions;
  return true;
}

subst_zone.value = localStorage.getItem("substitutions") || "";

subst_zone.onkeyup = () => {
  localStorage.setItem("substitutions", subst_zone.value);
  if (parse_substitutions(subst_zone.value)) {
    subst_zone.className = "ok"
  } else {
    subst_zone.className = "err"
  }
}
