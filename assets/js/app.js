// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html";

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import socket from "./socket.js"
import run_memory from "./memory.jsx";

//taken from Nat Tuck's lecture notes
function init() {
    if (document.getElementById('game')) {
        $('#start-game').click(() => {
            let name = $('#game-name-input').val();
            let channel = socket.channel(`memory:${name}`, {});
            channel.join()
                .receive("ok", resp => {
                    let title = document.getElementById('title');
                    title.innerText = `Memory Game: ${name}`

                    let root = document.getElementById('game');
                    run_memory(root, channel, resp.game);

                    console.log(`memory:${name} joined successfully`, resp);
                })
                .receive("error", resp => { console.log("Unable to join", resp); });
        });
    }
}

// Use jQuery to delay until page loaded.
$(init);

