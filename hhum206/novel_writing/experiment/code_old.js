const canvas = document.getElementById("storyCanvas");
const ctx = canvas.getContext("2d");

ctx.beginPath();
ctx.fillstyle = "#FFFFFF";
ctx.rect(20,0,20,20);
ctx.fill();
ctx.closePath();


function getLines(data){
	let lines = [""];
	counter =  0;
	for(let i = 0; i < data.length; i++){
		char = data[i];
		if (char == "\n"){
			lines.push("");
			counter++;
		} else {
			lines[counter] += data[i];
		}
	}
	return lines;
}

function slice(string, start, stop){
	out = "";
	for(let i = start; i < stop; i++){
		out += string[i];
	}
	return out;
}

function parseHeader(header){
	let cs = [];
	let d1 = "";
	let d2 = "";
	let start = 0;
	state = "search"
	for(let i = 0; i < header.length; i++){
		char = header[i];
		if(state == "search"){
			if(char == "C"){
				state = "recordC";
			} else if(char == "B"){
				state = "recordD1";
			} else if(char == "E"){
				state = "recordD2";
			}
		} else if(state == "recordC"){
			if(char == "("){
				start = i+1;
			} else if(char ==","){
				cs.push(slice(header, start, i));
				start = i+1;
			} else if(char == ")"){
				cs.push(slice(header, start, i));
				state = "search";
			}
		} else if(state == "recordD1"){
			if(char == "("){
				start = i+1;
			} else if(char == ")"){
				d1 = slice(header, start, i);
				state = "search";
			}
		} else if(state == "recordD2"){
			if(char == "("){
				start = i+1;
			} else if(char == ")"){
				d2 = slice(header, start, i);
				state = "search";
			}
		}
	}
	return [cs, d1, d2];
}

function func(data){
	lines = getLines(data);
	for(let line of lines){
		if(line[0] == "#"){
			headerData = parseHeader(line);
			for(let item of headerData){
				console.log(item)
			}
		}
	}

	
}

jQuery.get('http://localhost/hhum206/novel_writing/test.txt', func);
