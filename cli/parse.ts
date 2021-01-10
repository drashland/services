const argv = process.argv;

class Command{
	constructor(command){
		this.command = command;
		this.tok = {}
		this.tokenise(this.command)
	}

	tokenise(com){
		const tokens = com.match(/\<[a-zA-Z0-9]+\>/gm);
		for(let i = 0;i < tokens.length;i++){
			const name = tokens[i];
			if(argv[2] == this.command.split(" ")[0]){
				// console.log(name, " = ", argv[i+3]); // <scope>
				this.tok[name.substring(1, name.length-1)] = argv[i+3]
			}
		}
		console.log(JSON.stringify(this.tok));
	}
}

const cmd = new Command("hello <scope> <server>");
