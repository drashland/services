const process = require("process");
const argv = process.argv;

class Command {
    constructor(command) {
        this.command = command;
        this.tok = {};
        this.helpMessage = "";
        this.opts = "";
        this.tokenise(command);
    }

    tokenise(com) {
        const tokens = com.match(/\<[a-zA-Z0-9]+\>/gm);
        for (let i = 0; i < tokens.length; i++) {
            const name = tokens[i];
            if (argv[2] == this.command.split(" ")[0]) {
                // console.log(name, " = ", argv[i+3]); // <scope>
                this.tok[name.substring(1, name.length - 1)] = argv[i + 3];
            } else if (argv[2] == "help") {
                this.showHelpMessage();
                break;
            }
        }
    }

    showHelpMessage(...message) {
        if (this.helpMessage.trim() == "") {
            console.log(
                "This is the default help message. Customize by this message by using the helpMessage() function by passing in some text"
            );
        } else {
            return this.helpMessage;
        }
    }

    options(...arr) {
        for (let i = 0; i < arr.length; i++) {
            if (argv[argv.length - 1] == arr[i]) {
                this.opts = arr[i];
                break;
            }
        }
        return {
            arguments: this.tok,
            option: this.opts,
        };
    }
}

//const cmd = new Command(
//    "hello <scope> <server>",
//   "This is my help message"
//).options("--help", "--hell");
